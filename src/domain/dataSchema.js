const SCHEMA_VERSION = 1;
const BACKUP_VERSION = 1;
const MAX_ROOT_ITEMS = 500;
const MAX_FOLDER_ITEMS = 500;
const MAX_NOTES = 500;
const MAX_NAME_LENGTH = 200;
const MAX_URL_LENGTH = 2048;
const MAX_ICON_SLUG_LENGTH = 100;
const MAX_NOTE_TITLE_LENGTH = 300;
const MAX_NOTE_CONTENT_LENGTH = 100_000;
const MAX_BACKGROUND_DATA_LENGTH = 7_000_000;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'chrome:', 'edge:', 'about:']);
const ICON_PREFERENCES = new Set(['auto', 'brand', 'favicon', 'monogram']);
const SUPPORTED_LOCALES = new Set(['en', 'tr', 'zh', 'es', 'hi', 'ar', 'pt', 'bn', 'ru', 'ja']);

class DataValidationError extends Error {
  constructor(code, field = '') {
    super(code);
    this.name = 'DataValidationError';
    this.code = code;
    this.field = field;
  }
}

function createId(prefix = 'item') {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getString(value, field, maximumLength, allowEmpty = false) {
  if (typeof value !== 'string') throw new DataValidationError('invalid_string', field);
  const normalized = value.trim();
  if (!allowEmpty && !normalized) throw new DataValidationError('required_string', field);
  if (normalized.length > maximumLength) throw new DataValidationError('string_too_long', field);
  return normalized;
}

function normalizeSiteUrl(value) {
  const rawValue = getString(value, 'url', MAX_URL_LENGTH);
  const detectedScheme = rawValue.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (detectedScheme && !['http', 'https', 'chrome', 'edge', 'about'].includes(detectedScheme)) {
    throw new DataValidationError('unsafe_url_protocol', 'url');
  }
  const hasProtocol = /^(https?|chrome|edge):\/\//i.test(rawValue) || rawValue.startsWith('about:');
  const normalizedValue = hasProtocol ? rawValue : `https://${rawValue}`;

  let parsed;
  try {
    parsed = new URL(normalizedValue);
  } catch {
    throw new DataValidationError('invalid_url', 'url');
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new DataValidationError('unsafe_url_protocol', 'url');
  }

  if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && !parsed.hostname) {
    throw new DataValidationError('invalid_url', 'url');
  }

  return parsed.href;
}

function normalizeIcon(icon, legacySlug = '') {
  const source = icon && typeof icon === 'object' && !Array.isArray(icon) ? icon : {};
  const preference = ICON_PREFERENCES.has(source.preference) ? source.preference : 'auto';
  const candidateSlug = typeof source.slug === 'string' ? source.slug : legacySlug;
  const slug =
    typeof candidateSlug === 'string'
      ? candidateSlug.trim().toLowerCase().slice(0, MAX_ICON_SLUG_LENGTH) || null
      : null;

  return { preference, slug };
}

function normalizeSite(item, allowFolder = true) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new DataValidationError('invalid_site', 'sites');
  }

  const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createId('site');
  const name = getString(item.name, 'name', MAX_NAME_LENGTH);

  if (item.type === 'folder') {
    if (!allowFolder) throw new DataValidationError('nested_folder', 'children');
    if (!Array.isArray(item.children))
      throw new DataValidationError('invalid_folder_children', 'children');
    if (item.children.length > MAX_FOLDER_ITEMS) {
      throw new DataValidationError('too_many_folder_items', 'children');
    }

    return {
      type: 'folder',
      id,
      name,
      children: item.children.map((child) => normalizeSite(child, false)),
    };
  }

  const legacySlug = typeof item.icon_slug === 'string' ? item.icon_slug : '';
  return {
    id,
    name,
    url: normalizeSiteUrl(item.url),
    icon: normalizeIcon(item.icon, legacySlug),
    icon_slug: normalizeIcon(item.icon, legacySlug).slug || '',
  };
}

function normalizeSites(value) {
  if (!Array.isArray(value)) throw new DataValidationError('invalid_sites', 'sites');
  if (value.length > MAX_ROOT_ITEMS) throw new DataValidationError('too_many_sites', 'sites');

  const sites = value.map((item) => normalizeSite(item));
  const ids = new Set();

  for (const site of sites) {
    const allItems = site.type === 'folder' ? [site, ...site.children] : [site];
    for (const item of allItems) {
      if (ids.has(item.id)) throw new DataValidationError('duplicate_id', 'sites');
      ids.add(item.id);
    }
  }

  return sites;
}

function normalizeDate(value, fallback) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return fallback;
  return new Date(value).toISOString();
}

function normalizeNote(note) {
  if (!note || typeof note !== 'object' || Array.isArray(note)) {
    throw new DataValidationError('invalid_note', 'notes');
  }

  const title = typeof note.title === 'string' ? note.title.slice(0, MAX_NOTE_TITLE_LENGTH) : '';
  const rawContent = typeof note.content === 'string' ? note.content : note.text;
  const content =
    typeof rawContent === 'string' ? rawContent.slice(0, MAX_NOTE_CONTENT_LENGTH) : '';
  if (!title.trim() && !content.trim()) return null;

  const now = new Date().toISOString();
  const createdAt = normalizeDate(note.createdAt, now);

  return {
    id: typeof note.id === 'string' && note.id.trim() ? note.id.trim() : createId('note'),
    title,
    content,
    isPinned: Boolean(note.isPinned),
    isArchived: Boolean(note.isArchived),
    createdAt,
    updatedAt: normalizeDate(note.updatedAt, createdAt),
  };
}

function normalizeNotes(value) {
  if (!Array.isArray(value)) throw new DataValidationError('invalid_notes', 'notes');
  if (value.length > MAX_NOTES) throw new DataValidationError('too_many_notes', 'notes');
  return value.map(normalizeNote).filter(Boolean);
}

function createDefaultSettings(systemTheme = 'light') {
  return {
    theme: systemTheme === 'dark' ? 'dark' : 'light',
    iconStyle: 'favicon',
    searchEngine: 'google',
    showClock: true,
    showSearch: true,
    notePinned: false,
    backgroundColor: '',
    backgroundImage: '',
    showMemory: false,
    locale: '',
    faviconFallback: false,
  };
}

function normalizeSettings(value, systemTheme = 'light') {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const defaults = createDefaultSettings(systemTheme);
  const backgroundImage = typeof source.backgroundImage === 'string' ? source.backgroundImage : '';

  if (backgroundImage.length > MAX_BACKGROUND_DATA_LENGTH) {
    throw new DataValidationError('background_too_large', 'backgroundImage');
  }
  if (backgroundImage && !/^data:image\/(png|jpeg|webp|avif);base64,/i.test(backgroundImage)) {
    throw new DataValidationError('invalid_background_type', 'backgroundImage');
  }

  return {
    theme: source.theme === 'dark' || source.theme === 'light' ? source.theme : defaults.theme,
    iconStyle:
      source.iconStyle === 'simple' || source.iconStyle === 'favicon'
        ? source.iconStyle
        : defaults.iconStyle,
    searchEngine: ['google', 'bing', 'duckduckgo', 'yandex'].includes(source.searchEngine)
      ? source.searchEngine
      : defaults.searchEngine,
    showClock: typeof source.showClock === 'boolean' ? source.showClock : defaults.showClock,
    showSearch: typeof source.showSearch === 'boolean' ? source.showSearch : defaults.showSearch,
    notePinned: typeof source.notePinned === 'boolean' ? source.notePinned : defaults.notePinned,
    backgroundColor:
      typeof source.backgroundColor === 'string'
        ? source.backgroundColor.slice(0, 32)
        : defaults.backgroundColor,
    backgroundImage,
    showMemory: typeof source.showMemory === 'boolean' ? source.showMemory : defaults.showMemory,
    locale: SUPPORTED_LOCALES.has(source.locale) ? source.locale : defaults.locale,
    faviconFallback:
      typeof source.faviconFallback === 'boolean'
        ? source.faviconFallback
        : defaults.faviconFallback,
  };
}

function normalizeAppState(value, options = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new DataValidationError('invalid_state', 'state');
  }

  const { defaultSites = [], systemTheme = 'light' } = options;
  const sites = Object.prototype.hasOwnProperty.call(value, 'sites') ? value.sites : defaultSites;
  const notes = Object.prototype.hasOwnProperty.call(value, 'notes') ? value.notes : [];

  return {
    schemaVersion: SCHEMA_VERSION,
    revision: Number.isSafeInteger(value.revision) && value.revision >= 0 ? value.revision : 0,
    sites: normalizeSites(sites),
    notes: normalizeNotes(notes),
    settings: normalizeSettings(value.settings, systemTheme),
  };
}

function createBackupEnvelope(state, appVersion) {
  const normalizedState = normalizeAppState(state);
  return {
    backupVersion: BACKUP_VERSION,
    appVersion,
    exportedAt: new Date().toISOString(),
    data: {
      sites: normalizedState.sites,
      notes: normalizedState.notes,
      settings: normalizedState.settings,
    },
  };
}

export {
  BACKUP_VERSION,
  DataValidationError,
  SCHEMA_VERSION,
  createBackupEnvelope,
  createDefaultSettings,
  normalizeAppState,
  normalizeNotes,
  normalizeSettings,
  normalizeSiteUrl,
  normalizeSites,
};
