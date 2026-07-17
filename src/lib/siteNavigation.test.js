import { describe, expect, it, vi } from 'vitest';
import { isInternalBrowserUrl, openSiteUrl } from './siteNavigation.js';

describe('site navigation', () => {
  it('normalizes normal URLs before assigning the location', () => {
    const locationObject = { href: '' };
    expect(openSiteUrl('example.com', { locationObject })).toBe('https://example.com/');
    expect(locationObject.href).toBe('https://example.com/');
  });

  it('uses the Tabs API for internal browser pages', () => {
    const tabsApi = { update: vi.fn(), create: vi.fn() };
    openSiteUrl('chrome://extensions', { tabsApi, locationObject: { href: '' } });
    expect(tabsApi.update).toHaveBeenCalledWith(
      { url: 'chrome://extensions' },
      expect.any(Function),
    );
    expect(isInternalBrowserUrl('about:blank')).toBe(true);
  });

  it('rejects unsafe protocols before navigation', () => {
    expect(() => openSiteUrl('javascript:alert(1)', { locationObject: { href: '' } })).toThrow(
      'unsafe_url_protocol',
    );
  });
});
