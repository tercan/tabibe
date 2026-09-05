import { expect, test, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

test('store archive preserves default search, offline privacy and responsive settings', async () => {
  test.setTimeout(60_000);
  const { version } = JSON.parse(await readFile('package.json', 'utf8'));
  const workspace = await mkdtemp(join(tmpdir(), 'tabibe-archive-qa-'));
  const extensionPath = join(workspace, 'extension');
  await mkdir(extensionPath);
  execFileSync('unzip', ['-q', resolve(`release/tabibe-v${version}.zip`), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext(join(workspace, 'profile'), {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('chrome://newtab/');
    await page.locator('.new-tab').waitFor();
    const extensionUrl = await page.evaluate(() => chrome.runtime.getURL('index.html'));
    expect(await page.evaluate(() => chrome.runtime.getManifest().version)).toBe(version);
    await expect(page.locator('#search-input')).toHaveAttribute(
      'placeholder',
      'Search with your default search engine',
    );
    expect(await page.evaluate(() => typeof chrome.search.query)).toBe('function');
    await context.route('https://**/*', (route) => route.abort());
    const searchRequest = page.waitForRequest(
      (request) => request.isNavigationRequest() && request.url().startsWith('https://'),
    );
    await page.locator('#search-input').fill('tabibe verification 7429');
    await page.locator('#search-input').press('Enter');
    const request = await searchRequest;
    expect(decodeURIComponent(request.url()).replaceAll('+', ' ')).toContain(
      'tabibe verification 7429',
    );
    await context.unroute('https://**/*');
    await page.goto(extensionUrl);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Browser default', exact: true })).toBeChecked();
    await page.getByRole('radio', { name: 'Browser default', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Google', exact: true })).toBeChecked();
    await expect(
      page
        .locator('.settings-radio-modern')
        .filter({ has: page.getByRole('radio', { name: 'Google', exact: true }) }),
    ).toHaveCSS('outline-style', 'solid');
    await page.getByRole('radio', { name: 'DuckDuckGo', exact: true }).check();
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const values = await chrome.storage.local.get('tabibe-state');
          return values['tabibe-state'].settings.searchEngine;
        }),
      )
      .toBe('duckduckgo');
    await page.reload();
    await expect(page.locator('#search-input')).toHaveAttribute('placeholder', /DuckDuckGo/);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('radio', { name: 'Browser default', exact: true }).check();
    for (const width of [1280, 1200, 992, 768, 576, 375, 320]) {
      await page.setViewportSize({ width, height: 800 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
      const options = await page.locator('.settings-radio-modern').evaluateAll((items) =>
        items.map((item) => {
          const rect = item.getBoundingClientRect();
          return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
        }),
      );
      for (const option of options) {
        expect(option.left).toBeGreaterThanOrEqual(0);
        expect(option.right).toBeLessThanOrEqual(width);
        expect(option.width).toBeGreaterThanOrEqual(24);
        expect(option.height).toBeGreaterThanOrEqual(24);
      }
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await context.setOffline(true);
    const privacyUrl = extensionUrl.replace('index.html', 'privacy-policy.html');
    await page.goto(privacyUrl);
    for (const locale of [
      'en',
      'tr',
      'fr',
      'de',
      'it',
      'es',
      'pt',
      'ru',
      'ar',
      'hi',
      'bn',
      'zh',
      'ja',
    ]) {
      await page.locator('#privacy-language').selectOption(locale);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
      await expect(page.locator('#privacy-security-content p')).toHaveCount(2);
      await expect(page.locator('#privacy-limited-content')).not.toBeEmpty();
    }
    await page.locator('#privacy-language').selectOption('tr');
    await page.screenshot({ path: 'test-results/privacy-tr-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'test-results/privacy-tr-desktop.png', fullPage: true });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
