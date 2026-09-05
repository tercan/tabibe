import { getBackgroundPresetTheme } from './backgroundPresets.js';

/**
 * 1. Background appearance helpers
 */

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/iu;

function normalizeBackgroundColor(value) {
  if (typeof value !== 'string') return '';

  const normalizedColor = value.trim().toLowerCase();
  return HEX_COLOR_PATTERN.test(normalizedColor) ? normalizedColor : '';
}

function getBackgroundAppearance({ backgroundColor, hasBackgroundImage }) {
  if (hasBackgroundImage) {
    return {
      cssVariables: {},
      kind: 'image',
    };
  }

  const normalizedColor = normalizeBackgroundColor(backgroundColor);
  if (!normalizedColor || !getBackgroundPresetTheme(normalizedColor)) {
    return {
      cssVariables: {},
      kind: 'default',
    };
  }

  return {
    cssVariables: {
      '--new-tab-background-color': normalizedColor,
    },
    kind: 'color',
  };
}

export { getBackgroundAppearance, normalizeBackgroundColor };
