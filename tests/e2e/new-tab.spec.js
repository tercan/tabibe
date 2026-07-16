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
    await page.goto('chrome://newtab/');
    await expect(page.locator('.new-tab')).toBeVisible();
    await expect(page.locator('.speed-dial-grid')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
  } finally {
    await context.close();
  }
});
