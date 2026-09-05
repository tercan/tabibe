import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { LOCALE_OPTIONS } from '../i18n/translationContext.js';

describe('packaged privacy policy', () => {
  it('ships the document, stylesheet, script, and every supported locale', () => {
    const html = readFileSync(resolve('public/privacy-policy.html'), 'utf8');
    const script = readFileSync(resolve('public/privacy-policy.js'), 'utf8');

    expect(html).toContain('privacy-policy.css');
    expect(html).toContain('privacy-policy.js');
    expect(html).toContain('datetime="2026-09-05"');
    expect(html).toContain('Chrome Web Store User Data Policy');
    expect(html).toContain('not encrypted by Tabibe');
    expect(html).not.toContain('noindex');
    const hostedHtml = readFileSync(resolve('docs/privacy/index.html'), 'utf8');
    expect(hostedHtml).toBe(html.replace('href="index.html"', 'href="../index.html"'));
    expect(readFileSync(resolve('docs/privacy/privacy-policy.js'), 'utf8')).toBe(script);

    LOCALE_OPTIONS.forEach(({ id }) => {
      expect(html).toContain(`<option value="${id}">`);
      expect(script).toMatch(new RegExp(`^  ${id}: \\{`, 'm'));
    });
  });

  it('uses border-based focus indicators without a thick outline', () => {
    const stylesheet = readFileSync(resolve('public/privacy-policy.css'), 'utf8');

    expect(stylesheet).toContain('outline-width: 0');
    expect(stylesheet).toContain('box-shadow: var(--privacy-shadow-focus-border)');
    expect(stylesheet).not.toMatch(/outline:\s*var\(--privacy-focus/iu);
  });

  it('keeps every privacy translation aligned with the English content contract', () => {
    const script = readFileSync(resolve('public/privacy-policy.js'), 'utf8');
    const sandbox = {
      URL,
      URLSearchParams,
      document: {
        documentElement: {},
        getElementById: () => null,
        querySelector: () => null,
        title: '',
      },
      window: {
        history: { replaceState: () => {} },
        location: { href: 'https://example.test/privacy-policy.html?lang=en', search: '?lang=en' },
      },
    };

    runInNewContext(
      `${script}\nglobalThis.__privacyTranslations = PRIVACY_TRANSLATIONS; globalThis.__supportedLocales = SUPPORTED_LOCALES;`,
      sandbox,
    );

    const expectedLocales = LOCALE_OPTIONS.map(({ id }) => id);
    const translations = sandbox.__privacyTranslations;
    expect(sandbox.__supportedLocales).toEqual(expectedLocales);

    const referenceKeys = Object.keys(translations.en).sort();
    expectedLocales.forEach((localeId) => {
      const translation = translations[localeId];
      expect(translation.permissionItems).toHaveLength(4);
      expect(
        translation.permissionItems.some((entry) => entry.startsWith('search')) ||
          localeId === 'ar',
      ).toBe(true);
      expect(translation.limitedParagraphs.join(' ')).toMatch(/Limited[ -]Use/);
      expect(translation.securityParagraphs).toHaveLength(2);
      expect(Object.keys(translation).sort(), `${localeId} privacy keys`).toEqual(referenceKeys);

      referenceKeys.forEach((key) => {
        const value = translation[key];
        if (Array.isArray(value)) {
          expect(value.length, `${localeId}.${key} entries`).toBeGreaterThan(0);
          value.forEach((entry) => expect(entry.trim(), `${localeId}.${key} content`).not.toBe(''));
          return;
        }
        expect(value.trim(), `${localeId}.${key} content`).not.toBe('');
      });
    });
  });
});
