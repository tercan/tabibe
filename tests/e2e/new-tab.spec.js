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
    const thirdPartyIconRequests = [];
    page.on('request', (request) => {
      if (/iconify|simpleicons\.org|google\.com\/s2/u.test(request.url())) {
        thirdPartyIconRequests.push(request.url());
      }
    });
    await context.setOffline(true);
    await page.goto('chrome://newtab/');
    await expect(page.locator('.new-tab')).toBeVisible();
    await expect(page.locator('.speed-dial-grid')).toBeVisible();
    await expect(page.locator('.site-icon')).toHaveCount(18);
    await expect(page.locator('.site-icon[data-icon-source="brand"]')).toHaveCount(16);
    await expect(page.locator('.site-icon[data-icon-source="monogram"]')).toHaveCount(2);
    expect(thirdPartyIconRequests).toEqual([]);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
  } finally {
    await context.close();
  }
});
