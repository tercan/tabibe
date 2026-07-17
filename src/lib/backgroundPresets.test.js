import { describe, expect, it } from 'vitest';
import {
  BACKGROUND_PRESETS,
  getBackgroundPresetTheme,
  getEquivalentBackgroundPresetColor,
} from './backgroundPresets.js';

describe('background presets', () => {
  it('resolves preset themes with normalized color values', () => {
    expect(BACKGROUND_PRESETS).toHaveLength(12);
    expect(getBackgroundPresetTheme('  #E3F2FD ')).toBe('light');
    expect(getBackgroundPresetTheme('#1A237E')).toBe('dark');
    expect(getBackgroundPresetTheme('#ffffff')).toBeNull();
    expect(getBackgroundPresetTheme('')).toBeNull();
  });

  it('maps a color to the same position in the opposite theme group', () => {
    expect(getEquivalentBackgroundPresetColor('#e3f2fd', 'dark')).toBe('#1a237e');
    expect(getEquivalentBackgroundPresetColor(' #1A237E ', 'light')).toBe('#e3f2fd');
  });

  it('rejects incomplete or unknown preset mappings', () => {
    expect(getEquivalentBackgroundPresetColor('', 'dark')).toBeNull();
    expect(getEquivalentBackgroundPresetColor('#ffffff', 'dark')).toBeNull();
    expect(getEquivalentBackgroundPresetColor('#e3f2fd', 'system')).toBeNull();
  });
});
