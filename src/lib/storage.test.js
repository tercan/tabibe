import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  exportBackup,
  inspectBackup,
  loadNoteWorkspace,
  loadNotes,
  loadSettings,
  loadSites,
  resetApplicationData,
  restoreBackup,
  saveNoteWorkspace,
  saveSettings,
  saveSites,
  undoLastRestore,
} from './storage.js';

describe('storage repository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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

    expect(backup.backupVersion).toBe(2);
    expect(backup.data.sites[0].url).toBe('https://example.com/');
    expect(backup.data.noteTags).toEqual([]);

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
    });

    await restoreBackup(legacyBackup);
    const migratedBackup = await exportBackup();

    expect(migratedBackup.backupVersion).toBe(2);
    expect(migratedBackup.data.sites[0].icon).toEqual({ preference: 'auto', slug: 'google' });
    expect(migratedBackup.data.sites[1].children[0].icon).toEqual({
      preference: 'auto',
      slug: null,
    });
    expect(migratedBackup.data.notes).toHaveLength(1);
    expect(migratedBackup.data.notes[0]).toMatchObject({ tagIds: [], revision: 1 });
    expect(migratedBackup.data.noteTags).toEqual([]);
    expect((await loadNotes())[0].content).toBe('Migrated note content');
    expect(migratedBackup.data.settings).toMatchObject({
      theme: 'dark',
      iconStyle: 'simple',
      searchEngine: 'duckduckgo',
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
    expect(workspace.notes[0]).toMatchObject({
      id: 'legacy-note',
      tagIds: [],
      revision: 1,
    });
    expect((await loadSettings()).notePinned).toBe(true);
  });

  it('saves tags with notes and rejects stale note revisions', async () => {
    const initialWorkspace = await loadNoteWorkspace();
    const note = {
      id: 'shared-note',
      title: 'Shared',
      content: 'Initial',
      tagIds: ['work'],
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
    const firstSave = await saveNoteWorkspace(
      { notes: [note], noteTags: [tag] },
      {
        expectedRevisions: initialWorkspace.noteRevisions,
      },
    );
    const secondSave = await saveNoteWorkspace(
      {
        notes: [{ ...firstSave.notes[0], content: 'External', revision: 2 }],
        noteTags: firstSave.noteTags,
      },
      { expectedRevisions: firstSave.noteRevisions },
    );

    await expect(
      saveNoteWorkspace(
        {
          notes: [{ ...firstSave.notes[0], content: 'Stale local', revision: 2 }],
          noteTags: firstSave.noteTags,
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
    ).rejects.toMatchObject({ code: 'storage_write_failed' });

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
    expect((await loadSites())[0].name).toBe('Google');

    expect(await undoLastRestore()).toBe(true);
    expect((await loadSites())[0].name).toBe('Custom');
  });
});
