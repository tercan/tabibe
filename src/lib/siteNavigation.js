import { normalizeSiteUrl } from '../domain/dataSchema.js';

function isInternalBrowserUrl(url) {
  return ['about:', 'chrome:', 'edge:'].includes(new URL(url).protocol);
}

function openSiteUrl(url, environment = {}) {
  const normalizedUrl = normalizeSiteUrl(url);
  const tabsApi = environment.tabsApi || globalThis.chrome?.tabs;
  const locationObject = environment.locationObject || globalThis.location;

  if (isInternalBrowserUrl(normalizedUrl) && tabsApi) {
    tabsApi.update({ url: normalizedUrl }, () => {
      if (globalThis.chrome?.runtime?.lastError) tabsApi.create({ url: normalizedUrl });
    });
    return normalizedUrl;
  }

  if (!locationObject) throw new Error('navigation_unavailable');
  locationObject.href = normalizedUrl;
  return normalizedUrl;
}

export { isInternalBrowserUrl, openSiteUrl };
