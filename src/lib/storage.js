import {
  BACKUP_VERSION,
  DataValidationError,
  createBackupEnvelope,
  createDefaultSettings,
  normalizeAppState,
  normalizeNotes,
  normalizeSettings,
  normalizeSites,
} from '../domain/dataSchema.js';

function createDefaultSite(name, url, slug = null) {
  return { name, url, icon: { preference: 'auto', slug } };
}

const DEFAULT_SITES = [
  createDefaultSite('Google', 'https://www.google.com', 'google'),
  createDefaultSite('YouTube', 'https://www.youtube.com', 'youtube'),
  createDefaultSite('Wikipedia', 'https://wikipedia.org', 'wikipedia'),
  createDefaultSite('ChatGPT', 'https://chatgpt.com'),
  createDefaultSite('Notion', 'https://www.notion.so', 'notion'),
  createDefaultSite('Gmail', 'https://mail.google.com', 'gmail'),
  createDefaultSite('Google Translate', 'https://translate.google.com', 'googletranslate'),
  createDefaultSite('Netflix', 'https://www.netflix.com', 'netflix'),
  createDefaultSite('Spotify', 'https://open.spotify.com', 'spotify'),
  createDefaultSite('Google Maps', 'https://maps.google.com', 'googlemaps'),
  createDefaultSite('Google Drive', 'https://drive.google.com', 'googledrive'),
  createDefaultSite('WhatsApp Web', 'https://web.whatsapp.com', 'whatsapp'),
  createDefaultSite('Instagram', 'https://www.instagram.com', 'instagram'),
  createDefaultSite('Facebook', 'https://www.facebook.com', 'facebook'),
  createDefaultSite('X', 'https://x.com', 'x'),
  createDefaultSite('LinkedIn', 'https://www.linkedin.com', 'linkedin'),
  createDefaultSite('Pinterest', 'https://www.pinterest.com', 'pinterest'),
  createDefaultSite('Twitch', 'https://www.twitch.tv', 'twitch'),
];

const STATE_KEY = 'tabibe-state';
const STAGING_KEY = 'tabibe-state-staging';
const ROLLBACK_KEY = 'tabibe-state-rollback';
const LEGACY_SITES_KEY = 'tabibe-sites';
const LEGACY_NOTES_KEY = 'tabibe-notes';
const LEGACY_NOTE_KEY = 'tabibe-note';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.4.1';

let writeQueue = Promise.resolve();

class StorageError extends Error {
  constructor(code, cause) {
    super(code);
    this.name = 'StorageError';
    this.code = code;
    this.cause = cause;
  }
}

function hasChromeStorage() {
  return Boolean(globalThis.chrome?.storage?.local);
}

function getSystemTheme() {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function parseStoredValue(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getChromeRuntimeError() {
  return globalThis.chrome?.runtime?.lastError || null;
}

function storageGet(keys = null) {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        const runtimeError = getChromeRuntimeError();
        if (runtimeError) {
          reject(new StorageError('storage_read_failed', runtimeError));
          return;
        }
        resolve(result || {});
      });
    });
  }

  try {
    const requestedKeys =
      keys === null
        ? Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        : Array.isArray(keys)
          ? keys
          : [keys];
    return Promise.resolve(
      Object.fromEntries(
        requestedKeys
          .filter(Boolean)
          .map((key) => [key, parseStoredValue(localStorage.getItem(key))]),
      ),
    );
  } catch (error) {
    return Promise.reject(new StorageError('storage_read_failed', error));
  }
}

function storageSet(values) {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(values, () => {
        const runtimeError = getChromeRuntimeError();
        if (runtimeError) {
          reject(new StorageError('storage_write_failed', runtimeError));
          return;
        }
        resolve();
      });
    });
  }

  try {
    for (const [key, value] of Object.entries(values)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(new StorageError('storage_write_failed', error));
  }
}

function storageRemove(keys) {
  const keyList = Array.isArray(keys) ? keys : [keys];
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keyList, () => {
        const runtimeError = getChromeRuntimeError();
        if (runtimeError) {
          reject(new StorageError('storage_remove_failed', runtimeError));
          return;
        }
        resolve();
      });
    });
  }

  try {
    keyList.forEach((key) => localStorage.removeItem(key));
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(new StorageError('storage_remove_failed', error));
  }
}

function createDefaultSites() {
  return normalizeSites(DEFAULT_SITES.map((site) => ({ ...site, id: crypto.randomUUID() })));
}

function getLegacySettings(values) {
  const readLegacy = (key, fallback) => {
    const value = parseStoredValue(values[`tabibe-${key}`]);
    return value === undefined || value === null ? fallback : value;
  };

  return normalizeSettings(
    {
      theme: readLegacy('theme', getSystemTheme()),
      iconStyle: readLegacy('icon-style', 'favicon'),
      searchEngine: readLegacy('search-engine', 'google'),
      showClock: readLegacy('show-clock', true),
      showSearch: readLegacy('show-search', true),
      notePinned: readLegacy('note-pinned', false),
      backgroundColor: readLegacy('bg-color', ''),
      backgroundImage: readLegacy('bg-image', ''),
      showMemory: readLegacy('show-memory', false),
    },
    getSystemTheme(),
  );
}

function migrateLegacyNotes(values) {
  const storedNotes = parseStoredValue(values[LEGACY_NOTES_KEY]);
  if (Array.isArray(storedNotes)) return normalizeNotes(storedNotes);

  const legacyNote = parseStoredValue(values[LEGACY_NOTE_KEY]);
  if (typeof legacyNote !== 'string' || !legacyNote.trim()) return [];
  const now = new Date().toISOString();
  return normalizeNotes([
    {
      id: crypto.randomUUID(),
      title: legacyNote.split('\n').find((line) => line.trim()) || '',
      content: legacyNote,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

async function migrateLegacyState(values) {
  const hasLegacySites =
    Object.prototype.hasOwnProperty.call(values, LEGACY_SITES_KEY) &&
    values[LEGACY_SITES_KEY] !== null;
  const legacySites = hasLegacySites
    ? parseStoredValue(values[LEGACY_SITES_KEY])
    : createDefaultSites();
  const state = normalizeAppState(
    {
      revision: 0,
      sites: legacySites,
      notes: migrateLegacyNotes(values),
      settings: getLegacySettings(values),
    },
    { defaultSites: createDefaultSites(), systemTheme: getSystemTheme() },
  );

  await storageSet({ [STATE_KEY]: state });
  return state;
}

async function loadState() {
  const values = await storageGet(null);
  if (!values[STATE_KEY]) return migrateLegacyState(values);
  return normalizeAppState(values[STATE_KEY], {
    defaultSites: createDefaultSites(),
    systemTheme: getSystemTheme(),
  });
}

async function saveState(state) {
  const normalizedState = normalizeAppState(state, {
    defaultSites: createDefaultSites(),
    systemTheme: getSystemTheme(),
  });
  await storageSet({ [STATE_KEY]: normalizedState });
  return structuredClone(normalizedState);
}

function updateState(updater) {
  const operation = writeQueue.then(async () => {
    const currentState = await loadState();
    const draft = structuredClone(currentState);
    const candidate = await updater(draft);
    const nextState = candidate || draft;
    nextState.revision = currentState.revision + 1;
    return saveState(nextState);
  });

  writeQueue = operation.catch(() => undefined);
  return operation;
}

async function loadSites() {
  return structuredClone((await loadState()).sites);
}

async function saveSites(sites) {
  const normalizedSites = normalizeSites(sites);
  const state = await updateState((draft) => {
    draft.sites = normalizedSites;
    return draft;
  });
  return structuredClone(state.sites);
}

async function loadNotes() {
  return structuredClone((await loadState()).notes);
}

async function saveNotes(notes) {
  const normalizedNotes = normalizeNotes(notes);
  const state = await updateState((draft) => {
    draft.notes = normalizedNotes;
    return draft;
  });
  return structuredClone(state.notes);
}

async function loadSettings() {
  return structuredClone((await loadState()).settings);
}

async function saveSettings(patch) {
  const state = await updateState((draft) => {
    draft.settings = normalizeSettings({ ...draft.settings, ...patch }, getSystemTheme());
    return draft;
  });
  return structuredClone(state.settings);
}

function parseLegacyBackup(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new DataValidationError('invalid_backup', 'backup');
  }

  const recognizedKeys = Object.keys(data).filter((key) => key.startsWith('tabibe-'));
  if (recognizedKeys.length === 0 || recognizedKeys.length > 50) {
    throw new DataValidationError('invalid_backup_keys', 'backup');
  }

  const sites = Object.prototype.hasOwnProperty.call(data, LEGACY_SITES_KEY)
    ? parseStoredValue(data[LEGACY_SITES_KEY])
    : [];
  return normalizeAppState(
    {
      revision: 0,
      sites,
      notes: migrateLegacyNotes(data),
      settings: getLegacySettings(data),
    },
    { systemTheme: getSystemTheme() },
  );
}

function parseBackup(data) {
  if (data?.backupVersion === BACKUP_VERSION && data.data) {
    return normalizeAppState({ revision: 0, ...data.data }, { systemTheme: getSystemTheme() });
  }
  return parseLegacyBackup(data);
}

async function inspectBackup(data) {
  const state = parseBackup(data);
  return {
    state,
    summary: {
      sites: state.sites.filter((item) => item.type !== 'folder').length,
      folders: state.sites.filter((item) => item.type === 'folder').length,
      folderSites: state.sites.reduce((total, item) => total + (item.children?.length || 0), 0),
      notes: state.notes.length,
    },
  };
}

async function exportBackup() {
  return createBackupEnvelope(await loadState(), APP_VERSION);
}

async function restoreBackup(data) {
  const nextState = parseBackup(data);
  const currentState = await loadState();
  await storageSet({ [ROLLBACK_KEY]: currentState, [STAGING_KEY]: nextState });

  const stagedValues = await storageGet([STAGING_KEY]);
  const verifiedState = normalizeAppState(stagedValues[STAGING_KEY], {
    systemTheme: getSystemTheme(),
  });

  try {
    await storageSet({ [STATE_KEY]: verifiedState });
    await storageRemove(STAGING_KEY);
  } catch (error) {
    await storageSet({ [STATE_KEY]: currentState });
    await storageRemove(STAGING_KEY).catch(() => undefined);
    throw error;
  }

  return structuredClone(verifiedState);
}

async function undoLastRestore() {
  const values = await storageGet([ROLLBACK_KEY]);
  if (!values[ROLLBACK_KEY]) return false;
  await saveState(values[ROLLBACK_KEY]);
  await storageRemove(ROLLBACK_KEY);
  return true;
}

const load_sites = loadSites;
const save_sites = saveSites;
const get_all_data = exportBackup;
const set_all_data = restoreBackup;

export {
  DEFAULT_SITES,
  DataValidationError,
  StorageError,
  createDefaultSettings,
  exportBackup,
  get_all_data,
  inspectBackup,
  loadNotes,
  loadSettings,
  loadSites,
  loadState,
  load_sites,
  restoreBackup,
  saveNotes,
  saveSettings,
  saveSites,
  save_sites,
  set_all_data,
  undoLastRestore,
};
