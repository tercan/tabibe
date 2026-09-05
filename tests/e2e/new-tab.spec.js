import { expect, test, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

async function getHomeAppearance(page) {
  return page.locator('.new-tab').evaluate((element) => {
    const getBackgroundColor = (selector) =>
      getComputedStyle(document.querySelector(selector)).backgroundColor;

    return {
      actionSurface: getBackgroundColor('.speed-dial-action-button'),
      backgroundKind: element.dataset.backgroundKind,
      borderColor: getComputedStyle(document.querySelector('.search-bar-form')).borderColor,
      customColor: getComputedStyle(element).getPropertyValue('--new-tab-background-color').trim(),
      footerSurface: getBackgroundColor('.footer'),
      iconSurface: getBackgroundColor('.speed-dial-icon-wrapper'),
      labelSurface: getBackgroundColor('.speed-dial-label'),
      pageSurface: getComputedStyle(element).backgroundColor,
      searchSurface: getBackgroundColor('.search-bar-form'),
      toolbarSurface: getBackgroundColor('.speed-dial-toolbar-button'),
    };
  });
}

async function getMoveActionIconLayout(contextMenu) {
  return contextMenu.locator('.context-menu-order-actions').evaluate((element) => {
    const [moveLeftButton, moveRightButton] = element.querySelectorAll('.context-menu-item');
    const getPositions = (button) => {
      const iconBounds = button.querySelector('svg').getBoundingClientRect();
      const labelBounds = button.querySelector('span').getBoundingClientRect();
      return {
        iconLeft: iconBounds.left,
        iconRight: iconBounds.right,
        labelLeft: labelBounds.left,
        labelRight: labelBounds.right,
      };
    };

    return {
      direction: getComputedStyle(element).direction,
      left: getPositions(moveLeftButton),
      right: getPositions(moveRightButton),
      rightLabelDirection: getComputedStyle(moveRightButton.querySelector('span')).direction,
    };
  });
}

test('renders the unpacked new-tab experience without critical accessibility violations', async () => {
  test.setTimeout(60_000);
  const extensionPath = resolve('dist');
  const userDataDir = await mkdtemp(join(tmpdir(), 'tabibe-e2e-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  try {
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const thirdPartyIconRequests = [];
    page.on('request', (request) => {
      if (/iconify|simpleicons\.org|google\.com\/s2/u.test(request.url())) {
        thirdPartyIconRequests.push(request.url());
      }
    });
    await page.goto('chrome://newtab/');

    const manifest = await page.evaluate(() => chrome.runtime.getManifest());
    expect(manifest.permissions).toEqual(['storage', 'search']);
    expect(manifest.optional_permissions).toEqual(
      expect.arrayContaining(['favicon', 'system.memory']),
    );
    expect(manifest.content_security_policy.extension_pages).toContain("connect-src 'self'");

    const cspViolation = await page.evaluate(
      () =>
        new Promise((resolveViolation) => {
          const timeoutId = setTimeout(() => resolveViolation(null), 1500);
          document.addEventListener(
            'securitypolicyviolation',
            (event) => {
              clearTimeout(timeoutId);
              resolveViolation({
                blockedUri: event.blockedURI,
                directive: event.effectiveDirective,
              });
            },
            { once: true },
          );
          fetch('https://example.com/tabibe-csp-probe').catch(() => undefined);
        }),
    );
    expect(cspViolation?.directive).toBe('connect-src');
    expect(cspViolation?.blockedUri).toContain('https://example.com');

    const tabApiResult = await page.evaluate(
      () =>
        new Promise((resolveResult) => {
          chrome.permissions.contains({ permissions: ['tabs'] }, (hasTabsPermission) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const queryError = chrome.runtime.lastError?.message || null;
              chrome.tabs.create({ active: false, url: 'about:blank' }, (createdTab) => {
                const createError = chrome.runtime.lastError?.message || null;
                if (!createdTab?.id) {
                  resolveResult({ hasTabsPermission, queryError, createError, updateError: null });
                  return;
                }

                chrome.tabs.update(createdTab.id, { url: 'about:blank' }, () => {
                  const updateError = chrome.runtime.lastError?.message || null;
                  chrome.tabs.remove(createdTab.id, () => {
                    resolveResult({
                      hasTabsPermission,
                      queryError,
                      createError,
                      updateError,
                      tabs,
                    });
                  });
                });
              });
            });
          });
        }),
    );
    expect(tabApiResult.hasTabsPermission).toBe(false);
    expect(tabApiResult.queryError).toBeNull();
    expect(tabApiResult.createError).toBeNull();
    expect(tabApiResult.updateError).toBeNull();
    expect(tabApiResult.tabs.length).toBeGreaterThan(0);

    await context.setOffline(true);
    await expect(page.locator('.new-tab')).toBeVisible();
    await expect(page.locator('.speed-dial-grid')).toBeVisible();
    await expect(page.locator('.site-icon')).toHaveCount(18);
    await expect(page.locator('.site-icon[data-icon-source="brand"]')).toHaveCount(16);
    await expect(page.locator('.site-icon[data-icon-source="monogram"]')).toHaveCount(2);
    expect(
      await page
        .locator('.site-icon')
        .first()
        .evaluate((element) => getComputedStyle(element).width),
    ).toBe('34px');
    expect(thirdPartyIconRequests).toEqual([]);

    const reducedMotionDuration = await page
      .locator('.speed-dial-card')
      .first()
      .evaluate(
        (element) => Number.parseFloat(getComputedStyle(element).transitionDuration) * 1000,
      );
    expect(reducedMotionDuration).toBeLessThanOrEqual(0.01);

    await page.locator('#search-input').focus();
    await page.keyboard.press('Tab');
    const keyboardFocusTarget = page.locator(':focus-visible');
    for (let focusAttempt = 0; focusAttempt < 5; focusAttempt += 1) {
      if ((await keyboardFocusTarget.count()) === 1) break;
      await page.keyboard.press('Tab');
    }
    await expect(keyboardFocusTarget).toHaveCount(1);
    const keyboardFocus = await keyboardFocusTarget.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        borderColor: style.borderColor,
        boxShadow: style.boxShadow,
        className: element.className,
        id: element.id,
        tagName: element.tagName,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(keyboardFocus.tagName).toBeTruthy();
    expect(keyboardFocus.outlineWidth, JSON.stringify(keyboardFocus)).toBe(0);
    expect(keyboardFocus.borderColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(keyboardFocus.boxShadow).not.toBe('none');

    const searchInput = page.locator('#search-input');
    const searchForm = page.locator('.search-bar-form');
    await searchInput.click();
    await expect(searchInput).toBeFocused();
    await expect(searchInput).toHaveCSS('outline-style', 'none');
    await expect(searchInput).toHaveCSS('border-top-style', 'none');
    await expect(searchInput).toHaveCSS('box-shadow', 'none');
    await expect
      .poll(() =>
        searchForm.evaluate((element) => {
          const style = getComputedStyle(element);
          const colorProbe = document.createElement('span');
          colorProbe.style.color = 'var(--color-primary)';
          document.body.append(colorProbe);
          const primaryColor = getComputedStyle(colorProbe).color;
          colorProbe.remove();

          return (
            element.matches(':focus-within') &&
            style.borderTopColor === primaryColor &&
            style.boxShadow.includes(primaryColor)
          );
        }),
      )
      .toBe(true);

    const addSiteButton = page.locator('.speed-dial-toolbar-button').first();
    await expect(page.locator('.speed-dial-toolbar-button')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Manage', exact: true })).toHaveCount(0);
    await addSiteButton.click();
    await expect(page.locator('#site-url')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(addSiteButton).toBeFocused();

    const originalFirstItem = await page.locator('.speed-dial-label').first().textContent();
    await page.locator('.speed-dial-card').first().hover();
    await page.locator('.speed-dial-action-button').first().click();
    const contextMenu = page.locator('.context-menu');
    await expect(contextMenu).toHaveAttribute('role', 'group');
    for (const actionName of ['Edit', 'Move left', 'Move right', 'Delete']) {
      const actionButton = contextMenu.getByRole('button', { name: actionName, exact: true });
      await expect(actionButton.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    }
    await expect(
      contextMenu
        .getByRole('button', { name: 'Move left', exact: true })
        .locator('.lucide-move-left'),
    ).toHaveCount(1);
    await expect(
      contextMenu
        .getByRole('button', { name: 'Move right', exact: true })
        .locator('.lucide-move-right'),
    ).toHaveCount(1);
    await expect(
      contextMenu.getByRole('button', { name: 'Delete', exact: true }).locator('.lucide-trash-2'),
    ).toHaveCount(1);
    const moveActionIconLayout = await getMoveActionIconLayout(contextMenu);
    expect(moveActionIconLayout.direction).toBe('ltr');
    expect(moveActionIconLayout.left.iconRight).toBeLessThanOrEqual(
      moveActionIconLayout.left.labelLeft,
    );
    expect(moveActionIconLayout.right.iconLeft).toBeGreaterThanOrEqual(
      moveActionIconLayout.right.labelRight,
    );
    await expect(
      page.locator('.context-menu-order-actions .context-menu-item').first(),
    ).toBeDisabled();
    await page.locator('.context-menu-order-actions .context-menu-item').nth(1).click();
    await expect(page.locator('.speed-dial-label').nth(1)).toHaveText(originalFirstItem);
    await expect(page.locator('.speed-dial > .visually-hidden')).not.toBeEmpty();
    await expect(page.locator('.speed-dial-action-button').nth(1)).toBeFocused();
    await page.locator('.speed-dial-action-button').nth(1).click();
    await page.locator('.context-menu-order-actions .context-menu-item').first().click();
    await expect(page.locator('.speed-dial-label').first()).toHaveText(originalFirstItem);

    const takeNoteButton = page.getByRole('button', {
      name: 'Take a note',
      exact: true,
    });
    const notesButton = page.getByRole('button', {
      name: 'Notes',
      exact: true,
    });
    await expect(takeNoteButton.locator('span')).toHaveCount(0);
    await expect(notesButton.locator('span')).toHaveCount(0);
    expect(
      await Promise.all(
        [takeNoteButton, notesButton].map((button) =>
          button.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.width >= 24 && bounds.height >= 24;
          }),
        ),
      ),
    ).toEqual([true, true]);
    await expect(page.getByRole('button', { name: 'Toggle theme', exact: true })).toHaveCount(0);
    const getStoredNotes = () =>
      page.evaluate(
        () =>
          new Promise((resolveNotes) => {
            chrome.storage.local.get('tabibe-state', (result) => {
              resolveNotes(result['tabibe-state']?.notes || []);
            });
          }),
      );
    const getStoredSettings = () =>
      page.evaluate(
        () =>
          new Promise((resolveSettings) => {
            chrome.storage.local.get('tabibe-state', (result) => {
              resolveSettings(result['tabibe-state']?.settings || {});
            });
          }),
      );
    const expectNoHorizontalOverflow = async () => {
      const overflow = await page.evaluate(() => {
        const surface = document.querySelector('.notes-surface');

        return {
          document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          body: document.body.scrollWidth - document.body.clientWidth,
          surface: surface ? surface.scrollWidth - surface.clientWidth : 0,
        };
      });

      expect(overflow.document).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);
      expect(overflow.surface).toBeLessThanOrEqual(1);
    };
    const expectSinglePaneLibrary = async (width) => {
      await page.setViewportSize({ width, height: 720 });

      const surface = page.locator('.notes-surface--library');
      const workspace = surface.locator('.notes-workspace');
      const columnCount = await workspace.evaluate(
        (element) =>
          getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
      );

      expect(columnCount).toBe(1);
      await expect(surface).toHaveAttribute('data-pane', 'list');
      await expect(surface.locator('.notes-library-header')).toBeVisible();
      await expect(surface.locator('.notes-list-pane')).toBeVisible();
      await expect(surface.locator('.notes-editor-pane')).toBeHidden();
      const listToolbar = surface.locator('.notes-list-toolbar');
      const listSearch = surface.getByRole('searchbox', { name: 'Search notes', exact: true });
      await expect(listToolbar).toBeVisible();
      await expect(listSearch).toBeVisible();
      const listToolbarButtons = listToolbar.locator('summary');
      await expect(listToolbarButtons).toHaveCount(2);
      expect(
        await listToolbarButtons.evaluateAll((buttons) =>
          buttons.every((button) => {
            const bounds = button.getBoundingClientRect();
            return bounds.width >= 24 && bounds.height >= 24;
          }),
        ),
      ).toBe(true);
      expect(
        await listSearch.evaluate((input) => {
          const inputBounds = input.getBoundingClientRect();
          const paneBounds = input.closest('.notes-list-pane').getBoundingClientRect();
          return inputBounds.left >= paneBounds.left && inputBounds.right <= paneBounds.right;
        }),
      ).toBe(true);
      const mobileSortButton = listToolbar.getByRole('button', {
        name: 'Sort notes',
        exact: true,
      });
      await mobileSortButton.click();
      const mobileSortPopover = listToolbar.locator('.notes-sort-popover');
      await expect(mobileSortPopover).toBeVisible();
      expect(
        await mobileSortPopover.evaluate((popover) => {
          const bounds = popover.getBoundingClientRect();
          return bounds.left >= 0 && bounds.right <= globalThis.innerWidth;
        }),
      ).toBe(true);
      await page.keyboard.press('Escape');
      await expect(mobileSortPopover).toBeHidden();
      await expect(mobileSortButton).toBeFocused();
      await expectNoHorizontalOverflow();

      await surface.locator('.notes-list-item-button').first().click();

      await expect(surface).toHaveAttribute('data-pane', 'editor');
      await expect(surface.locator('.notes-library-header')).toBeHidden();
      await expect(surface.locator('.notes-list-pane')).toBeHidden();
      await expect(surface.locator('.notes-editor-pane')).toBeVisible();

      await expect(surface.getByRole('textbox', { name: 'Note title', exact: true })).toBeVisible();
      const editorActionButtons = surface.locator('.note-composer-actions .notes-button');
      await expect(editorActionButtons).toHaveCount(4);
      const actionGeometry = await editorActionButtons.evaluateAll((buttons) =>
        buttons.map((button) => {
          const bounds = button.getBoundingClientRect();
          return { height: bounds.height, top: Math.round(bounds.top), width: bounds.width };
        }),
      );
      expect(
        actionGeometry.every(({ height, width: buttonWidth }) => height >= 24 && buttonWidth >= 24),
      ).toBe(true);
      expect(new Set(actionGeometry.map(({ top }) => top)).size).toBe(1);

      const details = surface.locator('.note-composer-details');
      await expect(details.locator('.note-composer-details-row')).toBeVisible();
      await expect(details.locator('summary')).toHaveCount(0);
      await expect(surface.getByRole('button', { name: 'Details', exact: true })).toHaveCount(0);
      const previewButton = details.locator('.note-composer-preview-toggle');
      await previewButton.focus();
      expect(
        await previewButton.evaluate((button) => {
          const buttonBounds = button.getBoundingClientRect();
          const rowBounds = button.closest('.note-composer-details-row').getBoundingClientRect();
          return buttonBounds.left >= rowBounds.left && buttonBounds.right <= rowBounds.right;
        }),
      ).toBe(true);
      await expectNoHorizontalOverflow();

      const backButton = surface.getByRole('button', {
        name: 'Back to note list',
        exact: true,
      });
      await expect(backButton).toBeVisible();
      await backButton.click();

      await expect(surface).toHaveAttribute('data-pane', 'list');
      await expect(surface.locator('.notes-library-header')).toBeVisible();
      await expect(surface.locator('.notes-list-toolbar')).toBeVisible();
      await expectNoHorizontalOverflow();
    };

    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(takeNoteButton).toBeVisible();
    await expect(notesButton).toBeVisible();

    const notesBeforeLibraryOpen = await getStoredNotes();
    expect(notesBeforeLibraryOpen).toHaveLength(12);
    expect(notesBeforeLibraryOpen.filter((note) => !note.isArchived)).toHaveLength(11);
    expect(notesBeforeLibraryOpen.filter((note) => note.isArchived)).toHaveLength(1);
    expect(new Set(notesBeforeLibraryOpen.map((note) => note.id)).size).toBe(12);
    await notesButton.click();

    const librarySurface = page.locator('.notes-surface--library');
    await expect(librarySurface).toBeVisible();
    await expect(librarySurface.locator('.notes-library-header')).toBeVisible();
    await expect(librarySurface.locator('.notes-list-item')).toHaveCount(11);
    await expect(
      librarySurface.locator('.notes-list-item-title').filter({
        hasText: 'Tabibe Notlar’a hoş geldin',
      }),
    ).toHaveText('Tabibe Notlar’a hoş geldin');
    await page.waitForTimeout(600);
    expect((await getStoredNotes()).length).toBe(notesBeforeLibraryOpen.length);

    const libraryBounds = await librarySurface.evaluate((element) => {
      const bounds = element.getBoundingClientRect();

      return {
        top: Math.round(bounds.top),
        left: Math.round(bounds.left),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      };
    });
    expect(libraryBounds).toEqual({
      top: 0,
      left: 0,
      width: 1280,
      height: 720,
    });

    const desktopColumnCount = await librarySurface
      .locator('.notes-workspace')
      .evaluate(
        (element) =>
          getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
      );
    expect(desktopColumnCount).toBe(2);
    await expect(librarySurface.locator('.notes-list-pane')).toBeVisible();
    await expect(librarySurface.locator('.notes-editor-pane')).toBeVisible();

    await expect(
      librarySurface.locator(
        [
          '.note-panel--left',
          '.note-panel--right',
          '.note-panel--fullscreen',
          '.note-template-menu',
          '.note-editor-toolbar',
          '.note-workspace-navigation',
        ].join(', '),
      ),
    ).toHaveCount(0);
    for (const legacyControlName of [
      'Move notes panel to the left',
      'Move notes panel to the right',
      'Pin notes panel',
      'Enter fullscreen',
      'Insert template',
    ]) {
      await expect(
        librarySurface.getByRole('button', {
          name: legacyControlName,
          exact: true,
        }),
      ).toHaveCount(0);
    }

    await librarySurface.getByRole('button', { name: 'Close notes', exact: true }).click();
    await expect(page.locator('.notes-surface')).toHaveCount(0);
    await expect(notesButton).toBeFocused();

    await takeNoteButton.click();

    const captureSurface = page.locator('.notes-surface--capture');
    const captureTextarea = captureSurface.locator('.note-composer-textarea');
    await expect(captureSurface).toBeVisible();
    await expect(captureTextarea).toBeFocused();
    await expect(
      captureSurface.getByRole('textbox', { name: 'Note title', exact: true }),
    ).toBeVisible();
    await page.setViewportSize({ width: 375, height: 480 });
    await expect(captureSurface.locator('.note-composer-details-row')).toBeVisible();
    expect(
      await captureSurface.evaluate((surface) => {
        const surfaceBounds = surface.getBoundingClientRect();
        const visibleBlocks = [
          surface.querySelector('.note-composer-title-input'),
          surface.querySelector('.note-composer-textarea'),
          surface.querySelector('.note-composer-details'),
          surface.querySelector('.note-composer-footer'),
        ];

        return visibleBlocks.every((block) => {
          const bounds = block.getBoundingClientRect();
          return bounds.top >= surfaceBounds.top && bounds.bottom <= surfaceBounds.bottom + 1;
        });
      }),
    ).toBe(true);
    await expectNoHorizontalOverflow();
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(
      captureSurface.getByRole('button', {
        name: 'Open all notes',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      captureSurface.getByRole('button', {
        name: 'Close quick note',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      captureSurface.locator('.note-editor-toolbar, .note-template-menu, [role="toolbar"]'),
    ).toHaveCount(0);

    const capturedContent =
      '# Release checklist\n\n- Confirm backup integrity.\n- Verify restored notes.\n\n1. Publish the package.\n2. Check the store page.\n\n- [ ] Notify the team.';
    await captureTextarea.fill(capturedContent);
    await expect(captureSurface.locator('.note-save-status--saved')).toBeVisible();

    const captureSelection = { start: 2, end: 19 };
    await captureTextarea.evaluate((element, selection) => {
      element.focus();
      element.setSelectionRange(selection.start, selection.end);
      globalThis.tabibeE2eComposerNode = element;
    }, captureSelection);

    const capturedNote = (await getStoredNotes()).find((note) => note.content === capturedContent);
    expect(capturedNote).toBeTruthy();

    await captureSurface.getByRole('button', { name: 'Open all notes', exact: true }).click();
    await expect(librarySurface).toBeVisible();

    const expandedTextarea = librarySurface.locator('.note-composer-textarea');
    await expect(expandedTextarea).toHaveValue(capturedContent);
    expect(
      await expandedTextarea.evaluate((element) => globalThis.tabibeE2eComposerNode === element),
    ).toBe(true);
    expect(
      await expandedTextarea.evaluate((element) => ({
        start: element.selectionStart,
        end: element.selectionEnd,
      })),
    ).toEqual(captureSelection);

    const expandedNote = (await getStoredNotes()).find((note) => note.id === capturedNote.id);
    expect(expandedNote?.id).toBe(capturedNote.id);
    expect(expandedNote?.content).toBe(capturedContent);
    expect((await getStoredNotes()).length).toBe(notesBeforeLibraryOpen.length + 1);

    const capturedListItem = librarySurface.locator('.notes-list-item').filter({
      has: page.locator('.notes-list-item-title').filter({ hasText: 'Release checklist' }),
    });
    await expect(capturedListItem).toBeVisible();
    await expect(capturedListItem.locator('.notes-list-item-title')).toHaveText(
      'Release checklist',
    );
    await expect(capturedListItem.locator('.notes-list-item-notebook')).toHaveText('No notebook');
    await expect(librarySurface.locator('.notes-list-item-excerpt')).toHaveCount(0);
    await expect(librarySurface.locator('.notes-list-item-actions')).toHaveCount(0);

    const libraryHeader = librarySurface.locator('.notes-library-header');
    const listPane = librarySurface.locator('.notes-list-pane');
    const listToolbar = listPane.locator('.notes-list-toolbar');
    const listSearch = listPane.getByRole('searchbox', { name: 'Search notes', exact: true });
    const notesList = listPane.locator('.notes-list');
    await expect(listToolbar).toBeVisible();
    await expect(listSearch).toBeVisible();
    expect(
      await listPane.evaluate((pane) => {
        const toolbarBounds = pane.querySelector('.notes-list-toolbar').getBoundingClientRect();
        const searchBounds = pane.querySelector('.notes-list-search-wrap').getBoundingClientRect();
        const listBounds = pane.querySelector('.notes-list').getBoundingClientRect();
        return (
          toolbarBounds.bottom <= searchBounds.top + 1 && searchBounds.bottom <= listBounds.top + 1
        );
      }),
    ).toBe(true);
    await expect(notesList).toBeVisible();
    await expect(libraryHeader.getByRole('searchbox', { name: 'Search notes' })).toHaveCount(0);
    await expect(libraryHeader.getByRole('button', { name: 'Note filter' })).toHaveCount(0);
    await expect(libraryHeader.getByRole('button', { name: 'Sort notes' })).toHaveCount(0);

    const filterButton = listToolbar.getByRole('button', {
      name: 'Note filter',
      exact: true,
    });
    const sortToolbarButton = listToolbar.getByRole('button', {
      name: 'Sort notes',
      exact: true,
    });
    await expect(filterButton).toHaveCSS('cursor', 'pointer');
    await expect(sortToolbarButton).toHaveCSS('cursor', 'pointer');
    await filterButton.click();
    await expect(listToolbar.getByRole('button', { name: 'All Notes', exact: true })).toBeVisible();
    await expect(listToolbar.getByRole('button', { name: 'Pinned', exact: true })).toBeVisible();
    await expect(listToolbar.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
    await expect(listToolbar.getByText('Date range', { exact: true })).toHaveCount(0);
    await expect(listToolbar.getByText('Tags', { exact: true })).toHaveCount(0);
    await expect(listToolbar.getByRole('combobox')).toHaveCount(1);
    await listToolbar.getByRole('button', { name: 'Archive', exact: true }).click();
    await expect(librarySurface.locator('.notes-list-item')).toHaveCount(1);
    await filterButton.click();
    await listToolbar.getByRole('button', { name: 'All Notes', exact: true }).click();
    await expect(librarySurface.locator('.notes-list-item')).toHaveCount(12);

    const sortButton = listToolbar.getByRole('button', {
      name: 'Sort notes',
      exact: true,
    });
    await sortButton.click();
    const recentlyCreatedButton = listToolbar.getByRole('button', {
      name: 'Recently created',
      exact: true,
    });
    await expect(recentlyCreatedButton).toBeVisible();
    await recentlyCreatedButton.click();
    await expect(listToolbar.locator('.notes-sort-popover')).toBeHidden();
    await sortButton.click();
    await expect(recentlyCreatedButton).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(sortButton).toBeFocused();

    await capturedListItem.locator('.notes-list-item-button').click();

    const headerMoreButton = libraryHeader.getByRole('button', {
      name: 'More actions',
      exact: true,
    });
    await headerMoreButton.click();
    await expect(
      libraryHeader.getByRole('button', {
        name: 'Recently created',
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      libraryHeader.getByRole('button', {
        name: 'Manage notebooks',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      libraryHeader.getByRole('button', {
        name: 'Manage tags',
        exact: true,
      }),
    ).toBeVisible();
    await listSearch.click();
    await expect(
      libraryHeader.getByRole('button', {
        name: 'Manage notebooks',
        exact: true,
      }),
    ).toBeHidden();

    const editorActions = librarySurface.locator('.note-composer-header-actions');
    await expect(editorActions.getByRole('button')).toHaveCount(4);
    await expect(
      editorActions.getByRole('button', { name: 'Pin note', exact: true }),
    ).toBeVisible();
    await expect(
      editorActions.getByRole('button', { name: 'Archive note', exact: true }),
    ).toBeVisible();
    await expect(
      editorActions.getByRole('button', { name: 'Copy note text', exact: true }),
    ).toBeVisible();
    await expect(
      editorActions.getByRole('button', { name: 'Delete note', exact: true }),
    ).toBeVisible();
    await expect(
      editorActions.getByRole('button', { name: 'More actions', exact: true }),
    ).toHaveCount(0);

    const titleInput = librarySurface.getByRole('textbox', {
      name: 'Note title',
      exact: true,
    });
    await expect(titleInput).toBeVisible();

    const detailsRow = librarySurface.locator('.note-composer-details-row');
    await expect(detailsRow).toBeVisible();
    await expect(librarySurface.locator('.note-composer-details summary')).toHaveCount(0);
    await expect(librarySurface.getByRole('button', { name: 'Details', exact: true })).toHaveCount(
      0,
    );
    await expect(detailsRow.getByRole('textbox', { name: 'Note title' })).toHaveCount(0);
    await expect(detailsRow.locator('.note-composer-details-group')).toHaveCount(2);
    const previewButton = detailsRow.getByRole('button', {
      name: 'Show preview',
      exact: true,
    });
    expect(await previewButton.evaluate((button) => button.textContent.trim())).toBe('');
    const editorBackgrounds = await librarySurface.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--color-background)';
      document.querySelector('.note-composer-body').append(probe);
      const result = {
        details: getComputedStyle(document.querySelector('.note-composer-details')).backgroundColor,
        expected: getComputedStyle(probe).backgroundColor,
        noteArea: getComputedStyle(document.querySelector('.note-composer-textarea-wrap'))
          .backgroundColor,
        title: getComputedStyle(document.querySelector('.note-composer-title-input'))
          .backgroundColor,
      };

      probe.remove();
      return result;
    });
    expect(editorBackgrounds.title).toBe(editorBackgrounds.expected);
    expect(editorBackgrounds.noteArea).toBe(editorBackgrounds.expected);
    expect(editorBackgrounds.details).toBe(editorBackgrounds.expected);
    expect(
      await detailsRow
        .locator('.note-composer-details-group--view')
        .evaluate((group) => Number.parseFloat(getComputedStyle(group).borderInlineStartWidth)),
    ).toBeGreaterThanOrEqual(1);
    expect(
      await librarySurface.evaluate(() => {
        const title = document.querySelector('.note-composer-title-input');
        const textarea = document.querySelector('.note-composer-textarea');
        const details = document.querySelector('.note-composer-details');
        const row = document.querySelector('.note-composer-details-row');
        const titleRect = title.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();
        const detailsRect = details.getBoundingClientRect();
        const rowStyle = getComputedStyle(row);

        return (
          titleRect.bottom <= textareaRect.top + 1 &&
          textareaRect.bottom <= detailsRect.top + 1 &&
          rowStyle.display === 'flex' &&
          rowStyle.flexWrap === 'nowrap' &&
          rowStyle.position === 'static'
        );
      }),
    ).toBe(true);

    await previewButton.click();
    const preview = librarySurface.locator('.note-composer-preview');
    await expect(preview).toBeVisible();
    await expect(
      detailsRow.getByRole('button', { name: 'Return to editing', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    const previewListStyles = await preview.evaluate((element) => ({
      ordered: getComputedStyle(element.querySelector('ol')).listStyleType,
      task: getComputedStyle(element.querySelector('.contains-task-list')).listStyleType,
      unordered: getComputedStyle(element.querySelector('ul:not(.contains-task-list)'))
        .listStyleType,
    }));
    expect(previewListStyles).toEqual({ ordered: 'decimal', task: 'none', unordered: 'disc' });
    await detailsRow.getByRole('button', { name: 'Return to editing', exact: true }).click();
    await expect(expandedTextarea).toBeVisible();

    const accessibilityScan = await new AxeBuilder({ page }).include('.notes-surface').analyze();
    expect(accessibilityScan.violations).toEqual([]);

    await expandedTextarea.focus();
    await expandedTextarea.press('Control+Enter');
    await expect(page.locator('.notes-surface')).toHaveCount(0);
    await expect(takeNoteButton).toBeFocused();

    const shortcutContents = ['First shortcut note', 'Second shortcut note'];
    await page.keyboard.press('Alt+Shift+N');

    const shortcutSurface = page.locator('.notes-surface--capture');
    const shortcutTextarea = shortcutSurface.locator('.note-composer-textarea');
    await expect(shortcutTextarea).toBeFocused();
    await shortcutTextarea.fill(shortcutContents[0]);
    await expect(shortcutSurface.locator('.note-save-status--saved')).toBeVisible();
    await expect
      .poll(async () =>
        (await getStoredNotes()).some((note) => note.content === shortcutContents[0]),
      )
      .toBe(true);

    await page.keyboard.press('Alt+Shift+N');
    await expect(shortcutTextarea).toBeFocused();
    await expect(shortcutTextarea).toHaveValue('');
    await shortcutTextarea.fill(shortcutContents[1]);
    await expect(shortcutSurface.locator('.note-save-status--saved')).toBeVisible();
    await shortcutTextarea.press('Control+Enter');
    await expect(page.locator('.notes-surface')).toHaveCount(0);

    await expect
      .poll(async () => {
        const shortcutNotes = (await getStoredNotes()).filter((note) =>
          shortcutContents.includes(note.content),
        );

        return {
          count: shortcutNotes.length,
          uniqueIds: new Set(shortcutNotes.map((note) => note.id)).size,
        };
      })
      .toEqual({ count: 2, uniqueIds: 2 });

    await notesButton.click();
    await expect(librarySurface).toBeVisible();

    await expectSinglePaneLibrary(375);
    await expectSinglePaneLibrary(320);

    await librarySurface.getByRole('button', { name: 'Close notes', exact: true }).click();
    await expect(page.locator('.notes-surface')).toHaveCount(0);
    await expect(notesButton).toBeFocused();

    await page.setViewportSize({ width: 1280, height: 720 });

    const settingsButton = page.locator('.footer-right > button.footer-button').last();
    await settingsButton.click();
    const settingsPanel = page.locator('.settings-panel');
    await expect(settingsPanel.locator('.settings-close')).toBeFocused();
    const settingsFocusStyle = await settingsPanel
      .locator('.settings-close')
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          borderColor: style.borderColor,
          outlineWidth: style.outlineWidth,
        };
      });
    expect(settingsFocusStyle.outlineWidth).toBe('0px');
    expect(settingsFocusStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');
    const privacyPolicyLink = settingsPanel.locator('.settings-about-privacy a');
    await expect(privacyPolicyLink).toHaveAttribute('href', 'privacy-policy.html?lang=en');
    expect(
      await settingsPanel.evaluate((element) => Number.parseFloat(getComputedStyle(element).width)),
    ).toBeGreaterThanOrEqual(544);
    const settingsSurfaceColors = await settingsPanel.evaluate((element) => ({
      body: getComputedStyle(element.querySelector('.settings-body')).backgroundColor,
      header: getComputedStyle(element.querySelector('.settings-header')).backgroundColor,
    }));
    expect(settingsSurfaceColors.header).not.toBe(settingsSurfaceColors.body);

    const settingsFooterMetrics = await settingsPanel.evaluate((element) => {
      const bodyBounds = element.querySelector('.settings-body').getBoundingClientRect();
      const footerBounds = element.querySelector('.settings-about').getBoundingClientRect();
      const panelBounds = element.getBoundingClientRect();
      return {
        bodyBottom: bodyBounds.bottom,
        footerBottom: footerBounds.bottom,
        footerTop: footerBounds.top,
        panelBottom: panelBounds.bottom,
      };
    });
    expect(settingsFooterMetrics.footerTop).toBeCloseTo(settingsFooterMetrics.bodyBottom, 0);
    expect(settingsFooterMetrics.footerBottom).toBeCloseTo(settingsFooterMetrics.panelBottom, 0);

    const iconStyleButton = settingsPanel.locator('.settings-header-button--icon-style');
    const themeButton = settingsPanel.locator('.settings-header-button--theme');
    const languageTrigger = settingsPanel.locator('.settings-language-trigger');
    await expect(iconStyleButton).toBeVisible();
    await expect(themeButton).toHaveAccessibleName('Toggle theme');
    expect(
      await settingsPanel.locator('.settings-header-actions > *').evaluateAll((elements) =>
        elements.map((element) => {
          if (element.classList.contains('settings-header-button--icon-style')) return 'icon-style';
          if (element.classList.contains('settings-header-button--theme')) return 'theme';
          if (element.classList.contains('settings-language-menu')) return 'language';
          return 'close';
        }),
      ),
    ).toEqual(['icon-style', 'theme', 'language', 'close']);

    const initialIconStylePressed = await iconStyleButton.getAttribute('aria-pressed');
    await iconStyleButton.click();
    await expect(iconStyleButton).toHaveAttribute(
      'aria-pressed',
      initialIconStylePressed === 'true' ? 'false' : 'true',
    );
    await iconStyleButton.click();
    await expect(iconStyleButton).toHaveAttribute('aria-pressed', initialIconStylePressed);

    const initialTheme = await page.locator('html').getAttribute('data-theme');
    await themeButton.click();
    await expect.poll(() => page.locator('html').getAttribute('data-theme')).not.toBe(initialTheme);
    await themeButton.click();
    await expect.poll(() => page.locator('html').getAttribute('data-theme')).toBe(initialTheme);

    await expect(languageTrigger).toHaveAttribute('title', 'English');
    await expect(languageTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(settingsPanel.locator('.settings-header .settings-language-flag')).toHaveCount(1);
    await expect(settingsPanel.locator('.settings-body .settings-language-flag')).toHaveCount(0);
    const languageOptions = settingsPanel.locator('.settings-language-option');
    await expect(languageOptions).toHaveCount(0);
    await languageTrigger.click();
    await expect(languageTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(languageOptions).toHaveCount(12);
    await expect(settingsPanel.getByRole('button', { name: 'English', exact: true })).toHaveCount(
      0,
    );
    await expect(settingsPanel.getByRole('button', { name: 'Türkçe', exact: true })).toBeVisible();
    expect(
      new Set(
        await languageOptions.evaluateAll((options) =>
          options.map((option) => Math.round(option.getBoundingClientRect().top)),
        ),
      ).size,
    ).toBe(2);
    await page.keyboard.press('Escape');
    await expect(languageOptions).toHaveCount(0);
    await expect(languageTrigger).toBeFocused();

    await expect(
      settingsPanel.getByRole('heading', { level: 3, name: 'Home Screen' }),
    ).toBeVisible();
    const settingsHeadingColors = await settingsPanel.evaluate((element) => ({
      heading: getComputedStyle(element.querySelector('.settings-group-title')).color,
      label: getComputedStyle(element.querySelector('.settings-toggle-label')).color,
    }));
    expect(settingsHeadingColors.heading).not.toBe(settingsHeadingColors.label);

    const searchEngineOptions = settingsPanel.locator(
      '.settings-options--search-engines .settings-radio-modern',
    );
    await expect(searchEngineOptions).toHaveCount(5);
    expect(
      new Set(
        await searchEngineOptions.evaluateAll((options) =>
          options.map((option) => Math.round(option.getBoundingClientRect().top)),
        ),
      ).size,
    ).toBe(2);

    const siteIconToggle = settingsPanel.locator('.settings-toggle--described');
    await expect(siteIconToggle.getByRole('checkbox', { name: /Show site icons/ })).toBeVisible();
    const siteIconTextMetrics = await siteIconToggle.evaluate((element) => {
      const label = element.querySelector('.settings-toggle-label');
      const description = element.querySelector('.settings-toggle-description');
      return {
        descriptionFontSize: Number.parseFloat(getComputedStyle(description).fontSize),
        descriptionTop: description.getBoundingClientRect().top,
        labelBottom: label.getBoundingClientRect().bottom,
        labelFontSize: Number.parseFloat(getComputedStyle(label).fontSize),
      };
    });
    expect(siteIconTextMetrics.descriptionFontSize).toBeLessThan(siteIconTextMetrics.labelFontSize);
    expect(siteIconTextMetrics.descriptionTop).toBeGreaterThanOrEqual(
      siteIconTextMetrics.labelBottom,
    );
    const toggleThumbPosition = await siteIconToggle.getByRole('checkbox').evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return {
        insetInlineStart: Number.parseFloat(style.insetInlineStart),
        top: Number.parseFloat(style.top),
      };
    });
    expect(toggleThumbPosition.top).toBe(1);
    expect(toggleThumbPosition.insetInlineStart).toBe(1);

    const backgroundSwatches = settingsPanel.locator('.settings-bg-swatch');
    const desktopSwatchSize = await backgroundSwatches.first().evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { height: bounds.height, width: bounds.width };
    });
    expect(desktopSwatchSize.width).toBeGreaterThanOrEqual(24);
    expect(desktopSwatchSize.width).toBeLessThanOrEqual(32);
    expect(desktopSwatchSize.height).toBeCloseTo(desktopSwatchSize.width, 1);
    const backgroundGroups = settingsPanel.locator('.settings-bg-group');
    await expect(backgroundGroups).toHaveCount(2);
    expect(
      new Set(
        await backgroundGroups.evaluateAll((groups) =>
          groups.map((group) => Math.round(group.getBoundingClientRect().top)),
        ),
      ).size,
    ).toBe(1);
    expect(
      await backgroundGroups
        .nth(1)
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).borderInlineStartWidth)),
    ).toBeGreaterThanOrEqual(1);

    const defaultHomeAppearance = await getHomeAppearance(page);
    expect(defaultHomeAppearance.backgroundKind).toBe('default');

    await settingsPanel.locator('.settings-bg-swatch[title="#e3f2fd"]').click();
    await expect(page.locator('.new-tab')).toHaveAttribute('data-background-kind', 'color');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect.poll(async () => (await getStoredSettings()).backgroundColor).toBe('#e3f2fd');
    const lightHomeAppearance = await getHomeAppearance(page);
    expect(lightHomeAppearance.customColor).toBe('#e3f2fd');
    expect(lightHomeAppearance.pageSurface).toBe('rgb(227, 242, 253)');
    expect(
      new Set([
        lightHomeAppearance.actionSurface,
        lightHomeAppearance.iconSurface,
        lightHomeAppearance.labelSurface,
        lightHomeAppearance.searchSurface,
        lightHomeAppearance.toolbarSurface,
      ]).size,
    ).toBe(1);
    expect(lightHomeAppearance.searchSurface).not.toBe(lightHomeAppearance.pageSurface);
    expect(lightHomeAppearance.searchSurface).not.toBe(defaultHomeAppearance.searchSurface);
    expect(lightHomeAppearance.footerSurface).not.toBe(defaultHomeAppearance.footerSurface);
    expect(lightHomeAppearance.borderColor).not.toBe(defaultHomeAppearance.borderColor);
    await expect(settingsPanel.locator('.settings-body')).toHaveCSS(
      'background-color',
      settingsSurfaceColors.body,
    );

    await settingsPanel.locator('.settings-bg-swatch[title="#1b5e20"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(async () => (await getStoredSettings()).backgroundColor).toBe('#1b5e20');
    const darkHomeAppearance = await getHomeAppearance(page);
    expect(darkHomeAppearance.customColor).toBe('#1b5e20');
    expect(darkHomeAppearance.pageSurface).toBe('rgb(27, 94, 32)');
    expect(
      new Set([
        darkHomeAppearance.actionSurface,
        darkHomeAppearance.iconSurface,
        darkHomeAppearance.labelSurface,
        darkHomeAppearance.searchSurface,
        darkHomeAppearance.toolbarSurface,
      ]).size,
    ).toBe(1);
    expect(darkHomeAppearance.searchSurface).not.toBe(lightHomeAppearance.searchSurface);
    expect(darkHomeAppearance.footerSurface).not.toBe(lightHomeAppearance.footerSurface);
    expect(darkHomeAppearance.borderColor).not.toBe(lightHomeAppearance.borderColor);

    const dataActionButtons = settingsPanel.locator('.settings-data-actions .modal-button');
    await expect(dataActionButtons).toHaveCount(2);
    await expect(dataActionButtons.nth(0).locator('svg')).toHaveCount(1);
    await expect(dataActionButtons.nth(1).locator('svg')).toHaveCount(1);
    const backgroundActionButtons = settingsPanel.locator(
      '.settings-bg-groups + .settings-bg-actions .modal-button',
    );
    await expect(backgroundActionButtons).toHaveCount(2);
    await expect(backgroundActionButtons.nth(0).locator('svg')).toHaveCount(1);
    await expect(backgroundActionButtons.nth(1).locator('svg')).toHaveCount(1);

    await page.setViewportSize({ width: 375, height: 800 });
    await expect(settingsPanel).toHaveCSS('width', '375px');
    expect(
      new Set(
        await searchEngineOptions.evaluateAll((options) =>
          options.map((option) => Math.round(option.getBoundingClientRect().top)),
        ),
      ).size,
    ).toBe(2);
    await languageTrigger.click();
    await expect(languageOptions).toHaveCount(12);
    expect(
      new Set(
        await languageOptions.evaluateAll((options) =>
          options.map((option) => Math.round(option.getBoundingClientRect().top)),
        ),
      ).size,
    ).toBe(2);
    const mobileLanguageMenuBounds = await settingsPanel.evaluate((element) => {
      const menuBounds = element
        .querySelector('.settings-language-options')
        .getBoundingClientRect();
      const panelBounds = element.getBoundingClientRect();
      return {
        menuLeft: menuBounds.left,
        menuRight: menuBounds.right,
        panelLeft: panelBounds.left,
        panelRight: panelBounds.right,
      };
    });
    expect(mobileLanguageMenuBounds.menuLeft).toBeGreaterThanOrEqual(
      mobileLanguageMenuBounds.panelLeft,
    );
    expect(mobileLanguageMenuBounds.menuRight).toBeLessThanOrEqual(
      mobileLanguageMenuBounds.panelRight,
    );
    await languageTrigger.click();
    await expect(languageOptions).toHaveCount(0);
    expect(
      new Set(
        await backgroundGroups.evaluateAll((groups) =>
          groups.map((group) => Math.round(group.getBoundingClientRect().top)),
        ),
      ).size,
    ).toBe(1);
    expect(
      await backgroundSwatches.first().evaluate((element) => element.getBoundingClientRect().width),
    ).toBeGreaterThanOrEqual(24);
    expect(
      await settingsPanel.evaluate((element) => {
        const footerBounds = element.querySelector('.settings-about').getBoundingClientRect();
        return Math.abs(footerBounds.bottom - element.getBoundingClientRect().bottom);
      }),
    ).toBeLessThanOrEqual(1);
    expect(
      await settingsPanel.evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    await page.setViewportSize({ width: 320, height: 720 });
    await expect(settingsPanel).toHaveCSS('width', '320px');
    expect(
      await settingsPanel.evaluate((element) => {
        const header = element.querySelector('.settings-header');
        return header.scrollWidth <= header.clientWidth;
      }),
    ).toBe(true);
    await page.setViewportSize({ width: 1280, height: 720 });

    const undersizedTargets = await settingsPanel.evaluate((panel) => {
      const controls = [
        ...panel.querySelectorAll('button, a[href], select, textarea'),
        ...panel.querySelectorAll('label:has(input)'),
        ...[...panel.querySelectorAll('input')].filter((input) => !input.closest('label')),
      ];

      return controls
        .filter((control) => {
          const style = getComputedStyle(control);
          const rect = control.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0;
        })
        .map((control) => {
          const rect = control.getBoundingClientRect();
          return {
            label: control.getAttribute('aria-label') || control.textContent.trim(),
            width: rect.width,
            height: rect.height,
          };
        })
        .filter(({ width, height }) => width < 24 || height < 24);
    });
    expect(undersizedTargets).toEqual([]);

    await languageTrigger.click();
    const settingsAccessibility = await new AxeBuilder({ page })
      .include('.settings-panel')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      settingsAccessibility.violations.filter((violation) =>
        ['critical', 'serious'].includes(violation.impact),
      ),
    ).toEqual([]);
    await languageTrigger.click();

    await languageTrigger.click();
    await settingsPanel.locator('.settings-language-option[title="Français"]').click();
    await expect(languageOptions).toHaveCount(0);
    await expect(languageTrigger).toHaveAttribute('title', 'Français');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(settingsPanel.getByRole('heading', { level: 2 })).toHaveText('Paramètres');
    await expect(privacyPolicyLink).toHaveAttribute('href', 'privacy-policy.html?lang=fr');

    await languageTrigger.click();
    await settingsPanel.locator('.settings-language-option[title="العربية"]').click();
    await expect(languageOptions).toHaveCount(0);
    await expect(languageTrigger).toHaveAttribute('title', 'العربية');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(privacyPolicyLink).toHaveAttribute('href', 'privacy-policy.html?lang=ar');
    expect(
      await page
        .locator('.settings-panel')
        .evaluate((element) => getComputedStyle(element).direction),
    ).toBe('rtl');

    const privacyPagePromise = context.waitForEvent('page');
    await privacyPolicyLink.click();
    const privacyPage = await privacyPagePromise;
    await privacyPage.waitForLoadState('domcontentloaded');
    await expect(privacyPage).toHaveURL(/privacy-policy\.html\?lang=ar$/);
    await expect(privacyPage.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(privacyPage.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(privacyPage.getByRole('heading', { level: 1 })).toHaveText('سياسة الخصوصية');
    await privacyPage.locator('#privacy-language').selectOption('fr');
    await expect(privacyPage).toHaveURL(/privacy-policy\.html\?lang=fr$/);
    await expect(privacyPage.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(privacyPage.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(privacyPage.getByRole('heading', { level: 1 })).toHaveText(
      'Politique de confidentialité',
    );
    await privacyPage.locator('#privacy-language').selectOption('tr');
    await expect(privacyPage).toHaveURL(/privacy-policy\.html\?lang=tr$/);
    await expect(privacyPage.locator('html')).toHaveAttribute('lang', 'tr');
    await expect(privacyPage.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(privacyPage.getByRole('heading', { level: 1 })).toHaveText('Gizlilik Politikası');
    await expect(privacyPage.getByText('Cihazınızda saklanan veriler')).toBeVisible();
    const privacyAccessibility = await new AxeBuilder({ page: privacyPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      privacyAccessibility.violations.filter((violation) =>
        ['critical', 'serious'].includes(violation.impact),
      ),
    ).toEqual([]);
    await privacyPage.close();

    await page.locator('.settings-close').click();
    await expect(settingsButton).toBeFocused();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.new-tab')).toHaveAttribute('data-background-kind', 'color');
    const persistedHomeAppearance = await getHomeAppearance(page);
    expect(persistedHomeAppearance.customColor).toBe('#1b5e20');
    expect(persistedHomeAppearance.searchSurface).toBe(persistedHomeAppearance.iconSurface);
    expect(persistedHomeAppearance.footerSurface).toBe(darkHomeAppearance.footerSurface);

    const rtlOriginalItemLabel = page
      .locator('.speed-dial-label')
      .filter({ hasText: new RegExp(`^${originalFirstItem}$`, 'u') })
      .first();
    const rtlOriginalItemCard = rtlOriginalItemLabel.locator('..').locator('..');
    const rtlStartX = await rtlOriginalItemCard.evaluate(
      (element) => element.getBoundingClientRect().x,
    );
    await rtlOriginalItemCard.hover();
    await rtlOriginalItemCard.locator('.speed-dial-action-button').click();
    const rtlOrderButtons = page.locator('.context-menu-order-actions .context-menu-item');
    const rtlMoveActionIconLayout = await getMoveActionIconLayout(page.locator('.context-menu'));
    expect(rtlMoveActionIconLayout.direction).toBe('ltr');
    expect(rtlMoveActionIconLayout.rightLabelDirection).toBe('rtl');
    expect(rtlMoveActionIconLayout.left.iconRight).toBeLessThanOrEqual(
      rtlMoveActionIconLayout.left.labelLeft,
    );
    expect(rtlMoveActionIconLayout.right.iconLeft).toBeGreaterThanOrEqual(
      rtlMoveActionIconLayout.right.labelRight,
    );
    await expect(rtlOrderButtons.first()).toBeEnabled();
    await expect(rtlOrderButtons.nth(1)).toBeDisabled();
    await expect(rtlOrderButtons.first().locator('.lucide-move-left')).toHaveCount(1);
    await rtlOrderButtons.first().click();
    const rtlMovedLeftX = await rtlOriginalItemCard.evaluate(
      (element) => element.getBoundingClientRect().x,
    );
    expect(rtlMovedLeftX).toBeLessThan(rtlStartX);

    await rtlOriginalItemCard.hover();
    await rtlOriginalItemCard.locator('.speed-dial-action-button').click();
    await expect(rtlOrderButtons.nth(1)).toBeEnabled();
    await expect(rtlOrderButtons.nth(1).locator('.lucide-move-right')).toHaveCount(1);
    await rtlOrderButtons.nth(1).click();
    const rtlRestoredX = await rtlOriginalItemCard.evaluate(
      (element) => element.getBoundingClientRect().x,
    );
    expect(rtlRestoredX).toBeCloseTo(rtlStartX, 0);

    await page.locator('.speed-dial-toolbar-button').nth(1).click();
    await page.locator('#site-name').fill('RTL Folder');
    await page.locator('.modal-button--save').click();
    const rtlFolderButton = page.getByRole('button', { name: 'RTL Folder', exact: true });
    await expect(rtlFolderButton.locator('.speed-dial-folder-count')).toHaveText('0');
    const rtlFolderCard = page.locator('.speed-dial-folder').filter({ has: rtlFolderButton });
    await rtlFolderCard.hover();
    await rtlFolderCard.locator('.speed-dial-action-button').click();
    await expect(
      page.locator('.context-menu .context-menu-item svg[aria-hidden="true"]'),
    ).toHaveCount(4);
    await expect(page.locator('.context-menu .lucide-pencil')).toHaveCount(1);
    await expect(page.locator('.context-menu .lucide-trash-2')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.context-menu')).toHaveCount(0);
    const folderSurface = await rtlFolderButton
      .locator('.speed-dial-icon--folder')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    const siteSurface = await page
      .locator('.speed-dial-icon-wrapper:not(.speed-dial-icon--folder)')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(folderSurface).not.toBe(siteSurface);
    await rtlFolderButton.click();
    expect(
      await page
        .locator('.folder-modal')
        .evaluate((element) => getComputedStyle(element).direction),
    ).toBe('rtl');
    await page.locator('.folder-modal .settings-close').click();

    const localizedSettingsButton = page.locator('.footer-right > .footer-button').last();
    await localizedSettingsButton.click();
    await page.locator('.settings-language-trigger').click();
    await page.locator('.settings-language-option[title="English"]').click();
    await expect(page.locator('.settings-language-trigger')).toHaveAttribute('title', 'English');
    await page.locator('.settings-close').click();

    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.locator('.footer-left')).toBeHidden();
    await expect(page.locator('.footer-stats-menu')).toBeVisible();
    await expect(page.locator('.speed-dial-action-button').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('.speed-dial-action-button').first()).toHaveCSS(
      'pointer-events',
      'auto',
    );
    await page.setViewportSize({ width: 320, height: 720 });
    await page.locator('.speed-dial-action-button').first().click();
    const mobileContextMenuMetrics = await page.locator('.context-menu').evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const actionTargets = [...element.querySelectorAll('.context-menu-item')].map((item) => {
        const itemBounds = item.getBoundingClientRect();
        return { height: itemBounds.height, width: itemBounds.width };
      });

      return {
        actionTargets,
        left: bounds.left,
        right: bounds.right,
        viewportWidth: window.innerWidth,
        withoutOverflow: element.scrollWidth <= element.clientWidth,
      };
    });
    expect(mobileContextMenuMetrics.left).toBeGreaterThanOrEqual(0);
    expect(mobileContextMenuMetrics.right).toBeLessThanOrEqual(
      mobileContextMenuMetrics.viewportWidth,
    );
    expect(mobileContextMenuMetrics.withoutOverflow).toBe(true);
    expect(
      mobileContextMenuMetrics.actionTargets.every(
        ({ height, width }) => height >= 24 && width >= 24,
      ),
    ).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('.context-menu')).toHaveCount(0);
    await page.setViewportSize({ width: 1280, height: 720 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(
      results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact)),
    ).toEqual([]);
  } finally {
    await context.close();
  }
});
