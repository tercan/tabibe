import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useBackgroundImageUrl, { dataUrlToBlob } from './useBackgroundImageUrl.js';

afterEach(() => vi.unstubAllGlobals());

describe('useBackgroundImageUrl', () => {
  it('converts supported data URLs to blobs', () => {
    const blob = dataUrlToBlob('data:image/png;base64,AA==');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect(dataUrlToBlob('not-a-data-url')).toBeNull();
  });

  it('revokes object URLs when the image changes or unmounts', () => {
    const createObjectURL = vi
      .fn()
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    const { result, rerender, unmount } = renderHook(
      ({ source }) => useBackgroundImageUrl(source),
      { initialProps: { source: 'data:image/png;base64,AA==' } },
    );
    expect(result.current).toBe('blob:first');

    rerender({ source: 'data:image/png;base64,AQ==' });
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
    expect(result.current).toBe('blob:second');

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
  });
});
