import { getBrandIconUrl, resolveBrandIcon } from './iconCatalog.js';

const MONOGRAM_COLORS = [
  '#0d47a1',
  '#1b5e20',
  '#4a148c',
  '#b71c1c',
  '#004d40',
  '#3e2723',
  '#263238',
  '#5d4037',
];

function getFaviconUrl(siteUrl, size = 64) {
  try {
    const parsed = new URL(siteUrl);
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      !globalThis.chrome?.runtime?.id ||
      !globalThis.chrome?.runtime?.getURL
    )
      return '';
    const faviconUrl = new URL(chrome.runtime.getURL('_favicon/'));
    faviconUrl.searchParams.set('pageUrl', parsed.href);
    faviconUrl.searchParams.set('size', String(size));
    return faviconUrl.href;
  } catch {
    return '';
  }
}

function getMonogram(site) {
  const name = typeof site?.name === 'string' ? site.name.trim() : '';
  if (name) return Array.from(name)[0].toLocaleUpperCase();

  try {
    return (
      Array.from(new URL(site?.url).hostname.replace(/^www\./u, ''))[0]?.toLocaleUpperCase() || '?'
    );
  } catch {
    return '?';
  }
}

function getMonogramColor(site) {
  let source = typeof site?.name === 'string' ? site.name : '';
  try {
    source = new URL(site?.url).hostname || source;
  } catch {
    // Draft previews may not contain a complete URL yet.
  }

  let hash = 0;
  for (const character of source) hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  return MONOGRAM_COLORS[hash % MONOGRAM_COLORS.length];
}

function createBrandCandidate(brandIcon, variant) {
  if (!brandIcon) return null;
  return {
    type: 'brand',
    variant,
    slug: brandIcon.slug,
    title: brandIcon.title,
    src: getBrandIconUrl(brandIcon.slug),
  };
}

function createFaviconCandidate(site, variant, hasFaviconPermission) {
  if (!hasFaviconPermission) return null;
  const src = getFaviconUrl(site?.url);
  return src ? { type: 'favicon', variant, src } : null;
}

function compactCandidates(candidates, monogramVariant) {
  return [...candidates.filter(Boolean), { type: 'monogram', variant: monogramVariant }];
}

function resolveIconCandidates({
  site,
  catalog,
  globalStyle = 'favicon',
  hasFaviconPermission = false,
}) {
  const preference = site?.icon?.preference || 'auto';
  const brandIcon = resolveBrandIcon(site, catalog);
  const monochrome = globalStyle === 'simple';
  const brand = createBrandCandidate(brandIcon, monochrome ? 'monochrome' : 'color');
  const favicon = createFaviconCandidate(
    site,
    monochrome ? 'monochrome' : 'color',
    hasFaviconPermission,
  );

  if (preference === 'monogram') return compactCandidates([], monochrome ? 'neutral' : 'color');
  if (preference === 'brand') {
    return compactCandidates([brand, favicon], monochrome ? 'neutral' : 'color');
  }
  if (preference === 'favicon') {
    return compactCandidates([favicon, brand], 'color');
  }
  if (monochrome) return compactCandidates([brand, favicon], 'neutral');
  return compactCandidates([favicon, brand], 'color');
}

export { MONOGRAM_COLORS, getFaviconUrl, getMonogram, getMonogramColor, resolveIconCandidates };
