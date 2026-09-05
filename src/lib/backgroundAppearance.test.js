import { describe, expect, it } from 'vitest';
import { getBackgroundAppearance, normalizeBackgroundColor } from './backgroundAppearance.js';

describe('background appearance', () => {
  it('normalizes safe six-digit hexadecimal colors', () => {
    expect(normalizeBackgroundColor('  #E3F2FD  ')).toBe('#e3f2fd');
    expect(normalizeBackgroundColor('#123abc')).toBe('#123abc');
  });

  it.each(['', '#fff', '#12345g', 'rgb(1, 2, 3)', 'red', 'var(--color-background)', null])(
    'rejects an unsafe or unsupported background color: %s',
    (value) => {
      expect(normalizeBackgroundColor(value)).toBe('');
    },
  );

  it('exposes a scoped color variable for a validated color background', () => {
    expect(
      getBackgroundAppearance({ backgroundColor: '#F3E5F5', hasBackgroundImage: false }),
    ).toEqual({
      cssVariables: { '--new-tab-background-color': '#f3e5f5' },
      kind: 'color',
    });
  });

  it('gives an image precedence over a stored background color', () => {
    expect(
      getBackgroundAppearance({ backgroundColor: '#f3e5f5', hasBackgroundImage: true }),
    ).toEqual({
      cssVariables: {},
      kind: 'image',
    });
  });

  it('falls back without exposing invalid legacy values to CSS variables', () => {
    expect(
      getBackgroundAppearance({ backgroundColor: 'not-a-color', hasBackgroundImage: false }),
    ).toEqual({
      cssVariables: {},
      kind: 'default',
    });
  });

  it('keeps syntactically valid but unverified legacy colors on the opaque fallback palette', () => {
    expect(
      getBackgroundAppearance({ backgroundColor: '#ffffff', hasBackgroundImage: false }),
    ).toEqual({
      cssVariables: {},
      kind: 'default',
    });
  });
});
