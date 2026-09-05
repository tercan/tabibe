import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import useBodyScrollLock from './useBodyScrollLock.js';

function LockHarness({ active = true }) {
  useBodyScrollLock(active);
  return null;
}

afterEach(() => {
  document.body.classList.remove('no-scroll');
});

describe('useBodyScrollLock', () => {
  it('keeps the body locked until every active overlay is unmounted', () => {
    const first = render(<LockHarness />);
    const second = render(<LockHarness />);

    expect(document.body).toHaveClass('no-scroll');
    first.unmount();
    expect(document.body).toHaveClass('no-scroll');
    second.unmount();
    expect(document.body).not.toHaveClass('no-scroll');
  });
});
