import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BACKGROUND_PRESET_GROUPS } from './backgroundPresets.js';

const stylesDirectory = resolve('src/styles');
const stylesheet = readdirSync(stylesDirectory)
  .filter((file) => file.endsWith('.css'))
  .map((file) => readFileSync(resolve(stylesDirectory, file), 'utf8'))
  .join('\n');
const tokenStylesheet = readFileSync(resolve(stylesDirectory, 'tokens.css'), 'utf8');

function getRuleBlock(selector) {
  const start = tokenStylesheet.indexOf(selector);
  const openingBrace = tokenStylesheet.indexOf('{', start);
  const closingBrace = tokenStylesheet.indexOf('}', openingBrace);
  return tokenStylesheet.slice(openingBrace + 1, closingBrace);
}

function getColorToken(block, token) {
  const match = block.match(new RegExp(`--${token}:\\s*(#[0-9a-f]{6})`, 'iu'));
  if (!match) throw new Error(`Missing color token: ${token}`);
  return match[1];
}

function getRelativeLuminance(hexColor) {
  const channels = hexColor
    .slice(1)
    .match(/.{2}/gu)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function getContrastRatio(firstColor, secondColor) {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('theme contrast', () => {
  const themeRules = {
    light: getRuleBlock(':root {'),
    dark: getRuleBlock("[data-theme='dark']"),
  };

  for (const group of BACKGROUND_PRESET_GROUPS) {
    it(`${group.theme} text tokens meet WCAG AA on every preset background`, () => {
      const rules = themeRules[group.theme];
      const colors = [getColorToken(rules, 'color-text'), getColorToken(rules, 'color-text-muted')];

      for (const textColor of colors) {
        for (const backgroundColor of group.colors) {
          expect(getContrastRatio(textColor, backgroundColor)).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }

  it.each(Object.entries(themeRules))(
    '%s interactive tokens meet contrast targets',
    (_theme, rules) => {
      const surface = getColorToken(rules, 'color-surface');
      const primary = getColorToken(rules, 'color-primary');
      const primarySurface = getColorToken(rules, 'color-primary-surface');
      const inverseText = getColorToken(rules, 'color-text-inverse');
      const focus = getColorToken(rules, 'color-focus');

      expect(getContrastRatio(primary, surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(inverseText, primarySurface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(focus, surface)).toBeGreaterThanOrEqual(3);
    },
  );

  it('does not suppress focus outlines', () => {
    expect(stylesheet).not.toMatch(/outline:\s*none/iu);
  });
});
