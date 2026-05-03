/**
 * 1. Background preset definitions
 */

const BACKGROUND_PRESET_GROUPS = [
  {
    id: 'light',
    labelKey: 'settings_bg_light_colors',
    theme: 'light',
    colors: [
      '#f8f9fa',
      '#e3f2fd',
      '#e8f5e9',
      '#fff3e0',
      '#fce4ec',
      '#f3e5f5',
    ],
  },
  {
    id: 'dark',
    labelKey: 'settings_bg_dark_colors',
    theme: 'dark',
    colors: [
      '#181828',
      '#1a237e',
      '#1b5e20',
      '#4a148c',
      '#212121',
      '#263238',
    ],
  },
];

const BACKGROUND_PRESETS = BACKGROUND_PRESET_GROUPS.flatMap((group) => (
  group.colors.map((color) => ({
    color,
    groupId: group.id,
    theme: group.theme,
  }))
));

function getBackgroundPresetTheme(color) {
  if (!color) return null;

  const normalizedColor = String(color).trim().toLowerCase();
  const preset = BACKGROUND_PRESETS.find((item) => item.color === normalizedColor);

  return preset ? preset.theme : null;
}

function getEquivalentBackgroundPresetColor(color, targetTheme) {
  if (!color || !targetTheme) return null;

  const normalizedColor = String(color).trim().toLowerCase();
  const sourceGroup = BACKGROUND_PRESET_GROUPS.find((group) => (
    group.colors.includes(normalizedColor)
  ));
  const targetGroup = BACKGROUND_PRESET_GROUPS.find((group) => group.theme === targetTheme);

  if (!sourceGroup || !targetGroup) return null;

  const sourceIndex = sourceGroup.colors.indexOf(normalizedColor);
  return targetGroup.colors[sourceIndex] || null;
}

export {
  BACKGROUND_PRESET_GROUPS,
  BACKGROUND_PRESETS,
  getEquivalentBackgroundPresetColor,
  getBackgroundPresetTheme,
};
