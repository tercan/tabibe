import { describe, expect, it } from 'vitest';
import { QUOTES, get_daily_quote } from './quotes.js';

describe('daily quote translations', () => {
  it('provides complete French, German, and Italian quote pools', () => {
    for (const locale of ['fr', 'de', 'it']) {
      expect(QUOTES[locale]).toHaveLength(QUOTES.en.length);
      QUOTES[locale].forEach((quote) => {
        expect(quote.text.trim()).not.toBe('');
        expect(quote.author.trim()).not.toBe('');
      });
    }
  });

  it('returns a localized quote for each newly supported locale', () => {
    for (const locale of ['fr', 'de', 'it']) {
      expect(QUOTES[locale]).toContainEqual(get_daily_quote(locale));
    }
  });
});
