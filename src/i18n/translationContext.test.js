import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALE_MAP, LOCALE_OPTIONS } from './translationContext.js';

describe('translation locale coverage', () => {
  it('keeps UI and manifest locale coverage aligned', () => {
    const localeIds = LOCALE_OPTIONS.map((locale) => locale.id).sort();
    expect(localeIds).toEqual(Object.keys(LOCALE_MAP).sort());

    localeIds.forEach((localeId) => {
      const messagesPath = resolve('public', '_locales', localeId, 'messages.json');
      const messages = JSON.parse(readFileSync(messagesPath, 'utf8'));
      expect(messages.extension_name.message).toBe('Tabibe');
      expect(messages.extension_description.message.length).toBeGreaterThan(20);
    });
  });
});
