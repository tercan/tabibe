import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createIconCatalog, resolveBrandIcon, searchIconCatalog } from './iconCatalog.js';
import {
  getFaviconUrl,
  getMonogram,
  getMonogramColor,
  resolveIconCandidates,
} from './iconResolver.js';

const catalog = createIconCatalog({
  version: '16.26.0',
  icons: [
    { slug: 'google', title: 'Google', hex: '4285F4', aliases: [] },
    { slug: 'gmail', title: 'Gmail', hex: 'EA4335', aliases: ['Google Mail'] },
    { slug: 'x', title: 'X', hex: '000000', aliases: ['Twitter'] },
  ],
});

beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: {
      id: 'test',
      getURL: (path) => `chrome-extension://test/${path}`,
    },
  });
});

describe('icon resolver', () => {
  it('resolves an explicit valid slug before hostname aliases', () => {
    expect(
      resolveBrandIcon(
        { name: 'Mail', url: 'https://mail.google.com', icon: { slug: 'x' } },
        catalog,
      )?.slug,
    ).toBe('x');
    expect(
      resolveBrandIcon(
        { name: 'Mail', url: 'https://mail.google.com', icon: { slug: 'missing' } },
        catalog,
      )?.slug,
    ).toBe('gmail');
  });

  it('searches titles and human-readable aliases without fuzzy substitutions', () => {
    expect(searchIconCatalog(catalog, 'Google Mail')[0].slug).toBe('gmail');
    expect(searchIconCatalog(catalog, 'unrelated')).toEqual([]);
  });

  it('uses the official extension favicon URL only for web URLs', () => {
    expect(getFaviconUrl('https://example.com/path')).toBe(
      'chrome-extension://test/_favicon/?pageUrl=https%3A%2F%2Fexample.com%2Fpath&size=64',
    );
    expect(getFaviconUrl('chrome://settings')).toBe('');
  });

  it('orders candidates by mode, site preference, and permission', () => {
    const site = {
      name: 'Google',
      url: 'https://google.com',
      icon: { preference: 'auto', slug: null },
    };
    expect(
      resolveIconCandidates({
        site,
        catalog,
        globalStyle: 'simple',
        hasFaviconPermission: false,
      }).map((candidate) => candidate.type),
    ).toEqual(['brand', 'monogram']);
    expect(
      resolveIconCandidates({
        site,
        catalog,
        globalStyle: 'favicon',
        hasFaviconPermission: true,
      }).map((candidate) => candidate.type),
    ).toEqual(['favicon', 'brand', 'monogram']);
    expect(
      resolveIconCandidates({
        ...{ site: { ...site, icon: { preference: 'monogram', slug: null } }, catalog },
      }).map((candidate) => candidate.type),
    ).toEqual(['monogram']);
  });

  it('creates stable, Unicode-preserving monograms from a contrast-safe palette', () => {
    const site = { name: 'İstanbul', url: 'https://example.com' };
    expect(getMonogram(site)).toBe('İ');
    expect(getMonogramColor(site)).toMatch(/^#[0-9a-f]{6}$/u);
    expect(getMonogramColor(site)).toBe(getMonogramColor(site));
  });
});
