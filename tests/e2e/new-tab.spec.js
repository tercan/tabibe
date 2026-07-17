import { expect, test, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

test('renders the unpacked new-tab experience without critical accessibility violations', async () => {
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
    expect(manifest.permissions).toEqual(['storage']);
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
    expect(thirdPartyIconRequests).toEqual([]);

    const reducedMotionDuration = await page
      .locator('.speed-dial-card')
      .first()
      .evaluate(
        (element) => Number.parseFloat(getComputedStyle(element).transitionDuration) * 1000,
      );
    expect(reducedMotionDuration).toBeLessThanOrEqual(0.01);

    await page.keyboard.press('Tab');
    const keyboardFocus = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement);
      return {
        tagName: document.activeElement?.tagName,
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(keyboardFocus.tagName).toBeTruthy();
    expect(keyboardFocus.outlineStyle).not.toBe('none');
    expect(keyboardFocus.outlineWidth).toBeGreaterThanOrEqual(2);

    const addSiteButton = page.locator('.speed-dial-toolbar-button').first();
    await addSiteButton.click();
    await expect(page.locator('#site-url')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(addSiteButton).toBeFocused();

    await page.locator('.speed-dial-toolbar-button').last().click();
    const originalFirstItem = await page.locator('.speed-dial-label').first().textContent();
    await page.locator('.speed-dial-action-button').first().click();
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
    await page.locator('.speed-dial-toolbar-button').last().click();

    const notesButton = page.locator('.footer-right > .footer-button').nth(2);
    await notesButton.click();
    await expect(page.locator('.note-panel')).toBeVisible();
    await page.locator('.note-panel-actions .note-panel-button').first().click();
    await page.locator('.note-title-input').fill('E2E note');
    await page.locator('.note-panel-textarea').fill('Persistent note content');
    await expect(page.locator('.note-save-status--saved')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.note-panel')).toHaveCount(0);
    await notesButton.click();
    await expect(page.locator('.note-list-title', { hasText: 'E2E note' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.note-panel')).toHaveCount(0);
    await expect(notesButton).toBeFocused();

    const settingsButton = page.locator('.footer-right > .footer-button').last();
    await settingsButton.click();
    await expect(page.locator('.settings-close')).toBeFocused();
    await expect(page.locator('.settings-about-privacy a')).toHaveAttribute(
      'href',
      'https://tercan.github.io/tabibe/privacy-policy',
    );

    const undersizedTargets = await page.locator('.settings-panel').evaluate((panel) => {
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

    await page.locator('#settings-language').selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    expect(
      await page
        .locator('.settings-panel')
        .evaluate((element) => getComputedStyle(element).direction),
    ).toBe('rtl');

    await page.locator('.settings-close').click();
    await expect(settingsButton).toBeFocused();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.locator('.speed-dial-toolbar-button').nth(1).click();
    await page.locator('#site-name').fill('RTL Folder');
    await page.locator('.modal-button--save').click();
    await page.getByRole('button', { name: 'RTL Folder', exact: true }).click();
    expect(
      await page
        .locator('.folder-modal')
        .evaluate((element) => getComputedStyle(element).direction),
    ).toBe('rtl');
    await page.locator('.folder-modal .settings-close').click();

    const localizedSettingsButton = page.locator('.footer-right > .footer-button').last();
    await localizedSettingsButton.click();
    await page.locator('#settings-language').selectOption('en');
    await page.locator('.settings-close').click();

    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.locator('.footer-left')).toBeHidden();
    await expect(page.locator('.footer-stats-menu')).toBeVisible();
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
