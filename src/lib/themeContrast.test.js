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

function getPercentageToken(block, token) {
  const match = block.match(new RegExp(`--${token}:\\s*([0-9.]+)%`, 'iu'));
  if (!match) throw new Error(`Missing percentage token: ${token}`);
  return Number.parseFloat(match[1]) / 100;
}

function mixHexColors(firstColor, secondColor, firstWeight) {
  const firstChannels = firstColor
    .slice(1)
    .match(/.{2}/gu)
    .map((channel) => Number.parseInt(channel, 16));
  const secondChannels = secondColor
    .slice(1)
    .match(/.{2}/gu)
    .map((channel) => Number.parseInt(channel, 16));

  return firstChannels.map((channel, index) =>
    Math.round(channel * firstWeight + secondChannels[index] * (1 - firstWeight)),
  );
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
  const firstLuminance = getRelativeLuminance(
    Array.isArray(firstColor)
      ? `#${firstColor.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
      : firstColor,
  );
  const secondLuminance = getRelativeLuminance(
    Array.isArray(secondColor)
      ? `#${secondColor.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
      : secondColor,
  );
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

  for (const group of BACKGROUND_PRESET_GROUPS) {
    it(`${group.theme} adaptive home surfaces remain readable on every preset`, () => {
      const rules = themeRules[group.theme];
      const rulesWithDefaults = `${rules}\n${themeRules.light}`;
      const textColor = getColorToken(rules, 'color-text');
      const mutedTextColor = getColorToken(rules, 'color-text-muted');
      const primaryColor = getColorToken(rules, 'color-primary');
      const surfaceBase = getColorToken(rules, 'color-surface');
      const hoverBase = getColorToken(rules, 'color-surface-hover');
      const footerBase = getColorToken(rules, 'color-footer-bg');
      const folderSurfaceBase = getColorToken(rules, 'color-folder-surface');
      const folderIconColor = getColorToken(rules, 'color-folder-icon');
      const surfaceWeight = getPercentageToken(rulesWithDefaults, 'home-control-background-weight');
      const hoverWeight = getPercentageToken(
        rulesWithDefaults,
        'home-control-hover-background-weight',
      );
      const borderTextWeight = getPercentageToken(
        rulesWithDefaults,
        'home-control-border-text-weight',
      );
      const footerWeight = getPercentageToken(rulesWithDefaults, 'home-footer-background-weight');
      const folderWeight = getPercentageToken(rulesWithDefaults, 'home-folder-background-weight');

      for (const backgroundColor of group.colors) {
        const surfaceColor = mixHexColors(backgroundColor, surfaceBase, surfaceWeight);
        const hoverColor = mixHexColors(backgroundColor, hoverBase, hoverWeight);
        const borderColor = mixHexColors(mutedTextColor, backgroundColor, borderTextWeight);
        const footerColor = mixHexColors(backgroundColor, footerBase, footerWeight);
        const folderSurfaceColor = mixHexColors(backgroundColor, folderSurfaceBase, folderWeight);

        expect(getContrastRatio(textColor, surfaceColor)).toBeGreaterThanOrEqual(4.5);
        expect(getContrastRatio(mutedTextColor, surfaceColor)).toBeGreaterThanOrEqual(4.5);
        expect(getContrastRatio(textColor, hoverColor)).toBeGreaterThanOrEqual(4.5);
        expect(getContrastRatio(primaryColor, surfaceColor)).toBeGreaterThanOrEqual(3);
        expect(getContrastRatio(primaryColor, hoverColor)).toBeGreaterThanOrEqual(3);
        expect(getContrastRatio(surfaceColor, borderColor)).toBeGreaterThanOrEqual(3);
        expect(getContrastRatio(mutedTextColor, footerColor)).toBeGreaterThanOrEqual(4.5);
        expect(getContrastRatio(primaryColor, footerColor)).toBeGreaterThanOrEqual(3);
        expect(getContrastRatio(folderIconColor, folderSurfaceColor)).toBeGreaterThanOrEqual(4.5);
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

  it('uses the border-based focus standard without thick outlines', () => {
    expect(stylesheet).toMatch(/outline-width:\s*0/iu);
    expect(stylesheet).toMatch(/box-shadow:\s*var\(--shadow-focus-border\)/iu);
    expect(stylesheet).not.toMatch(/outline:\s*var\(--focus-ring/iu);
  });
});
