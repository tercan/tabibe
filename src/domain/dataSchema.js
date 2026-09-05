const SCHEMA_VERSION = 3;
const BACKUP_VERSION = 3;
const MAX_ROOT_ITEMS = 500;
const MAX_FOLDER_ITEMS = 500;
const MAX_NOTES = 500;
const MAX_NOTE_TAGS = 100;
const MAX_NOTE_NOTEBOOKS = 100;
const MAX_TAGS_PER_NOTE = 8;
const MAX_NAME_LENGTH = 200;
const MAX_URL_LENGTH = 2048;
const MAX_ICON_SLUG_LENGTH = 100;
const MAX_NOTE_TITLE_LENGTH = 300;
const MAX_NOTE_CONTENT_LENGTH = 100_000;
const MAX_NOTE_TAG_NAME_LENGTH = 40;
const MAX_NOTE_NOTEBOOK_NAME_LENGTH = 40;
const MAX_CAPTURE_SESSION_ID_LENGTH = 128;
const MAX_BACKGROUND_DATA_LENGTH = 7_000_000;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'chrome:', 'edge:', 'about:']);
const ICON_PREFERENCES = new Set(['auto', 'brand', 'favicon', 'monogram']);
const NOTE_TAG_COLOR_TOKENS = new Set(['blue', 'green', 'yellow', 'red', 'gray']);
const SUPPORTED_LOCALES = new Set([
  'en',
  'tr',
  'fr',
  'de',
  'it',
  'es',
  'pt',
  'ru',
  'ar',
  'hi',
  'bn',
  'zh',
  'ja',
]);

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
  const icon = normalizeIcon(item.icon, legacySlug);
  return {
    id,
    name,
    url: normalizeSiteUrl(item.url),
    icon,
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

function normalizeNoteTag(tag) {
  if (!tag || typeof tag !== 'object' || Array.isArray(tag)) {
    throw new DataValidationError('invalid_note_tag', 'noteTags');
  }

  const now = new Date().toISOString();
  const createdAt = normalizeDate(tag.createdAt, now);

  return {
    id: typeof tag.id === 'string' && tag.id.trim() ? tag.id.trim() : createId('tag'),
    name: getString(tag.name, 'noteTagName', MAX_NOTE_TAG_NAME_LENGTH),
    colorToken: NOTE_TAG_COLOR_TOKENS.has(tag.colorToken) ? tag.colorToken : 'blue',
    createdAt,
    updatedAt: normalizeDate(tag.updatedAt, createdAt),
  };
}

function normalizeNoteTags(value) {
  if (!Array.isArray(value)) throw new DataValidationError('invalid_note_tags', 'noteTags');
  if (value.length > MAX_NOTE_TAGS) {
    throw new DataValidationError('too_many_note_tags', 'noteTags');
  }

  const tags = value.map(normalizeNoteTag);
  const ids = new Set();
  const names = new Set();

  tags.forEach((tag) => {
    const normalizedName = tag.name.toLocaleLowerCase();
    if (ids.has(tag.id)) throw new DataValidationError('duplicate_note_tag_id', 'noteTags');
    if (names.has(normalizedName)) {
      throw new DataValidationError('duplicate_note_tag_name', 'noteTags');
    }
    ids.add(tag.id);
    names.add(normalizedName);
  });

  return tags;
}

function normalizeNoteNotebook(notebook) {
  if (!notebook || typeof notebook !== 'object' || Array.isArray(notebook)) {
    throw new DataValidationError('invalid_note_notebook', 'noteNotebooks');
  }

  const now = new Date().toISOString();
  const createdAt = normalizeDate(notebook.createdAt, now);

  return {
    id:
      typeof notebook.id === 'string' && notebook.id.trim()
        ? notebook.id.trim()
        : createId('notebook'),
    name: getString(notebook.name, 'noteNotebookName', MAX_NOTE_NOTEBOOK_NAME_LENGTH),
    createdAt,
    updatedAt: normalizeDate(notebook.updatedAt, createdAt),
  };
}

function normalizeNoteNotebooks(value) {
  if (!Array.isArray(value)) {
    throw new DataValidationError('invalid_note_notebooks', 'noteNotebooks');
  }
  if (value.length > MAX_NOTE_NOTEBOOKS) {
    throw new DataValidationError('too_many_note_notebooks', 'noteNotebooks');
  }

  const notebooks = value.map(normalizeNoteNotebook);
  const ids = new Set();
  const names = new Set();

  notebooks.forEach((notebook) => {
    const normalizedName = notebook.name.toLocaleLowerCase();
    if (ids.has(notebook.id)) {
      throw new DataValidationError('duplicate_note_notebook_id', 'noteNotebooks');
    }
    if (names.has(normalizedName)) {
      throw new DataValidationError('duplicate_note_notebook_name', 'noteNotebooks');
    }
    ids.add(notebook.id);
    names.add(normalizedName);
  });

  return notebooks;
}

function normalizeNote(note, validTagIds = new Set(), validNotebookIds = new Set()) {
  if (!note || typeof note !== 'object' || Array.isArray(note)) {
    throw new DataValidationError('invalid_note', 'notes');
  }

  const title = typeof note.title === 'string' ? note.title : '';
  const rawContent = typeof note.content === 'string' ? note.content : note.text;
  const content = typeof rawContent === 'string' ? rawContent : '';
  if (title.length > MAX_NOTE_TITLE_LENGTH) {
    throw new DataValidationError('string_too_long', 'noteTitle');
  }
  if (content.length > MAX_NOTE_CONTENT_LENGTH) {
    throw new DataValidationError('string_too_long', 'noteContent');
  }
  if (!title.trim() && !content.trim()) return null;

  const now = new Date().toISOString();
  const createdAt = normalizeDate(note.createdAt, now);
  const rawTagIds = Array.isArray(note.tagIds) ? note.tagIds : [];
  const tagIds = [...new Set(rawTagIds.filter((tagId) => validTagIds.has(tagId)))].slice(
    0,
    MAX_TAGS_PER_NOTE,
  );
  const candidateNotebookId = typeof note.notebookId === 'string' ? note.notebookId.trim() : '';
  const captureSessionId =
    typeof note.captureSessionId === 'string' && note.captureSessionId.trim()
      ? note.captureSessionId.trim()
      : null;
  if (captureSessionId && captureSessionId.length > MAX_CAPTURE_SESSION_ID_LENGTH) {
    throw new DataValidationError('string_too_long', 'captureSessionId');
  }

  return {
    id: typeof note.id === 'string' && note.id.trim() ? note.id.trim() : createId('note'),
    title,
    content,
    tagIds,
    notebookId: validNotebookIds.has(candidateNotebookId) ? candidateNotebookId : null,
    captureSessionId,
    isPinned: Boolean(note.isPinned),
    isArchived: Boolean(note.isArchived),
    createdAt,
    updatedAt: normalizeDate(note.updatedAt, createdAt),
    revision: Number.isSafeInteger(note.revision) && note.revision >= 1 ? note.revision : 1,
  };
}

function normalizeNotes(value, noteTags = [], noteNotebooks = []) {
  if (!Array.isArray(value)) throw new DataValidationError('invalid_notes', 'notes');
  if (value.length > MAX_NOTES) throw new DataValidationError('too_many_notes', 'notes');
  const validTagIds = new Set(noteTags.map((tag) => tag.id));
  const validNotebookIds = new Set(noteNotebooks.map((notebook) => notebook.id));
  return value.map((note) => normalizeNote(note, validTagIds, validNotebookIds)).filter(Boolean);
}

function createDefaultSettings(systemTheme = 'light') {
  return {
    theme: systemTheme === 'dark' ? 'dark' : 'light',
    iconStyle: 'favicon',
    searchEngine: 'browser',
    searchEngineChoiceVersion: 1,
    showClock: true,
    showSearch: true,
    notePinned: false,
    notePanelSide: 'left',
    notePanelMode: 'panel',
    noteSort: 'updated-desc',
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
    // Legacy settings did not distinguish an automatic Google default from a user choice.
    searchEngine:
      source.searchEngineChoiceVersion === 1 &&
      ['browser', 'google', 'bing', 'duckduckgo', 'yandex'].includes(source.searchEngine)
        ? source.searchEngine
        : defaults.searchEngine,
    searchEngineChoiceVersion: 1,
    showClock: typeof source.showClock === 'boolean' ? source.showClock : defaults.showClock,
    showSearch: typeof source.showSearch === 'boolean' ? source.showSearch : defaults.showSearch,
    notePinned: typeof source.notePinned === 'boolean' ? source.notePinned : defaults.notePinned,
    notePanelSide:
      source.notePanelSide === 'left' || source.notePanelSide === 'right'
        ? source.notePanelSide
        : defaults.notePanelSide,
    notePanelMode:
      source.notePanelMode === 'panel' || source.notePanelMode === 'fullscreen'
        ? source.notePanelMode
        : defaults.notePanelMode,
    noteSort: ['updated-desc', 'created-desc', 'title-asc'].includes(source.noteSort)
      ? source.noteSort
      : defaults.noteSort,
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
  const noteTags = normalizeNoteTags(
    Object.prototype.hasOwnProperty.call(value, 'noteTags') ? value.noteTags : [],
  );
  const noteNotebooks = normalizeNoteNotebooks(
    Object.prototype.hasOwnProperty.call(value, 'noteNotebooks') ? value.noteNotebooks : [],
  );
  const notes = Object.prototype.hasOwnProperty.call(value, 'notes') ? value.notes : [];

  return {
    schemaVersion: SCHEMA_VERSION,
    revision: Number.isSafeInteger(value.revision) && value.revision >= 0 ? value.revision : 0,
    sites: normalizeSites(sites),
    notes: normalizeNotes(notes, noteTags, noteNotebooks),
    noteTags,
    noteNotebooks,
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
      noteTags: normalizedState.noteTags,
      noteNotebooks: normalizedState.noteNotebooks,
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
  normalizeNoteNotebooks,
  normalizeNoteTags,
  normalizeSettings,
  normalizeSiteUrl,
  normalizeSites,
};
