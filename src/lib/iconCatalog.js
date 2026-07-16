const SIMPLE_ICONS_VERSION = '16.26.0';
const ICON_SLUG_PATTERN = /^[a-z0-9]+$/u;

const HOSTNAME_ALIASES = new Map([
  ['calendar.google.com', 'googlecalendar'],
  ['docs.google.com', 'googledocs'],
  ['drive.google.com', 'googledrive'],
  ['mail.google.com', 'gmail'],
  ['maps.google.com', 'googlemaps'],
  ['meet.google.com', 'googlemeet'],
  ['sheets.google.com', 'googlesheets'],
  ['slides.google.com', 'googleslides'],
  ['translate.google.com', 'googletranslate'],
  ['open.spotify.com', 'spotify'],
  ['web.whatsapp.com', 'whatsapp'],
]);

const COMMON_SECOND_LEVEL_DOMAINS = new Set(['co', 'com', 'net', 'org']);

function normalizeSearchValue(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .toLocaleLowerCase('en')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function getExtensionUrl(path) {
  if (globalThis.chrome?.runtime?.id && globalThis.chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(path);
  }
  return new URL(path, document.baseURI).href;
}

function createIconCatalog(payload) {
  if (payload?.version !== SIMPLE_ICONS_VERSION || !Array.isArray(payload.icons)) {
    throw new Error('invalid_icon_catalog');
  }

  const icons = payload.icons
    .filter(
      (icon) =>
        ICON_SLUG_PATTERN.test(icon?.slug) &&
        typeof icon.title === 'string' &&
        /^[0-9A-F]{6}$/u.test(icon.hex),
    )
    .map((icon) => ({
      slug: icon.slug,
      title: icon.title,
      hex: icon.hex,
      aliases: Array.isArray(icon.aliases)
        ? icon.aliases.filter((alias) => typeof alias === 'string')
        : [],
    }));
  const bySlug = new Map(icons.map((icon) => [icon.slug, icon]));
  const byName = new Map();

  for (const icon of icons) {
    for (const name of [icon.title, ...icon.aliases]) {
      const normalizedName = normalizeSearchValue(name);
      if (normalizedName && !byName.has(normalizedName)) byName.set(normalizedName, icon);
    }
  }

  return { version: payload.version, icons, bySlug, byName, isLoaded: true };
}

const EMPTY_ICON_CATALOG = {
  version: SIMPLE_ICONS_VERSION,
  icons: [],
  bySlug: new Map(),
  byName: new Map(),
  isLoaded: false,
};

let catalogPromise;

async function loadIconCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(getExtensionUrl('brand-icons/catalog.json'), { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('icon_catalog_load_failed');
        return response.json();
      })
      .then(createIconCatalog);
  }

  return catalogPromise;
}

function searchIconCatalog(catalog, query, limit = 8) {
  if (!catalog?.isLoaded) return [];
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return [];

  return catalog.icons
    .map((icon) => {
      const values = [icon.slug, icon.title, ...icon.aliases].map(normalizeSearchValue);
      let score = Number.POSITIVE_INFINITY;
      for (const value of values) {
        if (value === normalizedQuery) score = Math.min(score, 0);
        else if (value.startsWith(normalizedQuery)) score = Math.min(score, 1);
        else if (value.includes(normalizedQuery)) score = Math.min(score, 2);
      }
      return { icon, score };
    })
    .filter((result) => Number.isFinite(result.score))
    .sort(
      (first, second) =>
        first.score - second.score || first.icon.title.localeCompare(second.icon.title),
    )
    .slice(0, limit)
    .map((result) => result.icon);
}

function getDomainLabel(hostname) {
  const labels = hostname
    .replace(/^www\./u, '')
    .split('.')
    .filter(Boolean);
  if (labels.length < 2) return labels[0] || '';
  const hasCountrySuffix =
    labels.at(-1).length === 2 && COMMON_SECOND_LEVEL_DOMAINS.has(labels.at(-2));
  return hasCountrySuffix && labels.length >= 3 ? labels.at(-3) : labels.at(-2);
}

function resolveBrandIcon(site, catalog) {
  if (!catalog?.isLoaded || !site || site.type === 'folder') return null;

  const explicitSlug = site.icon?.slug || site.icon_slug;
  if (typeof explicitSlug === 'string') {
    const explicitIcon = catalog.bySlug.get(explicitSlug.trim().toLowerCase());
    if (explicitIcon) return explicitIcon;
  }

  try {
    const hostname = new URL(site.url).hostname.toLowerCase();
    const aliasSlug = HOSTNAME_ALIASES.get(hostname);
    if (aliasSlug && catalog.bySlug.has(aliasSlug)) return catalog.bySlug.get(aliasSlug);

    const domainSlug = normalizeSearchValue(getDomainLabel(hostname));
    if (catalog.bySlug.has(domainSlug)) return catalog.bySlug.get(domainSlug);
  } catch {
    // Invalid URLs are rejected by the data schema; a draft preview may still be incomplete.
  }

  return catalog.byName.get(normalizeSearchValue(site.name)) || null;
}

function getBrandIconUrl(slug) {
  if (!ICON_SLUG_PATTERN.test(slug || '')) return '';
  return getExtensionUrl(`brand-icons/icons/${slug}.svg`);
}

export {
  EMPTY_ICON_CATALOG,
  SIMPLE_ICONS_VERSION,
  createIconCatalog,
  getBrandIconUrl,
  loadIconCatalog,
  normalizeSearchValue,
  resolveBrandIcon,
  searchIconCatalog,
};
