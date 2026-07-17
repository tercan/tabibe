import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useBrowserStats from './useBrowserStats.js';

function createChromeEvent() {
  let listener = null;
  return {
    addListener: vi.fn((nextListener) => {
      listener = nextListener;
    }),
    removeListener: vi.fn((removedListener) => {
      if (listener === removedListener) listener = null;
    }),
    emit: () => listener?.(),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('useBrowserStats', () => {
  it('uses Chrome events instead of polling for tab and window counts', async () => {
    const tabCreated = createChromeEvent();
    const tabRemoved = createChromeEvent();
    const windowCreated = createChromeEvent();
    const windowRemoved = createChromeEvent();
    vi.stubGlobal('chrome', {
      runtime: { lastError: null },
      tabs: {
        query: vi.fn((query, callback) => callback([{}, {}])),
        onCreated: tabCreated,
        onRemoved: tabRemoved,
      },
      windows: {
        getAll: vi.fn((query, callback) => callback([{}])),
        onCreated: windowCreated,
        onRemoved: windowRemoved,
      },
      system: {
        memory: {
          getInfo: vi.fn((callback) =>
            callback({ capacity: 8 * 1024 ** 3, availableCapacity: 3 * 1024 ** 3 }),
          ),
        },
      },
    });

    const { result, unmount } = renderHook(() => useBrowserStats(true));
    await waitFor(() => expect(result.current.tabCount).toBe(2));
    expect(result.current.windowCount).toBe(1);
    expect(result.current.memoryInfo).toBe('5.0/8 GB');
    act(() => {
      tabCreated.emit();
      windowCreated.emit();
    });
    expect(result.current.tabCount).toBe(3);
    expect(result.current.windowCount).toBe(2);

    act(() => {
      tabRemoved.emit();
      windowRemoved.emit();
    });
    expect(result.current.tabCount).toBe(2);
    expect(result.current.windowCount).toBe(1);

    unmount();
    expect(tabCreated.removeListener).toHaveBeenCalledOnce();
    expect(windowRemoved.removeListener).toHaveBeenCalledOnce();
  });
});
