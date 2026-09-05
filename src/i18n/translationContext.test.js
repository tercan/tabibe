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

  it('keeps every UI locale aligned with the English message contract', () => {
    const referenceKeys = Object.keys(LOCALE_MAP.en).sort();

    Object.entries(LOCALE_MAP).forEach(([localeId, messages]) => {
      expect(Object.keys(messages).sort(), `${localeId} message keys`).toEqual(referenceKeys);
      expect(messages.day_names, `${localeId} day names`).toHaveLength(7);
      expect(messages.month_names, `${localeId} month names`).toHaveLength(12);

      referenceKeys.forEach((key) => {
        const referenceValue = LOCALE_MAP.en[key];
        const localizedValue = messages[key];

        if (typeof referenceValue !== 'string') return;

        expect(localizedValue.trim(), `${localeId}.${key} content`).not.toBe('');
        expect(
          [...localizedValue.matchAll(/\{([^}]+)\}/gu)].map((match) => match[1]).sort(),
          `${localeId}.${key} placeholders`,
        ).toEqual([...referenceValue.matchAll(/\{([^}]+)\}/gu)].map((match) => match[1]).sort());
      });
    });
  });
});
