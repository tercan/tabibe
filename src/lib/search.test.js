import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitSearch } from './search.js';
import { normalizeSettings } from '../domain/dataSchema.js';

afterEach(() => vi.unstubAllGlobals());

describe('browser search', () => {
  it('uses Chrome default search without a provider URL or changing browser settings', async () => {
    const query = vi.fn((_options, done) => done());
    vi.stubGlobal('chrome', { search: { query }, runtime: {} });
    await submitSearch('  a & b / Türkçe  ');
    expect(query).toHaveBeenCalledWith(
      { text: 'a & b / Türkçe', disposition: 'CURRENT_TAB' },
      expect.any(Function),
    );
    await submitSearch('   ');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('does not silently redirect to another provider when browser search fails', async () => {
    vi.stubGlobal('chrome', undefined);
    await expect(submitSearch('private query')).rejects.toThrow('browser_search_unavailable');
    vi.stubGlobal('chrome', {
      search: { query: (_options, done) => done() },
      runtime: { lastError: { message: 'Search unavailable' } },
    });
    await expect(submitSearch('private query')).rejects.toThrow('Search unavailable');
  });

  it('encodes queries only for an explicitly selected provider', async () => {
    const assign = vi.fn();
    vi.stubGlobal('window', { location: { assign }, history: window.history });
    await submitSearch('a & b', 'duckduckgo');
    expect(assign).toHaveBeenCalledWith('https://duckduckgo.com/?q=a%20%26%20b');
  });

  it('migrates unversioned defaults once and preserves subsequent explicit choices', () => {
    const migrated = normalizeSettings({ searchEngine: 'google', theme: 'dark' });
    expect(migrated).toMatchObject({
      searchEngine: 'browser',
      searchEngineChoiceVersion: 1,
      theme: 'dark',
    });
    const chosen = normalizeSettings({ ...migrated, searchEngine: 'duckduckgo' });
    expect(normalizeSettings(chosen).searchEngine).toBe('duckduckgo');
    expect(normalizeSettings({ ...chosen, searchEngine: 'invalid' }).searchEngine).toBe('browser');
  });
});
