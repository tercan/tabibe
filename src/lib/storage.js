import {
  BACKUP_VERSION,
  DataValidationError,
  createBackupEnvelope,
  createDefaultSettings,
  normalizeAppState,
  normalizeNoteNotebooks,
  normalizeNoteTags,
  normalizeNotes,
  normalizeSettings,
  normalizeSites,
} from '../domain/dataSchema.js';
import { createDemoNoteWorkspace, mergeDemoNoteWorkspace } from '../data/demoNotes.js';

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
const NOTE_RECOVERY_PREFIX = 'tabibe-note-recovery:';
const DEVELOPMENT_DEMO_QUERY_KEY = 'demo-notes';
const DEVELOPMENT_DEMO_QUERY_VALUE = 'merge-v1';
const DEVELOPMENT_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
const STORAGE_WRITE_LOCK = 'tabibe-state-write';
const DEFAULT_STORAGE_QUOTA_BYTES = 10 * 1024 * 1024;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.5.0';

let writeQueue = Promise.resolve();
const recoveryWriteQueues = new Map();

class StorageError extends Error {
  constructor(code, cause, details = {}) {
    super(code);
    this.name = 'StorageError';
    this.code = code;
    this.cause = cause;
    Object.assign(this, details);
  }
}

class StorageConflictError extends StorageError {
  constructor(conflicts) {
    super('note_revision_conflict');
    this.name = 'StorageConflictError';
    this.conflicts = conflicts;
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

function isQuotaError(error) {
  const message = `${error?.name || ''} ${error?.message || error || ''}`;
  return (
    error?.name === 'QuotaExceededError' ||
    /quota|storage.*(?:full|limit)|exceed.*bytes/i.test(message)
  );
}

function createStorageWriteError(error, details = {}) {
  return new StorageError(
    isQuotaError(error) ? 'storage_quota_exceeded' : 'storage_write_failed',
    error,
    details,
  );
}

function getByteLength(value) {
  return new TextEncoder().encode(value).byteLength;
}

function estimateStorageEntriesBytes(values) {
  return Object.entries(values).reduce(
    (total, [key, value]) => total + getByteLength(key) + getByteLength(JSON.stringify(value)),
    0,
  );
}

function storageGetBytesInUse(keys = null) {
  if (hasChromeStorage() && typeof chrome.storage.local.getBytesInUse === 'function') {
    return new Promise((resolve, reject) => {
      chrome.storage.local.getBytesInUse(keys, (bytesInUse) => {
        const runtimeError = getChromeRuntimeError();
        if (runtimeError) {
          reject(new StorageError('storage_usage_read_failed', runtimeError));
          return;
        }
        resolve(Number.isFinite(bytesInUse) ? bytesInUse : 0);
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
    const bytesInUse = requestedKeys.filter(Boolean).reduce((total, key) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue === null) return total;
      return total + getByteLength(key) + getByteLength(storedValue);
    }, 0);
    return Promise.resolve(bytesInUse);
  } catch (error) {
    return Promise.reject(new StorageError('storage_usage_read_failed', error));
  }
}

async function getStorageUsage(valuesToWrite = null) {
  const usedBytes = await storageGetBytesInUse(null);
  const quotaBytes = hasChromeStorage()
    ? chrome.storage.local.QUOTA_BYTES || DEFAULT_STORAGE_QUOTA_BYTES
    : null;

  if (!valuesToWrite) {
    return {
      usedBytes,
      projectedBytes: usedBytes,
      quotaBytes,
      ratio: quotaBytes ? usedBytes / quotaBytes : null,
    };
  }

  const keys = Object.keys(valuesToWrite);
  const replacedBytes = keys.length > 0 ? await storageGetBytesInUse(keys) : 0;
  const projectedBytes = Math.max(
    0,
    usedBytes - replacedBytes + estimateStorageEntriesBytes(valuesToWrite),
  );
  return {
    usedBytes,
    projectedBytes,
    quotaBytes,
    ratio: quotaBytes ? projectedBytes / quotaBytes : null,
  };
}

async function assertStorageCapacity(values) {
  if (!hasChromeStorage() || typeof chrome.storage.local.getBytesInUse !== 'function') return null;
  const usage = await getStorageUsage(values);
  if (usage.quotaBytes && usage.projectedBytes > usage.quotaBytes) {
    throw new StorageError('storage_quota_exceeded', null, usage);
  }
  return usage;
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

async function storageSet(values) {
  const usage = await assertStorageCapacity(values);

  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(values, () => {
        const runtimeError = getChromeRuntimeError();
        if (runtimeError) {
          reject(createStorageWriteError(runtimeError, usage || {}));
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
    throw createStorageWriteError(error, usage || {});
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
      notePanelSide: readLegacy('note-panel-side', 'left'),
      notePanelMode: readLegacy('note-panel-mode', 'panel'),
      noteSort: readLegacy('note-sort', 'updated-desc'),
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
  const initialNoteWorkspace =
    Object.keys(values).length === 0
      ? createDemoNoteWorkspace()
      : {
          notes: migrateLegacyNotes(values),
          noteTags: [],
          noteNotebooks: [],
        };
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
      ...initialNoteWorkspace,
      settings: getLegacySettings(values),
    },
    { defaultSites: createDefaultSites(), systemTheme: getSystemTheme() },
  );

  await storageSet({ [STATE_KEY]: state });
  return state;
}

function normalizeStoredState(value) {
  return normalizeAppState(value, {
    defaultSites: createDefaultSites(),
    systemTheme: getSystemTheme(),
  });
}

async function loadStateUnlocked(values = null) {
  const storedValues = values || (await storageGet(null));
  if (!Object.prototype.hasOwnProperty.call(storedValues, STATE_KEY)) {
    return migrateLegacyState(storedValues);
  }
  return normalizeStoredState(storedValues[STATE_KEY]);
}

async function loadState() {
  const values = await storageGet(null);
  if (Object.prototype.hasOwnProperty.call(values, STATE_KEY)) {
    return normalizeStoredState(values[STATE_KEY]);
  }

  return enqueueStateWrite(async () => loadStateUnlocked(await storageGet(null)));
}

function isDevelopmentDemoRequest() {
  if (!import.meta.env.DEV || !DEVELOPMENT_ORIGINS.has(globalThis.location?.origin)) return false;
  return (
    new URLSearchParams(globalThis.location.search).get(DEVELOPMENT_DEMO_QUERY_KEY) ===
    DEVELOPMENT_DEMO_QUERY_VALUE
  );
}

async function mergeDevelopmentDemoNotes() {
  if (!isDevelopmentDemoRequest()) {
    return { status: 'not-requested', addedNotes: 0, addedTags: 0, addedNotebooks: 0 };
  }

  return enqueueStateWrite(async () => {
    const values = await storageGet(null);
    const currentState = await loadStateUnlocked(values);
    const mergeResult = mergeDemoNoteWorkspace(currentState);
    if (!mergeResult.didChange) {
      return { status: 'already-present', addedNotes: 0, addedTags: 0, addedNotebooks: 0 };
    }

    const nextState = normalizeAppState(
      {
        ...currentState,
        ...mergeResult.workspace,
        revision: currentState.revision + 1,
      },
      { defaultSites: createDefaultSites(), systemTheme: getSystemTheme() },
    );
    await storageSet({ [STATE_KEY]: nextState });
    return {
      status: 'merged',
      addedNotes: mergeResult.addedNotes,
      addedTags: mergeResult.addedTags,
      addedNotebooks: mergeResult.addedNotebooks,
    };
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

function runWithStorageWriteLock(operation) {
  if (typeof globalThis.navigator?.locks?.request === 'function') {
    return globalThis.navigator.locks.request(STORAGE_WRITE_LOCK, { mode: 'exclusive' }, operation);
  }
  return operation();
}

function enqueueStateWrite(operationFactory) {
  const operation = writeQueue.then(() => runWithStorageWriteLock(operationFactory));

  // Keep later writes available while returning the original rejection to the current caller.
  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

function updateState(updater) {
  return enqueueStateWrite(async () => {
    const currentState = await loadStateUnlocked();
    const draft = structuredClone(currentState);
    const candidate = await updater(draft);
    const nextState = candidate || draft;
    nextState.revision = currentState.revision + 1;
    return saveState(nextState);
  });
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
  const state = await updateState((draft) => {
    draft.notes = normalizeNotes(notes, draft.noteTags, draft.noteNotebooks);
    return draft;
  });
  return structuredClone(state.notes);
}

function createRevisionSnapshot(notes) {
  return Object.fromEntries(notes.map((note) => [note.id, note.revision]));
}

function createOrganizationSnapshot(noteTags, noteNotebooks) {
  return JSON.stringify({ noteTags, noteNotebooks });
}

function getNoteMutationIds(currentNotes, candidateNotes, expectedRevisions) {
  const currentById = new Map(currentNotes.map((note) => [note.id, note]));
  const candidateById = new Map(candidateNotes.map((note) => [note.id, note]));
  const changedIds = new Set();
  const deletedIds = new Set();

  candidateNotes.forEach((note) => {
    const currentNote = currentById.get(note.id) || null;
    const expectedRevision = expectedRevisions[note.id];
    if (
      !Object.prototype.hasOwnProperty.call(expectedRevisions, note.id) ||
      note.revision !== expectedRevision ||
      (currentNote?.revision === expectedRevision &&
        JSON.stringify(currentNote) !== JSON.stringify(note))
    ) {
      changedIds.add(note.id);
    }
  });
  Object.keys(expectedRevisions).forEach((noteId) => {
    if (!candidateById.has(noteId)) deletedIds.add(noteId);
  });

  return { changedIds, deletedIds };
}

function findNoteRevisionConflicts(
  currentNotes,
  candidateNotes,
  expectedRevisions,
  changedIds,
  deletedIds,
) {
  const currentById = new Map(currentNotes.map((note) => [note.id, note]));
  const candidateById = new Map(candidateNotes.map((note) => [note.id, note]));
  const noteIds = new Set([...changedIds, ...deletedIds]);
  const conflicts = [];

  noteIds.forEach((noteId) => {
    const currentNote = currentById.get(noteId) || null;
    const candidateNote = candidateById.get(noteId) || null;
    const hasExpectedRevision = Object.prototype.hasOwnProperty.call(expectedRevisions, noteId);
    const expectedRevision = hasExpectedRevision ? expectedRevisions[noteId] : undefined;
    const currentRevision = currentNote?.revision ?? null;
    const notesMatch = JSON.stringify(currentNote) === JSON.stringify(candidateNote);

    if (
      (hasExpectedRevision && currentRevision !== expectedRevision && !notesMatch) ||
      (!hasExpectedRevision && currentNote && !notesMatch)
    ) {
      conflicts.push({ noteId, localNote: candidateNote, externalNote: currentNote });
    }
  });

  return conflicts;
}

function mergeNoteMutations(currentNotes, candidateNotes, expectedRevisions) {
  const candidateById = new Map(candidateNotes.map((note) => [note.id, note]));
  const currentById = new Map(currentNotes.map((note) => [note.id, note]));
  const { changedIds, deletedIds } = getNoteMutationIds(
    currentNotes,
    candidateNotes,
    expectedRevisions,
  );
  const conflicts = findNoteRevisionConflicts(
    currentNotes,
    candidateNotes,
    expectedRevisions,
    changedIds,
    deletedIds,
  );
  if (conflicts.length > 0) throw new StorageConflictError(conflicts);

  const orderedIds = [
    ...candidateNotes.map((note) => note.id),
    ...currentNotes.map((note) => note.id),
  ];
  const seenIds = new Set();
  const notes = [];

  orderedIds.forEach((noteId) => {
    if (seenIds.has(noteId) || deletedIds.has(noteId)) return;
    seenIds.add(noteId);
    if (changedIds.has(noteId)) {
      const candidate = candidateById.get(noteId);
      const current = currentById.get(noteId);
      if (candidate) {
        notes.push(
          current && candidate.revision <= current.revision
            ? { ...candidate, revision: current.revision + 1 }
            : candidate,
        );
      }
      return;
    }
    const current = currentById.get(noteId);
    if (current) notes.push(current);
  });

  return notes;
}

function toNoteWorkspace(state) {
  return {
    notes: structuredClone(state.notes),
    noteTags: structuredClone(state.noteTags),
    noteNotebooks: structuredClone(state.noteNotebooks),
    stateRevision: state.revision,
    noteRevisions: createRevisionSnapshot(state.notes),
    organizationSnapshot: createOrganizationSnapshot(state.noteTags, state.noteNotebooks),
  };
}

async function loadNoteWorkspace() {
  return toNoteWorkspace(await loadState());
}

async function saveNoteWorkspace(workspace, options = {}) {
  const normalizedTags = normalizeNoteTags(workspace.noteTags || []);
  const normalizedNotebooks = normalizeNoteNotebooks(workspace.noteNotebooks || []);
  const normalizedNotes = normalizeNotes(
    workspace.notes || [],
    normalizedTags,
    normalizedNotebooks,
  );
  const expectedRevisions = options.expectedRevisions || {};
  const state = await updateState((draft) => {
    const currentOrganizationSnapshot = createOrganizationSnapshot(
      draft.noteTags,
      draft.noteNotebooks,
    );
    const candidateOrganizationSnapshot = createOrganizationSnapshot(
      normalizedTags,
      normalizedNotebooks,
    );
    const expectedOrganizationSnapshot = options.expectedOrganizationSnapshot;
    const organizationChanged =
      typeof expectedOrganizationSnapshot === 'string'
        ? candidateOrganizationSnapshot !== expectedOrganizationSnapshot
        : candidateOrganizationSnapshot !== currentOrganizationSnapshot;

    if (
      organizationChanged &&
      typeof expectedOrganizationSnapshot === 'string' &&
      currentOrganizationSnapshot !== expectedOrganizationSnapshot &&
      currentOrganizationSnapshot !== candidateOrganizationSnapshot
    ) {
      throw new StorageConflictError([
        {
          type: 'organization',
          noteId: null,
          localNote: null,
          externalNote: null,
          localWorkspace: {
            noteTags: normalizedTags,
            noteNotebooks: normalizedNotebooks,
          },
          externalWorkspace: {
            noteTags: draft.noteTags,
            noteNotebooks: draft.noteNotebooks,
          },
        },
      ]);
    }

    const nextTags = organizationChanged ? normalizedTags : draft.noteTags;
    const nextNotebooks = organizationChanged ? normalizedNotebooks : draft.noteNotebooks;
    const mergedNotes = mergeNoteMutations(draft.notes, normalizedNotes, expectedRevisions);
    draft.notes = normalizeNotes(mergedNotes, nextTags, nextNotebooks);
    draft.noteTags = nextTags;
    draft.noteNotebooks = nextNotebooks;
    return draft;
  });
  return toNoteWorkspace(state);
}

function getRecoveryKey(sessionId) {
  if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(sessionId)) {
    throw new DataValidationError('invalid_recovery_session', 'sessionId');
  }
  return `${NOTE_RECOVERY_PREFIX}${sessionId}`;
}

function normalizeRecoveryDraft(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new DataValidationError('invalid_recovery_draft', 'recoveryDraft');
  }
  if (!Number.isSafeInteger(value.generation) || value.generation < 1) {
    throw new DataValidationError('invalid_recovery_generation', 'generation');
  }
  if (typeof value.noteId !== 'string' || !value.noteId.trim()) {
    throw new DataValidationError('invalid_recovery_note', 'noteId');
  }
  getRecoveryKey(value.sessionId);
  if (typeof value.title !== 'string' || typeof value.content !== 'string') {
    throw new DataValidationError('invalid_recovery_content', 'recoveryDraft');
  }

  return {
    draftVersion: 1,
    sessionId: value.sessionId,
    noteId: value.noteId.trim(),
    captureSessionId:
      typeof value.captureSessionId === 'string' && value.captureSessionId.trim()
        ? value.captureSessionId.trim()
        : null,
    title: value.title,
    content: value.content,
    createdAt:
      typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt))
        ? new Date(value.createdAt).toISOString()
        : new Date().toISOString(),
    updatedAt:
      typeof value.updatedAt === 'string' && !Number.isNaN(Date.parse(value.updatedAt))
        ? new Date(value.updatedAt).toISOString()
        : new Date().toISOString(),
    baseRevision:
      Number.isSafeInteger(value.baseRevision) && value.baseRevision >= 0 ? value.baseRevision : 0,
    generation: value.generation,
  };
}

function enqueueRecoveryWrite(sessionId, operationFactory) {
  const currentQueue = recoveryWriteQueues.get(sessionId) || Promise.resolve();
  const operation = currentQueue.then(operationFactory);
  const nextQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  recoveryWriteQueues.set(sessionId, nextQueue);
  void nextQueue.finally(() => {
    if (recoveryWriteQueues.get(sessionId) === nextQueue) recoveryWriteQueues.delete(sessionId);
  });
  return operation;
}

async function saveNoteRecoveryDraft(draft) {
  const sessionId = draft?.sessionId;
  const key = getRecoveryKey(sessionId);
  const normalizedDraft = normalizeRecoveryDraft(draft);
  return enqueueRecoveryWrite(sessionId, async () => {
    const stored = (await storageGet([key]))[key];
    if (stored) {
      const currentDraft = normalizeRecoveryDraft(stored);
      if (currentDraft.generation > normalizedDraft.generation) {
        return structuredClone(currentDraft);
      }
    }
    await storageSet({ [key]: normalizedDraft });
    return structuredClone(normalizedDraft);
  });
}

async function clearNoteRecoveryDraft(sessionId, throughGeneration = null) {
  const key = getRecoveryKey(sessionId);
  return enqueueRecoveryWrite(sessionId, async () => {
    const stored = (await storageGet([key]))[key];
    if (!stored) return false;
    const currentDraft = normalizeRecoveryDraft(stored);
    if (
      throughGeneration !== null &&
      (!Number.isSafeInteger(throughGeneration) || currentDraft.generation > throughGeneration)
    ) {
      return false;
    }
    await storageRemove(key);
    return true;
  });
}

async function loadNoteRecoveryDrafts() {
  const values = await storageGet(null);
  return Object.entries(values)
    .filter(([key]) => key.startsWith(NOTE_RECOVERY_PREFIX))
    .flatMap(([, value]) => {
      try {
        return [normalizeRecoveryDraft(value)];
      } catch {
        return [];
      }
    })
    .sort((firstDraft, secondDraft) => secondDraft.updatedAt.localeCompare(firstDraft.updatedAt))
    .map((draft) => structuredClone(draft));
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
  if (
    Number.isSafeInteger(data?.backupVersion) &&
    data.backupVersion >= 1 &&
    data.backupVersion <= BACKUP_VERSION &&
    data.data
  ) {
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
      noteTags: state.noteTags.length,
      noteNotebooks: state.noteNotebooks.length,
    },
  };
}

async function exportBackup() {
  return createBackupEnvelope(await loadState(), APP_VERSION);
}

async function restoreBackup(data) {
  const nextState = parseBackup(data);
  return enqueueStateWrite(async () => {
    const currentState = await loadStateUnlocked();
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
      await Promise.allSettled([storageRemove(STAGING_KEY)]);
      throw error;
    }

    return structuredClone(verifiedState);
  });
}

async function undoLastRestore() {
  return enqueueStateWrite(async () => {
    const values = await storageGet([ROLLBACK_KEY]);
    if (!values[ROLLBACK_KEY]) return false;
    await saveState(values[ROLLBACK_KEY]);
    await storageRemove(ROLLBACK_KEY);
    return true;
  });
}

async function resetApplicationData() {
  return enqueueStateWrite(async () => {
    const values = await storageGet([STATE_KEY]);
    let rollbackState = null;

    if (values[STATE_KEY]) {
      try {
        rollbackState = normalizeAppState(values[STATE_KEY], {
          defaultSites: createDefaultSites(),
          systemTheme: getSystemTheme(),
        });
      } catch {
        rollbackState = null;
      }
    }

    const nextState = normalizeAppState(
      {
        revision: (rollbackState?.revision || 0) + 1,
        sites: createDefaultSites(),
        notes: [],
        noteTags: [],
        noteNotebooks: [],
        settings: createDefaultSettings(getSystemTheme()),
      },
      { defaultSites: createDefaultSites(), systemTheme: getSystemTheme() },
    );

    const write = rollbackState
      ? { [ROLLBACK_KEY]: rollbackState, [STATE_KEY]: nextState }
      : { [STATE_KEY]: nextState };
    await storageSet(write);
    await storageRemove(STAGING_KEY);
    return structuredClone(nextState);
  });
}

function subscribeToStateChanges(listener, onError = () => {}) {
  if (globalThis.chrome?.storage?.onChanged) {
    const handleChange = (changes, areaName) => {
      const nextState = changes[STATE_KEY]?.newValue;
      if (areaName !== 'local' || !nextState) return;
      try {
        listener(
          toNoteWorkspace(
            normalizeAppState(nextState, {
              defaultSites: createDefaultSites(),
              systemTheme: getSystemTheme(),
            }),
          ),
        );
      } catch (error) {
        onError(new StorageError('storage_external_state_invalid', error));
      }
    };
    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }

  const handleStorage = (event) => {
    if (event.key !== STATE_KEY || !event.newValue) return;
    try {
      listener(
        toNoteWorkspace(
          normalizeAppState(JSON.parse(event.newValue), {
            defaultSites: createDefaultSites(),
            systemTheme: getSystemTheme(),
          }),
        ),
      );
    } catch (error) {
      onError(new StorageError('storage_external_state_invalid', error));
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

export {
  DEFAULT_SITES,
  DataValidationError,
  StorageError,
  StorageConflictError,
  clearNoteRecoveryDraft,
  createDefaultSettings,
  exportBackup,
  mergeDevelopmentDemoNotes,
  getStorageUsage,
  inspectBackup,
  loadNoteRecoveryDrafts,
  loadNotes,
  loadNoteWorkspace,
  loadSettings,
  loadSites,
  loadState,
  restoreBackup,
  resetApplicationData,
  saveNotes,
  saveNoteRecoveryDraft,
  saveNoteWorkspace,
  saveSettings,
  saveSites,
  subscribeToStateChanges,
  undoLastRestore,
};
