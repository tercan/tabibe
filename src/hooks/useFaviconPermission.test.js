import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useFaviconPermission from './useFaviconPermission.js';

function createEvent() {
  return { addListener: vi.fn(), removeListener: vi.fn() };
}

beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: { id: 'test', getURL: vi.fn(), lastError: null },
    permissions: {
      contains: vi.fn((_permission, callback) => callback(false)),
      request: vi.fn((_permission, callback) => callback(true)),
      onAdded: createEvent(),
      onRemoved: createEvent(),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useFaviconPermission', () => {
  it('checks permission without requesting it on mount', async () => {
    const { result } = renderHook(() => useFaviconPermission());
    await waitFor(() => expect(chrome.permissions.contains).toHaveBeenCalledOnce());
    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(result.current.hasPermission).toBe(false);
  });

  it('requests permission only through the exposed user action', async () => {
    const { result } = renderHook(() => useFaviconPermission());

    await act(async () => {
      expect(await result.current.requestPermission()).toBe(true);
    });

    expect(chrome.permissions.request).toHaveBeenCalledWith(
      { permissions: ['favicon'] },
      expect.any(Function),
    );
    expect(result.current.hasPermission).toBe(true);
    expect(result.current.requestState).toBe('granted');
  });
});
