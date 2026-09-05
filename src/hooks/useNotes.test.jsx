import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageMocks = vi.hoisted(() => ({
  clearNoteRecoveryDraft: vi.fn(),
  loadNoteRecoveryDrafts: vi.fn(),
  loadNoteWorkspace: vi.fn(),
  saveNoteRecoveryDraft: vi.fn(),
  saveNoteWorkspace: vi.fn(),
  subscribeToStateChanges: vi.fn(),
}));

vi.mock('../lib/storage.js', () => storageMocks);

import useNotes from './useNotes.js';

const EMPTY_ORGANIZATION = JSON.stringify({ noteTags: [], noteNotebooks: [] });

function createWorkspace(overrides = {}) {
  const notes = overrides.notes || [];
  return {
    notes,
    noteTags: [],
    noteNotebooks: [],
    stateRevision: 0,
    noteRevisions: Object.fromEntries(notes.map((note) => [note.id, note.revision])),
    organizationSnapshot: EMPTY_ORGANIZATION,
    ...overrides,
  };
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, reject, resolve };
}

function createSavedWorkspace(workspace, stateRevision) {
  return createWorkspace({
    ...workspace,
    stateRevision,
    noteRevisions: Object.fromEntries(workspace.notes.map((note) => [note.id, note.revision])),
    organizationSnapshot: JSON.stringify({
      noteTags: workspace.noteTags,
      noteNotebooks: workspace.noteNotebooks,
    }),
  });
}

describe('useNotes data integrity', () => {
  beforeEach(() => {
    storageMocks.clearNoteRecoveryDraft.mockReset().mockResolvedValue(true);
    storageMocks.loadNoteRecoveryDrafts.mockReset().mockResolvedValue([]);
    storageMocks.loadNoteWorkspace.mockReset().mockResolvedValue(createWorkspace());
    storageMocks.saveNoteRecoveryDraft.mockReset().mockResolvedValue({});
    storageMocks.saveNoteWorkspace.mockReset();
    storageMocks.subscribeToStateChanges.mockReset().mockReturnValue(() => {});
  });

  it('returns true immediately when a ready workspace has no pending changes', async () => {
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));

    await expect(result.current.flushPendingNotes()).resolves.toBe(true);
    expect(storageMocks.saveNoteWorkspace).not.toHaveBeenCalled();
  });

  it('keeps a blank capture idle until the user enters meaningful content', async () => {
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));

    act(() => {
      result.current.beginCapture('blank-capture');
    });
    await act(async () => Promise.resolve());

    expect(result.current.saveStatus).toBe('idle');
    expect(storageMocks.saveNoteRecoveryDraft).not.toHaveBeenCalled();
    expect(storageMocks.saveNoteWorkspace).not.toHaveBeenCalled();

    act(() => {
      result.current.updateActiveNote('content', 'First character');
    });

    await waitFor(() =>
      expect(storageMocks.saveNoteRecoveryDraft).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'First character', generation: 1 }),
      ),
    );
    expect(result.current.saveStatus).toBe('saving');
  });

  it('serially flushes a newer generation that arrives during an in-flight save', async () => {
    const firstSave = createDeferred();
    const secondSave = createDeferred();
    storageMocks.saveNoteWorkspace
      .mockReturnValueOnce(firstSave.promise)
      .mockReturnValueOnce(secondSave.promise);
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));

    act(() => {
      result.current.createNewNote({ content: 'A' });
    });
    let flushPromise;
    act(() => {
      flushPromise = result.current.flushPendingNotes();
    });
    await waitFor(() => expect(storageMocks.saveNoteWorkspace).toHaveBeenCalledTimes(1));
    expect(storageMocks.saveNoteWorkspace.mock.calls[0][0].notes[0].content).toBe('A');

    act(() => {
      result.current.updateActiveNote('content', 'AB');
    });
    await waitFor(() =>
      expect(storageMocks.saveNoteRecoveryDraft).toHaveBeenLastCalledWith(
        expect.objectContaining({ content: 'AB', generation: 2 }),
      ),
    );
    await act(async () => {
      firstSave.resolve(createSavedWorkspace(storageMocks.saveNoteWorkspace.mock.calls[0][0], 1));
      await Promise.resolve();
    });
    await waitFor(() => expect(storageMocks.saveNoteWorkspace).toHaveBeenCalledTimes(2));
    expect(storageMocks.saveNoteWorkspace.mock.calls[1][0].notes[0].content).toBe('AB');
    expect(result.current.saveStatus).toBe('saving');

    await act(async () => {
      secondSave.resolve(createSavedWorkspace(storageMocks.saveNoteWorkspace.mock.calls[1][0], 2));
      await flushPromise;
    });

    await expect(flushPromise).resolves.toBe(true);
    expect(result.current.saveStatus).toBe('saved');
    expect(storageMocks.clearNoteRecoveryDraft).toHaveBeenLastCalledWith(expect.any(String), 2);
  });

  it('keeps a recovery draft and exposes a quota-specific error when save fails', async () => {
    storageMocks.saveNoteWorkspace.mockRejectedValue({ code: 'storage_quota_exceeded' });
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));

    act(() => {
      result.current.createNewNote({ content: 'Recover me' });
    });
    await waitFor(() => expect(storageMocks.saveNoteRecoveryDraft).toHaveBeenCalledTimes(1));

    let didSave;
    await act(async () => {
      didSave = await result.current.flushPendingNotes();
    });

    expect(didSave).toBe(false);
    expect(result.current.saveStatus).toBe('quota');
    expect(result.current.saveErrorCode).toBe('storage_quota_exceeded');
    expect(storageMocks.clearNoteRecoveryDraft).not.toHaveBeenCalled();
  });

  it('retries the same pending generation after a transient write failure', async () => {
    storageMocks.saveNoteWorkspace
      .mockRejectedValueOnce({ code: 'storage_write_failed' })
      .mockImplementationOnce(async (workspace) => createSavedWorkspace(workspace, 1));
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));
    act(() => {
      result.current.createNewNote({ content: 'Retry me' });
    });

    await act(async () => {
      expect(await result.current.flushPendingNotes()).toBe(false);
    });
    expect(result.current.saveStatus).toBe('error');

    await act(async () => {
      expect(await result.current.retrySave()).toBe(true);
    });
    expect(storageMocks.saveNoteWorkspace).toHaveBeenCalledTimes(2);
    expect(storageMocks.saveNoteWorkspace.mock.calls[1][0].notes[0].content).toBe('Retry me');
    expect(result.current.saveStatus).toBe('saved');
  });

  it('blocks writes after a load failure and can retry loading explicitly', async () => {
    storageMocks.loadNoteWorkspace
      .mockRejectedValueOnce({ code: 'storage_read_failed' })
      .mockResolvedValueOnce(createWorkspace());
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('error'));

    expect(result.current.loadError).toMatchObject({ code: 'storage_read_failed' });
    expect(result.current.createNewNote({ content: 'Must not be written' })).toBeNull();
    await expect(result.current.flushPendingNotes()).resolves.toBe(false);
    expect(storageMocks.saveNoteWorkspace).not.toHaveBeenCalled();

    act(() => {
      expect(result.current.retryLoad()).toBe(true);
    });
    expect(result.current.loadStatus).toBe('loading');
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));
    expect(result.current.loadError).toBeNull();
  });

  it('creates unique notes while keeping a capture session idempotent', async () => {
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));

    let firstCapture;
    let repeatedCapture;
    let secondCapture;
    let firstStandalone;
    let secondStandalone;
    act(() => {
      firstCapture = result.current.beginCapture('capture-one', { content: 'First' });
      repeatedCapture = result.current.beginCapture('capture-one', { content: 'Ignored' });
      secondCapture = result.current.beginCapture('capture-two', { content: 'Second' });
      firstStandalone = result.current.createNewNote({ content: 'Third' });
      secondStandalone = result.current.createNewNote({ content: 'Fourth' });
    });

    expect(repeatedCapture.id).toBe(firstCapture.id);
    expect(secondCapture.id).not.toBe(firstCapture.id);
    expect(firstStandalone.id).not.toBe(secondStandalone.id);
    expect(new Set(result.current.notes.map((note) => note.id)).size).toBe(4);
    expect(result.current.notes.find((note) => note.id === firstCapture.id)?.captureSessionId).toBe(
      'capture-one',
    );
  });

  it('keeps a new local note when an unrelated external state event arrives', async () => {
    const now = '2026-01-01T00:00:00.000Z';
    const persistedNote = {
      id: 'persisted-note',
      title: 'Persisted',
      content: 'External content',
      tagIds: [],
      notebookId: null,
      captureSessionId: null,
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      revision: 1,
    };
    storageMocks.loadNoteWorkspace.mockResolvedValue(
      createWorkspace({ notes: [persistedNote], noteRevisions: { 'persisted-note': 1 } }),
    );
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));
    act(() => {
      result.current.createNewNote({ content: 'Unsaved local note' });
    });
    const externalListener = storageMocks.subscribeToStateChanges.mock.calls[0][0];

    act(() => {
      externalListener(
        createWorkspace({
          notes: [persistedNote],
          noteRevisions: { 'persisted-note': 1 },
          stateRevision: 1,
        }),
      );
    });

    expect(result.current.conflictState).toBeNull();
    expect(result.current.notes.map((note) => note.content)).toContain('Unsaved local note');
  });

  it('schedules the retained local version after resolving a revision conflict', async () => {
    const now = '2026-01-01T00:00:00.000Z';
    const persistedNote = {
      id: 'conflicted-note',
      title: '',
      content: 'Persisted content',
      tagIds: [],
      notebookId: null,
      captureSessionId: null,
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      revision: 1,
    };
    storageMocks.loadNoteWorkspace.mockResolvedValue(
      createWorkspace({ notes: [persistedNote], noteRevisions: { 'conflicted-note': 1 } }),
    );
    storageMocks.saveNoteWorkspace.mockImplementation(async (workspace) =>
      createSavedWorkspace(workspace, 2),
    );
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));

    act(() => {
      result.current.updateActiveNote('content', 'Retain this local version');
    });
    const externalListener = storageMocks.subscribeToStateChanges.mock.calls[0][0];
    act(() => {
      externalListener(
        createWorkspace({
          notes: [
            {
              ...persistedNote,
              content: 'External version',
              revision: 2,
            },
          ],
          noteRevisions: { 'conflicted-note': 2 },
          stateRevision: 1,
        }),
      );
    });
    expect(result.current.conflictState).toMatchObject({ noteId: 'conflicted-note' });

    act(() => {
      result.current.resolveConflict('local');
    });
    await waitFor(() => expect(result.current.conflictState).toBeNull());

    await act(async () => {
      expect(await result.current.flushPendingNotes()).toBe(true);
    });
    expect(storageMocks.saveNoteWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: [expect.objectContaining({ content: 'Retain this local version' })],
      }),
      expect.objectContaining({ expectedRevisions: { 'conflicted-note': 2 } }),
    );
  });

  it('restores an orphan recovery draft and clears it only after the main commit', async () => {
    const recoveryDraft = {
      draftVersion: 1,
      sessionId: 'orphan-session',
      noteId: 'orphan-note',
      captureSessionId: 'capture-orphan',
      title: '',
      content: 'Recovered content',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:01.000Z',
      baseRevision: 0,
      generation: 1,
    };
    storageMocks.loadNoteRecoveryDrafts.mockResolvedValue([recoveryDraft]);
    storageMocks.saveNoteWorkspace.mockImplementation(async (workspace) =>
      createSavedWorkspace(workspace, 1),
    );
    const { result } = renderHook(() => useNotes({}));
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'));

    act(() => {
      expect(result.current.restoreRecoveryDraft('orphan-session')).toMatchObject({
        id: 'orphan-note',
        content: 'Recovered content',
      });
    });
    expect(storageMocks.clearNoteRecoveryDraft).not.toHaveBeenCalled();

    await act(async () => {
      expect(await result.current.flushPendingNotes()).toBe(true);
    });
    expect(storageMocks.clearNoteRecoveryDraft).toHaveBeenCalledWith('orphan-session');
    expect(result.current.recoveryDrafts).toEqual([]);
  });
});
