import { expect, test, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['en', 'tr']) {
  test(`GitHub Pages ${locale}: navigation, screenshots, copy feedback and responsive accessibility`, async () => {
    test.setTimeout(60_000);
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const failures = [];
      const externalRequests = [];
      page.on('pageerror', (error) => failures.push(error.message));
      page.on('request', (request) => {
        if (new URL(request.url()).hostname !== '127.0.0.1') externalRequests.push(request.url());
      });
      await page.goto(`http://127.0.0.1:4178/tabibe/${locale === 'tr' ? 'tr/' : ''}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('.languages li')).toHaveCount(13);
      await expect(page.locator('.hero .button--primary')).toHaveAttribute(
        'href',
        'https://github.com/tercan/tabibe/releases/download/v1.5.0/tabibe-v1.5.0.zip',
      );
      expect(
        await page
          .locator('img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image.getAttribute('alt') !== null &&
                image.getAttribute('width') &&
                image.getAttribute('height'),
            ),
          ),
      ).toBe(true);
      for (const width of [1440, 1200, 992, 768, 576, 375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        const nav = page.locator('.site-header nav');
        await expect(nav).toBeVisible();
        for (const link of await nav.locator('a').all()) {
          const box = await link.boundingBox();
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width);
          expect(box.height).toBeGreaterThanOrEqual(24);
        }
      }
      await page.locator('.site-header nav a[href="#install"]').click();
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: async () => {} },
        });
      });
      await page.locator('[data-copy-target]').click();
      await expect(page.locator('#copy-status')).not.toBeEmpty();
      const success = await page.locator('#copy-status').textContent();
      await page.evaluate(() => {
        navigator.clipboard.writeText = async () => {
          throw new Error('Test refusal');
        };
      });
      await page.locator('[data-copy-target]').click();
      await expect(page.locator('#copy-status')).not.toHaveText(success);
      await page.locator('.faq-item summary').first().click();
      await expect(page.locator('.faq-item').first()).toHaveAttribute('open', '');
      for (const screenshot of await page.locator('img').all()) {
        await screenshot.scrollIntoViewIfNeeded();
        await expect(screenshot).toHaveJSProperty('complete', true);
        expect(await screenshot.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
      }
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `test-results/pages-${locale}-mobile.png`, fullPage: true });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({ path: `test-results/pages-${locale}-desktop.png`, fullPage: true });
      for (const link of await page.locator('a[href*="assets/"]').all()) {
        const response = await page.request.get(
          (await link.getAttribute('href'))
            ? new URL(await link.getAttribute('href'), page.url()).href
            : '',
        );
        expect(response.status()).toBe(200);
      }
      expect(failures).toEqual([]);
      expect(externalRequests).toEqual([]);
      await page.locator('.privacy-link a').click();
      await expect(page.locator('#privacy-effective-date')).toHaveAttribute(
        'datetime',
        '2026-09-05',
      );
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
    } finally {
      await browser.close();
    }
  });
}
