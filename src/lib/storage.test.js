import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearNoteRecoveryDraft,
  exportBackup,
  getStorageUsage,
  inspectBackup,
  loadNoteRecoveryDrafts,
  loadNoteWorkspace,
  loadNotes,
  loadSettings,
  loadSites,
  loadState,
  mergeDevelopmentDemoNotes,
  resetApplicationData,
  restoreBackup,
  saveNoteWorkspace,
  saveNoteRecoveryDraft,
  saveSettings,
  saveSites,
  undoLastRestore,
} from './storage.js';

const originalChromeDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'chrome');
const originalLocksDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'locks');

describe('storage repository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalChromeDescriptor) {
      Object.defineProperty(globalThis, 'chrome', originalChromeDescriptor);
    } else {
      delete globalThis.chrome;
    }
    if (originalLocksDescriptor) {
      Object.defineProperty(globalThis.navigator, 'locks', originalLocksDescriptor);
    } else {
      delete globalThis.navigator.locks;
    }
  });

  it('seeds demo notes exactly once for a completely fresh installation', async () => {
    const [firstState, concurrentState] = await Promise.all([loadState(), loadState()]);
    const secondState = await loadState();

    expect(firstState.notes).toHaveLength(12);
    expect(firstState.notes.filter((note) => !note.isArchived)).toHaveLength(11);
    expect(firstState.noteTags).toHaveLength(4);
    expect(firstState.noteNotebooks).toHaveLength(3);
    expect(concurrentState).toEqual(firstState);
    expect(secondState).toEqual(firstState);
  });

  it('does not add demo notes to an existing empty or legacy installation', async () => {
    localStorage.setItem(
      'tabibe-state',
      JSON.stringify({
        revision: 4,
        sites: [],
        notes: [],
        noteTags: [],
        noteNotebooks: [],
        settings: {},
      }),
    );
    expect((await loadState()).notes).toEqual([]);

    localStorage.clear();
    localStorage.setItem('tabibe-theme', 'dark');
    const legacyState = await loadState();
    expect(legacyState.notes).toEqual([]);
    expect(legacyState.settings.theme).toBe('dark');
  });

  it('does not overwrite a present but invalid state with demo content', async () => {
    localStorage.setItem('tabibe-state', 'null');

    await expect(loadState()).rejects.toMatchObject({ code: 'invalid_state' });
    expect(localStorage.getItem('tabibe-state')).toBe('null');
  });

  it('merges demos once on an explicit localhost development request', async () => {
    const now = '2026-09-04T12:00:00.000Z';
    const userNote = {
      id: 'user-note',
      title: 'Kullanıcı notu',
      content: 'Bu içerik korunmalı.',
      tagIds: ['user-work-tag'],
      notebookId: 'user-work-notebook',
      captureSessionId: null,
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      revision: 4,
    };
    localStorage.setItem(
      'tabibe-state',
      JSON.stringify({
        revision: 7,
        sites: [{ id: 'user-site', name: 'User site', url: 'https://example.com' }],
        notes: [userNote],
        noteTags: [
          {
            id: 'user-work-tag',
            name: 'İş',
            colorToken: 'green',
            createdAt: now,
            updatedAt: now,
          },
        ],
        noteNotebooks: [{ id: 'user-work-notebook', name: 'İş', createdAt: now, updatedAt: now }],
        settings: { theme: 'dark' },
      }),
    );
    window.history.replaceState({}, '', '/?demo-notes=merge-v1');

    const firstResult = await mergeDevelopmentDemoNotes();
    const firstState = await loadState();

    expect(firstResult).toMatchObject({
      status: 'merged',
      addedNotes: 12,
      addedTags: 3,
      addedNotebooks: 2,
    });
    expect(firstState.revision).toBe(8);
    expect(firstState.sites[0].id).toBe('user-site');
    expect(firstState.settings.theme).toBe('dark');
    expect(firstState.notes.find((note) => note.id === 'user-note')).toMatchObject(userNote);
    expect(firstState.notes).toHaveLength(13);

    const secondResult = await mergeDevelopmentDemoNotes();
    const secondState = await loadState();
    expect(secondResult.status).toBe('already-present');
    expect(secondState.revision).toBe(8);
    expect(secondState.notes).toHaveLength(13);

    window.history.replaceState({}, '', '/');
    expect((await mergeDevelopmentDemoNotes()).status).toBe('not-requested');
  });

  it('preserves an empty legacy dashboard instead of reseeding defaults', async () => {
    localStorage.setItem('tabibe-sites', JSON.stringify([]));
    expect(await loadSites()).toEqual([]);
  });

  it('migrates legacy settings into the versioned state', async () => {
    localStorage.setItem('tabibe-theme', 'dark');
    localStorage.setItem('tabibe-show-clock', 'false');

    const settings = await loadSettings();
    expect(settings.theme).toBe('dark');
    expect(settings.showClock).toBe(false);
  });

  it('exports and restores a versioned backup envelope', async () => {
    await saveSites([{ id: 'site-1', name: 'Example', url: 'https://example.com' }]);
    await saveSettings({ theme: 'dark' });
    const backup = await exportBackup();

    expect(backup.backupVersion).toBe(3);
    expect(backup.data.sites[0].url).toBe('https://example.com/');
    expect(backup.data.notes).toHaveLength(12);
    expect(backup.data.noteTags).toHaveLength(4);
    expect(backup.data.noteNotebooks).toHaveLength(3);

    await saveSites([]);
    await restoreBackup(backup);
    expect(await loadSites()).toHaveLength(1);
  });

  it('rejects unsafe URLs from legacy backups before writing', async () => {
    await expect(
      restoreBackup({
        'tabibe-sites': JSON.stringify([
          { id: 'unsafe', name: 'Unsafe', url: 'javascript:alert(1)' },
        ]),
      }),
    ).rejects.toThrow('unsafe_url_protocol');
  });

  it('migrates a v0.3.0 backup and re-exports the complete current model', async () => {
    const legacyBackup = {
      'tabibe-sites': JSON.stringify([
        {
          id: 'legacy-site',
          name: 'Legacy site',
          url: 'https://legacy.example',
          icon_slug: 'google',
        },
        {
          type: 'folder',
          id: 'legacy-folder',
          name: 'Legacy folder',
          children: [
            {
              id: 'legacy-child',
              name: 'Legacy child',
              url: 'https://child.example',
            },
          ],
        },
      ]),
      'tabibe-notes': JSON.stringify([
        {
          id: 'legacy-note',
          title: 'Legacy note',
          content: 'Migrated note content',
          isPinned: true,
        },
      ]),
      'tabibe-theme': 'dark',
      'tabibe-icon-style': 'simple',
      'tabibe-search-engine': 'duckduckgo',
    };

    const preview = await inspectBackup(legacyBackup);
    expect(preview.summary).toEqual({
      sites: 1,
      folders: 1,
      folderSites: 1,
      notes: 1,
      noteTags: 0,
      noteNotebooks: 0,
    });

    await restoreBackup(legacyBackup);
    const migratedBackup = await exportBackup();

    expect(migratedBackup.backupVersion).toBe(3);
    expect(migratedBackup.data.sites[0].icon).toEqual({ preference: 'auto', slug: 'google' });
    expect(migratedBackup.data.sites[1].children[0].icon).toEqual({
      preference: 'auto',
      slug: null,
    });
    expect(migratedBackup.data.notes).toHaveLength(1);
    expect(migratedBackup.data.notes[0]).toMatchObject({
      tagIds: [],
      notebookId: null,
      revision: 1,
    });
    expect(migratedBackup.data.noteTags).toEqual([]);
    expect(migratedBackup.data.noteNotebooks).toEqual([]);
    expect((await loadNotes())[0].content).toBe('Migrated note content');
    expect(migratedBackup.data.settings).toMatchObject({
      theme: 'dark',
      iconStyle: 'simple',
      searchEngine: 'browser',
      searchEngineChoiceVersion: 1,
    });
  });

  it('restores v1 backups and migrates note organization fields', async () => {
    await restoreBackup({
      backupVersion: 1,
      appVersion: '1.0.1',
      exportedAt: new Date().toISOString(),
      data: {
        sites: [],
        notes: [{ id: 'legacy-note', title: 'Legacy', content: '' }],
        settings: { notePinned: true },
      },
    });

    const workspace = await loadNoteWorkspace();
    expect(workspace.noteTags).toEqual([]);
    expect(workspace.noteNotebooks).toEqual([]);
    expect(workspace.notes[0]).toMatchObject({
      id: 'legacy-note',
      tagIds: [],
      notebookId: null,
      revision: 1,
    });
    expect((await loadSettings()).notePinned).toBe(true);
  });

  it('saves tags and notebooks with notes and rejects stale note revisions', async () => {
    const initialWorkspace = await loadNoteWorkspace();
    const note = {
      id: 'shared-note',
      title: 'Shared',
      content: 'Initial',
      tagIds: ['work'],
      notebookId: 'projects',
      isPinned: false,
      isArchived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      revision: 1,
    };
    const tag = {
      id: 'work',
      name: 'Work',
      colorToken: 'blue',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const notebook = {
      id: 'projects',
      name: 'Projects',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const firstSave = await saveNoteWorkspace(
      { notes: [note], noteTags: [tag], noteNotebooks: [notebook] },
      {
        expectedRevisions: initialWorkspace.noteRevisions,
      },
    );
    const secondSave = await saveNoteWorkspace(
      {
        notes: [{ ...firstSave.notes[0], content: 'External', revision: 2 }],
        noteTags: firstSave.noteTags,
        noteNotebooks: firstSave.noteNotebooks,
      },
      { expectedRevisions: firstSave.noteRevisions },
    );

    await expect(
      saveNoteWorkspace(
        {
          notes: [{ ...firstSave.notes[0], content: 'Stale local', revision: 2 }],
          noteTags: firstSave.noteTags,
          noteNotebooks: firstSave.noteNotebooks,
        },
        { expectedRevisions: firstSave.noteRevisions },
      ),
    ).rejects.toMatchObject({
      code: 'note_revision_conflict',
      conflicts: [
        expect.objectContaining({
          noteId: 'shared-note',
          externalNote: expect.objectContaining({ content: 'External', revision: 2 }),
        }),
      ],
    });
    expect(secondSave.noteTags[0].name).toBe('Work');
    expect(secondSave.noteNotebooks[0].name).toBe('Projects');
    expect(secondSave.notes[0].notebookId).toBe('projects');
  });

  it('merges concurrent edits to different notes without replacing the full workspace', async () => {
    const initialWorkspace = await loadNoteWorkspace();
    const now = '2026-01-01T00:00:00.000Z';
    const createNote = (id, content) => ({
      id,
      title: id,
      content,
      tagIds: [],
      notebookId: null,
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      revision: 1,
    });
    const seededWorkspace = await saveNoteWorkspace(
      {
        notes: [createNote('first', 'Initial first'), createNote('second', 'Initial second')],
        noteTags: [],
        noteNotebooks: [],
      },
      {
        expectedRevisions: initialWorkspace.noteRevisions,
        expectedOrganizationSnapshot: initialWorkspace.organizationSnapshot,
      },
    );
    const firstTab = structuredClone(seededWorkspace);
    const secondTab = structuredClone(seededWorkspace);

    firstTab.notes[0] = { ...firstTab.notes[0], content: 'First tab edit', revision: 2 };
    secondTab.notes[1] = { ...secondTab.notes[1], content: 'Second tab edit', revision: 2 };

    await saveNoteWorkspace(firstTab, {
      expectedRevisions: seededWorkspace.noteRevisions,
      expectedOrganizationSnapshot: seededWorkspace.organizationSnapshot,
    });
    await saveNoteWorkspace(secondTab, {
      expectedRevisions: seededWorkspace.noteRevisions,
      expectedOrganizationSnapshot: seededWorkspace.organizationSnapshot,
    });

    const finalWorkspace = await loadNoteWorkspace();
    expect(finalWorkspace.notes.find((note) => note.id === 'first')?.content).toBe(
      'First tab edit',
    );
    expect(finalWorkspace.notes.find((note) => note.id === 'second')?.content).toBe(
      'Second tab edit',
    );
  });

  it('assigns a monotonic revision when a changed candidate forgets to increment it', async () => {
    const initialWorkspace = await loadNoteWorkspace();
    const now = '2026-01-01T00:00:00.000Z';
    const seededWorkspace = await saveNoteWorkspace(
      {
        notes: [
          {
            id: 'monotonic-note',
            title: 'Monotonic',
            content: 'Initial',
            tagIds: [],
            notebookId: null,
            isPinned: false,
            isArchived: false,
            createdAt: now,
            updatedAt: now,
            revision: 1,
          },
        ],
        noteTags: [],
        noteNotebooks: [],
      },
      {
        expectedRevisions: initialWorkspace.noteRevisions,
        expectedOrganizationSnapshot: initialWorkspace.organizationSnapshot,
      },
    );

    const savedWorkspace = await saveNoteWorkspace(
      {
        ...seededWorkspace,
        notes: [{ ...seededWorkspace.notes[0], content: 'Changed without revision bump' }],
      },
      {
        expectedRevisions: seededWorkspace.noteRevisions,
        expectedOrganizationSnapshot: seededWorkspace.organizationSnapshot,
      },
    );

    expect(savedWorkspace.notes[0]).toMatchObject({
      content: 'Changed without revision bump',
      revision: 2,
    });
  });

  it('rejects concurrent organization replacement against a stale snapshot', async () => {
    const initialWorkspace = await loadNoteWorkspace();
    const now = '2026-01-01T00:00:00.000Z';
    const firstOrganization = {
      ...initialWorkspace,
      noteTags: [{ id: 'work', name: 'Work', colorToken: 'blue', createdAt: now, updatedAt: now }],
    };
    const secondOrganization = {
      ...initialWorkspace,
      noteTags: [
        {
          id: 'personal',
          name: 'Personal',
          colorToken: 'green',
          createdAt: now,
          updatedAt: now,
        },
      ],
    };

    await saveNoteWorkspace(firstOrganization, {
      expectedRevisions: initialWorkspace.noteRevisions,
      expectedOrganizationSnapshot: initialWorkspace.organizationSnapshot,
    });
    await expect(
      saveNoteWorkspace(secondOrganization, {
        expectedRevisions: initialWorkspace.noteRevisions,
        expectedOrganizationSnapshot: initialWorkspace.organizationSnapshot,
      }),
    ).rejects.toMatchObject({
      code: 'note_revision_conflict',
      conflicts: [expect.objectContaining({ type: 'organization' })],
    });
  });

  it('serializes state writes through the origin-wide Web Lock when available', async () => {
    const request = vi.fn((_name, _options, operation) => operation());
    Object.defineProperty(globalThis.navigator, 'locks', {
      configurable: true,
      value: { request },
    });

    await saveSites([{ id: 'locked', name: 'Locked', url: 'https://locked.example' }]);

    expect(request).toHaveBeenCalledWith(
      'tabibe-state-write',
      { mode: 'exclusive' },
      expect.any(Function),
    );
  });

  it('preserves different-note edits from independent repository contexts under one Web Lock', async () => {
    let lockQueue = Promise.resolve();
    let activeWriters = 0;
    let maximumActiveWriters = 0;
    const request = vi.fn((_name, _options, operation) => {
      const execution = lockQueue.then(async () => {
        activeWriters += 1;
        maximumActiveWriters = Math.max(maximumActiveWriters, activeWriters);
        try {
          await Promise.resolve();
          return await operation();
        } finally {
          activeWriters -= 1;
        }
      });
      lockQueue = execution.then(
        () => undefined,
        () => undefined,
      );
      return execution;
    });
    Object.defineProperty(globalThis.navigator, 'locks', {
      configurable: true,
      value: { request },
    });
    const firstRepository = await import('./storage.js?writer=first');
    const secondRepository = await import('./storage.js?writer=second');
    const initialWorkspace = await loadNoteWorkspace();
    const now = '2026-01-01T00:00:00.000Z';
    const createNote = (id) => ({
      id,
      title: id,
      content: 'Initial',
      tagIds: [],
      notebookId: null,
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      revision: 1,
    });
    const seededWorkspace = await saveNoteWorkspace(
      {
        notes: [createNote('first-context-note'), createNote('second-context-note')],
        noteTags: [],
        noteNotebooks: [],
      },
      {
        expectedRevisions: initialWorkspace.noteRevisions,
        expectedOrganizationSnapshot: initialWorkspace.organizationSnapshot,
      },
    );
    const firstWorkspace = await firstRepository.loadNoteWorkspace();
    const secondWorkspace = await secondRepository.loadNoteWorkspace();
    firstWorkspace.notes[0] = {
      ...firstWorkspace.notes[0],
      content: 'Written by first context',
      revision: 2,
    };
    secondWorkspace.notes[1] = {
      ...secondWorkspace.notes[1],
      content: 'Written by second context',
      revision: 2,
    };

    await Promise.all([
      firstRepository.saveNoteWorkspace(firstWorkspace, {
        expectedRevisions: seededWorkspace.noteRevisions,
        expectedOrganizationSnapshot: seededWorkspace.organizationSnapshot,
      }),
      secondRepository.saveNoteWorkspace(secondWorkspace, {
        expectedRevisions: seededWorkspace.noteRevisions,
        expectedOrganizationSnapshot: seededWorkspace.organizationSnapshot,
      }),
    ]);

    const finalWorkspace = await loadNoteWorkspace();
    expect(maximumActiveWriters).toBe(1);
    expect(finalWorkspace.notes.map((note) => note.content)).toEqual([
      'Written by first context',
      'Written by second context',
    ]);
  });

  it('keeps the newest recovery generation until that generation is committed', async () => {
    const baseDraft = {
      sessionId: 'session-one',
      noteId: 'note-one',
      title: '',
      content: 'First character',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      baseRevision: 0,
      generation: 1,
    };
    await saveNoteRecoveryDraft(baseDraft);
    await saveNoteRecoveryDraft({
      ...baseDraft,
      content: 'Newest text',
      generation: 2,
      updatedAt: '2026-01-01T00:00:01.000Z',
    });

    expect(await clearNoteRecoveryDraft('session-one', 1)).toBe(false);
    expect(await loadNoteRecoveryDrafts()).toEqual([
      expect.objectContaining({ sessionId: 'session-one', content: 'Newest text', generation: 2 }),
    ]);
    expect(await clearNoteRecoveryDraft('session-one', 2)).toBe(true);
    expect(await loadNoteRecoveryDrafts()).toEqual([]);
  });

  it('classifies quota failures and reports projected Chrome storage use', async () => {
    const values = {};
    const set = vi.fn((_nextValues, callback) => callback());
    const get = vi.fn((keys, callback) => {
      const requestedKeys = Array.isArray(keys) ? keys : Object.keys(values);
      callback(
        Object.fromEntries(
          requestedKeys.filter((key) => key in values).map((key) => [key, values[key]]),
        ),
      );
    });
    const getBytesInUse = vi.fn((keys, callback) => {
      callback(keys === null ? 90 : 0);
    });
    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        runtime: { lastError: null },
        storage: {
          local: { QUOTA_BYTES: 100, get, getBytesInUse, set },
        },
      },
    });

    const usage = await getStorageUsage({ oversized: 'x'.repeat(50) });
    expect(usage).toMatchObject({ usedBytes: 90, quotaBytes: 100 });
    expect(usage.projectedBytes).toBeGreaterThan(100);
    await expect(
      saveNoteRecoveryDraft({
        sessionId: 'quota-session',
        noteId: 'quota-note',
        title: '',
        content: 'Draft',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        baseRevision: 0,
        generation: 1,
      }),
    ).rejects.toMatchObject({
      code: 'storage_quota_exceeded',
      usedBytes: 90,
      quotaBytes: 100,
    });
    expect(set).not.toHaveBeenCalled();
  });

  it('rolls back the current state when the final restore write fails', async () => {
    await saveSites([{ id: 'before', name: 'Before', url: 'https://before.example' }]);
    const originalSetItem = Storage.prototype.setItem;
    let shouldFail = true;

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === 'tabibe-state' && shouldFail) {
        shouldFail = false;
        throw new Error('simulated quota failure');
      }
      return originalSetItem.call(this, key, value);
    });

    await expect(
      restoreBackup({
        backupVersion: 1,
        appVersion: '0.3.0',
        exportedAt: new Date().toISOString(),
        data: {
          sites: [{ id: 'after', name: 'After', url: 'https://after.example' }],
          notes: [],
          settings: {},
        },
      }),
    ).rejects.toMatchObject({ code: 'storage_quota_exceeded' });

    expect((await loadSites())[0].name).toBe('Before');
  });

  it('can undo the last successful restore', async () => {
    await saveSites([{ id: 'before', name: 'Before', url: 'https://before.example' }]);
    await restoreBackup({
      backupVersion: 1,
      appVersion: '0.3.1',
      exportedAt: new Date().toISOString(),
      data: {
        sites: [{ id: 'after', name: 'After', url: 'https://after.example' }],
        notes: [],
        settings: {},
      },
    });

    expect((await loadSites())[0].name).toBe('After');
    expect(await undoLastRestore()).toBe(true);
    expect((await loadSites())[0].name).toBe('Before');
  });

  it('resets corruptible application data while preserving an undo snapshot', async () => {
    await saveSites([{ id: 'custom', name: 'Custom', url: 'https://custom.example' }]);

    const resetState = await resetApplicationData();
    expect(resetState.sites).toHaveLength(18);
    expect(resetState.notes).toEqual([]);
    expect(resetState.noteTags).toEqual([]);
    expect(resetState.noteNotebooks).toEqual([]);
    expect((await loadSites())[0].name).toBe('Google');

    expect(await undoLastRestore()).toBe(true);
    expect((await loadSites())[0].name).toBe('Custom');
  });
});
