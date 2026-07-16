import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import speedDialMoveAnimation, { shouldReduceMotion } from './speedDialMotion.js';

class MockKeyframeEffect {
  constructor(element, keyframes, options) {
    this.element = element;
    this.keyframes = keyframes;
    this.options = options;
  }
}

beforeEach(() => {
  vi.stubGlobal('KeyframeEffect', MockKeyframeEffect);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('speed dial motion', () => {
  it('returns a one millisecond no-op effect when reduced motion is requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );

    const effect = speedDialMoveAnimation(
      document.createElement('li'),
      'remain',
      { left: 0, top: 0 },
      { left: 100, top: 100 },
    );

    expect(shouldReduceMotion()).toBe(true);
    expect(effect.options).toMatchObject({ duration: 1, easing: 'linear' });
    expect(effect.keyframes).toEqual([{ opacity: 1 }, { opacity: 1 }]);
  });

  it('keeps the move animation when reduced motion is not requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );

    const effect = speedDialMoveAnimation(
      document.createElement('li'),
      'remain',
      { left: 0, top: 0 },
      { left: 100, top: 0 },
    );

    expect(effect.options.duration).toBe(520);
    expect(effect.keyframes.at(-1)).toEqual({ transform: 'translate(0, 0)' });
  });
});
