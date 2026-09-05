import { expect, test, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['en', 'tr']) {
  test(`Faithful Pages ${locale}: original layout, appearance slides, navigation and accessibility`, async () => {
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
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`http://127.0.0.1:4178/tabibe/${locale === 'tr' ? 'tr/' : ''}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1 span')).not.toBeEmpty();
      await expect(page.locator('.logo-icon svg')).toHaveCount(1);
      await expect(page.locator('.language-link')).toHaveText(locale === 'en' ? 'TR' : 'EN');
      await expect(page.locator('.github-link')).toHaveAttribute(
        'href',
        'https://github.com/tercan/tabibe',
      );
      await expect(page.locator('.hero-content .hero-stats dd')).toHaveText([
        '13',
        '4',
        locale === 'tr' ? '%100' : '100%',
      ]);
      expect(
        await page.locator('main > section').evaluateAll((items) => items.map((item) => item.id)),
      ).toEqual(['hero', 'features', 'philosophy', 'tech', 'languages', 'install']);
      await expect(page.locator('#features .card')).toHaveCount(9);
      await expect(page.locator('#philosophy .card')).toHaveCount(4);
      await expect(page.locator('#tech .card')).toHaveCount(5);
      await expect(page.locator('.languages li')).toHaveCount(13);
      await expect(page.locator('.hero .button--primary')).toHaveAttribute(
        'href',
        'https://github.com/tercan/tabibe/releases/download/v1.5.0/tabibe-v1.5.0.zip',
      );
      const carousel = page.locator('[data-carousel]');
      await expect(carousel).toHaveAttribute('data-ready', 'true');
      await expect(carousel).toHaveAttribute('data-active-index', '0');
      await expect(carousel.locator('[data-play]')).toBeDisabled();
      await carousel.locator('[data-next]').focus();
      await page.keyboard.press('Enter');
      await expect(carousel).toHaveAttribute('data-active-index', '1');
      await expect(carousel.locator('.hero-slide[aria-hidden="false"]')).toHaveCount(1);
      await expect(carousel.locator('.hero-slide').first()).toHaveAttribute('inert', '');
      await expect(carousel.locator('[data-next]')).toBeFocused();
      await expect
        .poll(() =>
          carousel
            .locator('.is-active img')
            .evaluate((image) => image.complete && image.naturalWidth > 0),
        )
        .toBe(true);
      await page.screenshot({ path: `test-results/faithful-${locale}-light.png` });
      await page.keyboard.press('ArrowLeft');
      await expect(carousel).toHaveAttribute('data-active-index', '0');
      await expect(carousel.locator('.hero-slide').first()).toHaveCSS('transition-duration', '0s');
      await page.screenshot({ path: `test-results/faithful-${locale}-desktop.png` });
      for (const width of [1440, 1200, 1024, 992, 768, 640, 576, 375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        const navigation = page.locator('#primary-navigation');
        if (width <= 640) {
          await expect(navigation).toBeHidden();
          await page.locator('.menu-toggle').click();
          await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'true');
        }
        await expect(navigation).toBeVisible();
        for (const link of await navigation.locator('a').all()) {
          await expect(link).toHaveCSS('text-transform', 'uppercase');
          const bounds = await link.boundingBox();
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
          expect(bounds.height).toBeGreaterThanOrEqual(24);
        }
        if (width <= 640) {
          await page.keyboard.press('Escape');
          await expect(navigation).toBeHidden();
          await expect(page.locator('.menu-toggle')).toBeFocused();
          const imageBox = await page.locator('.hero-preview').boundingBox();
          const contentBox = await page.locator('.hero-content').boundingBox();
          expect(imageBox.y).toBeLessThan(contentBox.y);
        }
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `test-results/faithful-${locale}-mobile.png` });
      await page.locator('.install-details > summary').click();
      await page.evaluate(() =>
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: async () => {} },
        }),
      );
      await page.locator('[data-copy-target]').click();
      const status = page.locator('#copy-status');
      await expect(status).not.toBeEmpty();
      const success = await status.textContent();
      await page.evaluate(() => {
        navigator.clipboard.writeText = async () => {
          throw new Error('Test refusal');
        };
      });
      await page.locator('[data-copy-target]').click();
      await expect(status).not.toHaveText(success);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.locator('.install-details > summary').click();
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `test-results/faithful-${locale}-full.png`, fullPage: true });
      for (const image of await page.locator('img').all()) {
        expect(await image.getAttribute('alt')).not.toBeNull();
        expect(await image.getAttribute('width')).toBeTruthy();
        expect(await image.getAttribute('height')).toBeTruthy();
      }
      expect(failures).toEqual([]);
      expect(externalRequests).toEqual([]);
      await page.locator('.site-footer a[href*="privacy/"]').click();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
    } finally {
      await browser.close();
    }
  });
}

test('Hero rotation respects pause, hover, focus, visibility and reduced motion', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('http://127.0.0.1:4178/tabibe/');
    const carousel = page.locator('[data-carousel]');
    const play = carousel.locator('[data-play]');
    await expect(carousel).toHaveAttribute('data-ready', 'true');
    await page.clock.install();
    await page.clock.fastForward(12000);
    await expect(carousel).toHaveAttribute('data-active-index', '0');
    await play.focus();
    await page.keyboard.press('Enter');
    await expect(carousel).toHaveAttribute('data-playing', 'true');
    await page.clock.fastForward(6100);
    await expect(carousel).toHaveAttribute('data-active-index', '1');
    await expect(carousel.locator('.hero-stage')).toHaveAttribute('aria-live', 'off');
    await carousel.locator('[data-next]').focus();
    await page.clock.fastForward(12000);
    await expect(carousel).toHaveAttribute('data-active-index', '1');
    await expect(carousel).toHaveAttribute('data-playing', 'false');
    await play.focus();
    await page.keyboard.press('Enter');
    await carousel.hover();
    await page.clock.fastForward(8000);
    await expect(carousel).toHaveAttribute('data-active-index', '1');
    await page.mouse.move(0, 0);
    await page.clock.fastForward(6100);
    await expect(carousel).toHaveAttribute('data-active-index', '0');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.clock.fastForward(12000);
    await expect(carousel).toHaveAttribute('data-active-index', '0');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.clock.fastForward(6100);
    await expect(carousel).toHaveAttribute('data-active-index', '1');
    await play.click();
    await page.mouse.move(0, 0);
    await page.clock.fastForward(12000);
    await expect(carousel).toHaveAttribute('data-playing', 'false');
    await expect(carousel).toHaveAttribute('data-active-index', '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(play).toBeDisabled();
    await carousel.locator('[data-next]').click();
    await expect(carousel).toHaveAttribute('data-active-index', '0');
  } finally {
    await browser.close();
  }
});

test('Hero image failure provides recovery and the page remains usable without JavaScript', async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route(/hero-dark(?:-640)?\.(?:png|webp)$/, (route) => route.abort());
    await page.goto('http://127.0.0.1:4178/tabibe/');
    await expect(page.locator('.is-active .slide-error')).toBeVisible();
    await page.locator('[data-next]').click();
    await expect
      .poll(() =>
        page
          .locator('.is-active img')
          .evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    await expect(page.locator('[data-play]')).toBeDisabled();
    const fallback = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 900 },
    });
    const staticPage = await fallback.newPage();
    await staticPage.goto('http://127.0.0.1:4178/tabibe/');
    await expect(staticPage.locator('.hero-slide.is-active img')).toBeVisible();
    await expect(staticPage.locator('.preview-fallback a')).toHaveCount(2);
    await expect(staticPage.locator('#primary-navigation')).toBeVisible();
    await expect(staticPage.locator('.preview-controls')).toBeHidden();
    await staticPage.locator('.install-details > summary').click();
    await expect(staticPage.locator('#extension-address')).toBeVisible();
    await expect(staticPage.locator('[data-copy-target]')).toBeHidden();
  } finally {
    await browser.close();
  }
});
