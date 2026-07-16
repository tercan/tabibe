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

    const settingsButton = page.locator('.footer-button').last();
    await settingsButton.click();
    await expect(page.locator('.settings-close')).toBeFocused();

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

    await page.keyboard.press('Escape');
    await expect(settingsButton).toBeFocused();

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
