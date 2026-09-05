import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createNote,
  filterNotes,
  isNoteEmpty,
  restoreNotes,
  updateNote,
  updateNotes,
} from '../domain/noteOperations.js';
import { createNoteTag, deleteNoteTag, updateNoteTag } from '../domain/noteTagOperations.js';
import {
  createNoteNotebook,
  deleteNoteNotebook,
  moveNoteNotebook,
  reorderNoteNotebooks,
  updateNoteNotebook,
} from '../domain/noteNotebookOperations.js';
import {
  clearNoteRecoveryDraft,
  loadNoteRecoveryDrafts,
  loadNoteWorkspace,
  saveNoteRecoveryDraft,
  saveNoteWorkspace,
  subscribeToStateChanges,
} from '../lib/storage.js';

const NOTE_SAVE_DELAY = 450;
const SAVE_STATUS_TIMEOUT = 1600;
const UNDO_TIMEOUT = 7000;

function createOrganizationSnapshot(noteTags, noteNotebooks) {
  return JSON.stringify({ noteTags, noteNotebooks });
}

function createWorkspaceMutationSnapshot(notes, noteTags, noteNotebooks) {
  return JSON.stringify({
    notes: notes.filter((note) => !isNoteEmpty(note)).map((note) => [note.id, note.revision]),
    noteTags,
    noteNotebooks,
  });
}

function getLocalMutationIds(localNotes, expectedRevisions) {
  const localById = new Map(localNotes.map((note) => [note.id, note]));
  const mutationIds = new Set();

  localNotes.forEach((note) => {
    if (
      !Object.prototype.hasOwnProperty.call(expectedRevisions, note.id) ||
      note.revision !== expectedRevisions[note.id]
    ) {
      mutationIds.add(note.id);
    }
  });
  Object.keys(expectedRevisions).forEach((noteId) => {
    if (!localById.has(noteId)) mutationIds.add(noteId);
  });

  return mutationIds;
}

function findExternalConflict(localNotes, externalNotes, expectedRevisions, mutationIds) {
  const localById = new Map(localNotes.map((note) => [note.id, note]));
  const externalById = new Map(externalNotes.map((note) => [note.id, note]));
  const noteIds = mutationIds || getLocalMutationIds(localNotes, expectedRevisions);

  for (const noteId of noteIds) {
    const localNote = localById.get(noteId) || null;
    const externalNote = externalById.get(noteId) || null;
    const hasExpectedRevision = Object.prototype.hasOwnProperty.call(expectedRevisions, noteId);
    const expectedRevision = hasExpectedRevision ? expectedRevisions[noteId] : undefined;
    const externalRevision = externalNote?.revision ?? null;
    const notesMatch = JSON.stringify(localNote) === JSON.stringify(externalNote);

    if (
      (hasExpectedRevision && externalRevision !== expectedRevision && !notesMatch) ||
      (!hasExpectedRevision && externalNote && !notesMatch)
    ) {
      return { noteId, localNote, externalNote };
    }
  }

  return null;
}

function mergeExternalNotes(localNotes, externalNotes, mutationIds) {
  const localById = new Map(localNotes.map((note) => [note.id, note]));
  const externalById = new Map(externalNotes.map((note) => [note.id, note]));
  const orderedIds = [
    ...localNotes.map((note) => note.id),
    ...externalNotes.map((note) => note.id),
  ];
  const seenIds = new Set();
  const mergedNotes = [];

  orderedIds.forEach((noteId) => {
    if (seenIds.has(noteId)) return;
    seenIds.add(noteId);
    const note = mutationIds.has(noteId) ? localById.get(noteId) : externalById.get(noteId);
    if (note) mergedNotes.push(note);
  });

  return mergedNotes;
}

function mergeExternalRevisions(previousRevisions, externalRevisions, mutationIds) {
  const nextRevisions = { ...externalRevisions };
  mutationIds.forEach((noteId) => {
    if (Object.prototype.hasOwnProperty.call(previousRevisions, noteId)) {
      nextRevisions[noteId] = previousRevisions[noteId];
    } else {
      delete nextRevisions[noteId];
    }
  });
  return nextRevisions;
}

function useNotes({
  dateRange = 'all',
  pinnedOnly = false,
  searchQuery,
  selectedTagIds = [],
  selectedNotebookId = null,
  showArchived,
  sortBy = 'updated-desc',
}) {
  const [notes, setNotes] = useState([]);
  const [noteTags, setNoteTags] = useState([]);
  const [noteNotebooks, setNoteNotebooks] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [conflictState, setConflictState] = useState(null);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [recoveryDrafts, setRecoveryDrafts] = useState([]);
  const [undoState, setUndoState] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveErrorCode, setSaveErrorCode] = useState(null);
  const saveTimerRef = useRef(null);
  const saveStatusTimerRef = useRef(null);
  const undoTimerRef = useRef(null);
  const notesRef = useRef([]);
  const noteTagsRef = useRef([]);
  const noteNotebooksRef = useRef([]);
  const activeNoteIdRef = useRef(null);
  const loadStatusRef = useRef('loading');
  const hasPendingChangesRef = useRef(false);
  const persistedRevisionsRef = useRef({});
  const persistedOrganizationSnapshotRef = useRef(createOrganizationSnapshot([], []));
  const latestStateRevisionRef = useRef(0);
  const conflictStateRef = useRef(null);
  const changeGenerationRef = useRef(0);
  const committedGenerationRef = useRef(0);
  const savePromiseRef = useRef(null);
  const queuedExternalWorkspaceRef = useRef(null);
  const recoverySessionIdRef = useRef(crypto.randomUUID());
  const adoptedRecoverySessionsRef = useRef(new Set());
  const captureSessionsRef = useRef(new Map());
  const previousConflictStateRef = useRef(null);
  const workspaceMutationSnapshotRef = useRef(createWorkspaceMutationSnapshot([], [], []));

  const filteredNotes = useMemo(
    () =>
      filterNotes(notes, {
        dateRange,
        noteTags,
        noteNotebooks,
        pinnedOnly,
        searchQuery,
        selectedTagIds,
        selectedNotebookId,
        showArchived,
        sortBy,
      }),
    [
      dateRange,
      noteNotebooks,
      noteTags,
      notes,
      pinnedOnly,
      searchQuery,
      selectedNotebookId,
      selectedTagIds,
      showArchived,
      sortBy,
    ],
  );
  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  const showSavedStatus = useCallback(() => {
    if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
    setSaveErrorCode(null);
    setSaveStatus('saved');
    saveStatusTimerRef.current = setTimeout(() => {
      setSaveStatus('idle');
      saveStatusTimerRef.current = null;
    }, SAVE_STATUS_TIMEOUT);
  }, []);

  const processExternalWorkspace = useCallback((workspace) => {
    if (workspace.stateRevision <= latestStateRevisionRef.current) return;

    const mutationIds = getLocalMutationIds(notesRef.current, persistedRevisionsRef.current);
    const conflict = findExternalConflict(
      notesRef.current,
      workspace.notes,
      persistedRevisionsRef.current,
      mutationIds,
    );
    const localOrganizationSnapshot = createOrganizationSnapshot(
      noteTagsRef.current,
      noteNotebooksRef.current,
    );
    const hasLocalOrganizationChanges =
      localOrganizationSnapshot !== persistedOrganizationSnapshotRef.current;
    const hasExternalOrganizationChanges =
      workspace.organizationSnapshot !== persistedOrganizationSnapshotRef.current;
    const organizationChangesMatch = localOrganizationSnapshot === workspace.organizationSnapshot;

    if (conflict) {
      conflictStateRef.current = conflict;
      setConflictState(conflict);
      setSaveErrorCode('note_revision_conflict');
      setSaveStatus('conflict');
      return;
    }
    if (
      hasLocalOrganizationChanges &&
      hasExternalOrganizationChanges &&
      !organizationChangesMatch
    ) {
      const organizationConflict = {
        type: 'organization',
        noteId: null,
        localNote: null,
        externalNote: null,
        localWorkspace: {
          noteTags: noteTagsRef.current,
          noteNotebooks: noteNotebooksRef.current,
        },
        externalWorkspace: {
          noteTags: workspace.noteTags,
          noteNotebooks: workspace.noteNotebooks,
        },
      };
      conflictStateRef.current = organizationConflict;
      setConflictState(organizationConflict);
      setSaveErrorCode('note_revision_conflict');
      setSaveStatus('conflict');
      return;
    }

    const mergedNotes = mergeExternalNotes(notesRef.current, workspace.notes, mutationIds);
    const nextTags = hasLocalOrganizationChanges ? noteTagsRef.current : workspace.noteTags;
    const nextNotebooks = hasLocalOrganizationChanges
      ? noteNotebooksRef.current
      : workspace.noteNotebooks;

    notesRef.current = mergedNotes;
    noteTagsRef.current = nextTags;
    noteNotebooksRef.current = nextNotebooks;
    persistedRevisionsRef.current = mergeExternalRevisions(
      persistedRevisionsRef.current,
      workspace.noteRevisions,
      mutationIds,
    );
    if (!hasLocalOrganizationChanges || organizationChangesMatch) {
      persistedOrganizationSnapshotRef.current = workspace.organizationSnapshot;
    }
    latestStateRevisionRef.current = workspace.stateRevision;
    workspaceMutationSnapshotRef.current = createWorkspaceMutationSnapshot(
      mergedNotes,
      nextTags,
      nextNotebooks,
    );
    setNotes(mergedNotes);
    setNoteTags(nextTags);
    setNoteNotebooks(nextNotebooks);
  }, []);

  const flushPendingNotes = useCallback(async () => {
    if (loadStatusRef.current !== 'ready' || conflictStateRef.current) return false;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (!hasPendingChangesRef.current) return true;
    if (savePromiseRef.current) return savePromiseRef.current;

    const requestedGeneration = changeGenerationRef.current;
    const savePromise = (async () => {
      let saveSucceeded = true;

      while (
        loadStatusRef.current === 'ready' &&
        !conflictStateRef.current &&
        committedGenerationRef.current < changeGenerationRef.current
      ) {
        const savingGeneration = changeGenerationRef.current;
        const workspaceSnapshot = {
          notes: notesRef.current.filter((note) => !isNoteEmpty(note)),
          noteTags: noteTagsRef.current,
          noteNotebooks: noteNotebooksRef.current,
        };
        const expectedRevisions = { ...persistedRevisionsRef.current };
        const expectedOrganizationSnapshot = persistedOrganizationSnapshotRef.current;
        const adoptedRecoverySessions = [...adoptedRecoverySessionsRef.current];

        if (saveStatusTimerRef.current) {
          clearTimeout(saveStatusTimerRef.current);
          saveStatusTimerRef.current = null;
        }
        setSaveErrorCode(null);
        setSaveStatus('saving');
        try {
          const savedWorkspace = await saveNoteWorkspace(workspaceSnapshot, {
            expectedRevisions,
            expectedOrganizationSnapshot,
          });
          persistedRevisionsRef.current = savedWorkspace.noteRevisions;
          persistedOrganizationSnapshotRef.current = savedWorkspace.organizationSnapshot;
          latestStateRevisionRef.current = savedWorkspace.stateRevision;
          committedGenerationRef.current = Math.max(
            committedGenerationRef.current,
            savingGeneration,
          );
          hasPendingChangesRef.current =
            committedGenerationRef.current < changeGenerationRef.current;

          await Promise.allSettled([
            clearNoteRecoveryDraft(recoverySessionIdRef.current, savingGeneration),
            ...adoptedRecoverySessions.map((sessionId) => clearNoteRecoveryDraft(sessionId)),
          ]);
          adoptedRecoverySessions.forEach((sessionId) =>
            adoptedRecoverySessionsRef.current.delete(sessionId),
          );
          if (adoptedRecoverySessions.length > 0) {
            const clearedSessions = new Set(adoptedRecoverySessions);
            setRecoveryDrafts((currentDrafts) =>
              currentDrafts.filter((draft) => !clearedSessions.has(draft.sessionId)),
            );
          }

          const queuedWorkspace = queuedExternalWorkspaceRef.current;
          queuedExternalWorkspaceRef.current = null;
          if (queuedWorkspace) processExternalWorkspace(queuedWorkspace);

          if (!hasPendingChangesRef.current && !conflictStateRef.current) showSavedStatus();
        } catch (error) {
          saveSucceeded = false;
          const errorCode = error?.code || 'storage_write_failed';
          setSaveErrorCode(errorCode);
          if (errorCode === 'note_revision_conflict' && error.conflicts?.[0]) {
            conflictStateRef.current = error.conflicts[0];
            setConflictState(error.conflicts[0]);
            setSaveStatus('conflict');
          } else {
            setSaveStatus(errorCode === 'storage_quota_exceeded' ? 'quota' : 'error');
          }
          const queuedWorkspace = queuedExternalWorkspaceRef.current;
          queuedExternalWorkspaceRef.current = null;
          if (queuedWorkspace) processExternalWorkspace(queuedWorkspace);
          break;
        }
      }

      return (
        saveSucceeded &&
        !conflictStateRef.current &&
        committedGenerationRef.current >= requestedGeneration
      );
    })();
    savePromiseRef.current = savePromise;
    return savePromise.finally(() => {
      if (savePromiseRef.current === savePromise) savePromiseRef.current = null;
    });
  }, [processExternalWorkspace, showSavedStatus]);

  useEffect(() => {
    let active = true;

    Promise.all([loadNoteWorkspace(), loadNoteRecoveryDrafts()])
      .then(([workspace, storedRecoveryDrafts]) => {
        if (!active) return;
        const persistedNotesById = new Map(workspace.notes.map((note) => [note.id, note]));
        const recoverableDrafts = storedRecoveryDrafts.filter((draft) => {
          const persistedNote = persistedNotesById.get(draft.noteId);
          const isAlreadyPersisted =
            persistedNote &&
            persistedNote.title === draft.title &&
            persistedNote.content === draft.content;
          if (isAlreadyPersisted) {
            void clearNoteRecoveryDraft(draft.sessionId).catch((error) => {
              if (active) setSaveErrorCode(error?.code || 'storage_remove_failed');
            });
          }
          return !isAlreadyPersisted;
        });
        notesRef.current = workspace.notes;
        noteTagsRef.current = workspace.noteTags;
        noteNotebooksRef.current = workspace.noteNotebooks;
        persistedRevisionsRef.current = workspace.noteRevisions;
        persistedOrganizationSnapshotRef.current = workspace.organizationSnapshot;
        latestStateRevisionRef.current = workspace.stateRevision;
        loadStatusRef.current = 'ready';
        workspaceMutationSnapshotRef.current = createWorkspaceMutationSnapshot(
          workspace.notes,
          workspace.noteTags,
          workspace.noteNotebooks,
        );
        captureSessionsRef.current = new Map(
          workspace.notes
            .filter((note) => note.captureSessionId)
            .map((note) => [note.captureSessionId, note.id]),
        );
        setNotes(workspace.notes);
        setNoteTags(workspace.noteTags);
        setNoteNotebooks(workspace.noteNotebooks);
        setRecoveryDrafts(recoverableDrafts);
        setActiveNoteId(
          workspace.notes.find((note) => !note.isArchived)?.id || workspace.notes[0]?.id || null,
        );
        setLoadError(null);
        setLoadStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        loadStatusRef.current = 'error';
        setLoadError(error);
        setSaveErrorCode(error?.code || 'storage_read_failed');
        setLoadStatus('error');
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const retryLoad = useCallback(() => {
    if (loadStatusRef.current !== 'error') return false;
    loadStatusRef.current = 'loading';
    setLoadError(null);
    setSaveErrorCode(null);
    setLoadStatus('loading');
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
    return true;
  }, []);

  useEffect(() => {
    notesRef.current = notes;
    noteTagsRef.current = noteTags;
    noteNotebooksRef.current = noteNotebooks;
  }, [noteNotebooks, noteTags, notes]);

  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    conflictStateRef.current = conflictState;
  }, [conflictState]);

  useEffect(() => {
    if (loadStatus !== 'ready') return undefined;
    const workspaceMutationSnapshot = createWorkspaceMutationSnapshot(
      notes,
      noteTags,
      noteNotebooks,
    );
    const didConflictStateChange = conflictState !== previousConflictStateRef.current;
    previousConflictStateRef.current = conflictState;
    if (
      workspaceMutationSnapshot === workspaceMutationSnapshotRef.current &&
      !didConflictStateChange
    ) {
      return undefined;
    }
    workspaceMutationSnapshotRef.current = workspaceMutationSnapshot;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (conflictState) return undefined;

    const generation = changeGenerationRef.current + 1;
    changeGenerationRef.current = generation;
    hasPendingChangesRef.current = true;
    const activeRecoveryNote = notesRef.current.find((note) => note.id === activeNoteIdRef.current);
    if (activeRecoveryNote && !isNoteEmpty(activeRecoveryNote)) {
      void saveNoteRecoveryDraft({
        sessionId: recoverySessionIdRef.current,
        noteId: activeRecoveryNote.id,
        captureSessionId: activeRecoveryNote.captureSessionId,
        title: activeRecoveryNote.title,
        content: activeRecoveryNote.content,
        createdAt: activeRecoveryNote.createdAt,
        updatedAt: activeRecoveryNote.updatedAt,
        baseRevision: persistedRevisionsRef.current[activeRecoveryNote.id] || 0,
        generation,
      }).catch((error) => {
        const errorCode = error?.code || 'storage_write_failed';
        setSaveErrorCode(errorCode);
        setSaveStatus(errorCode === 'storage_quota_exceeded' ? 'quota' : 'error');
      });
    }

    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = null;
    }
    setSaveErrorCode(null);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(flushPendingNotes, NOTE_SAVE_DELAY);
    return undefined;
  }, [conflictState, flushPendingNotes, loadStatus, noteNotebooks, noteTags, notes]);

  useEffect(() => {
    if (loadStatus !== 'ready') return undefined;

    return subscribeToStateChanges(
      (workspace) => {
        if (workspace.stateRevision <= latestStateRevisionRef.current) return;
        if (savePromiseRef.current) {
          if (
            !queuedExternalWorkspaceRef.current ||
            workspace.stateRevision > queuedExternalWorkspaceRef.current.stateRevision
          ) {
            queuedExternalWorkspaceRef.current = workspace;
          }
          return;
        }
        processExternalWorkspace(workspace);
      },
      (error) => {
        setSaveErrorCode(error?.code || 'storage_external_state_invalid');
        setSaveStatus('error');
      },
    );
  }, [loadStatus, processExternalWorkspace]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') void flushPendingNotes();
    }

    function handlePageHide() {
      void flushPendingNotes();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [flushPendingNotes]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (
        loadStatusRef.current === 'ready' &&
        hasPendingChangesRef.current &&
        !conflictStateRef.current
      ) {
        void flushPendingNotes();
      }
    },
    [flushPendingNotes],
  );

  const createNewNote = useCallback((initialValues = {}) => {
    if (loadStatusRef.current !== 'ready') return null;
    const note = createNote({
      ...initialValues,
      id: crypto.randomUUID(),
    });
    const updatedNotes = [note, ...notesRef.current];
    notesRef.current = updatedNotes;
    activeNoteIdRef.current = note.id;
    if (note.captureSessionId) {
      captureSessionsRef.current.set(note.captureSessionId, note.id);
    }
    setNotes(updatedNotes);
    setActiveNoteId(note.id);
    return note;
  }, []);

  const beginCapture = useCallback(
    (captureSessionId, initialValues = {}) => {
      if (loadStatusRef.current !== 'ready') return null;
      const normalizedSessionId =
        typeof captureSessionId === 'string' ? captureSessionId.trim() : '';
      if (!normalizedSessionId || normalizedSessionId.length > 128) return null;

      const mappedNoteId = captureSessionsRef.current.get(normalizedSessionId);
      const existingNote = notesRef.current.find(
        (note) => note.id === mappedNoteId || note.captureSessionId === normalizedSessionId,
      );
      if (existingNote) {
        captureSessionsRef.current.set(normalizedSessionId, existingNote.id);
        activeNoteIdRef.current = existingNote.id;
        setActiveNoteId(existingNote.id);
        return existingNote;
      }

      return createNewNote({
        ...initialValues,
        captureSessionId: normalizedSessionId,
      });
    },
    [createNewNote],
  );

  const ensureEditableNote = useCallback((initialValues = {}) => {
    if (loadStatusRef.current !== 'ready') return null;
    const existingNote = notesRef.current.find((note) => isNoteEmpty(note));
    if (existingNote) {
      if (Object.keys(initialValues).length > 0) {
        const updatedNotes = updateNote(notesRef.current, existingNote.id, initialValues);
        notesRef.current = updatedNotes;
        setNotes(updatedNotes);
      }
      activeNoteIdRef.current = existingNote.id;
      setActiveNoteId(existingNote.id);
      return notesRef.current.find((note) => note.id === existingNote.id) || existingNote;
    }

    const note = createNote(initialValues);
    const updatedNotes = [note, ...notesRef.current];
    notesRef.current = updatedNotes;
    activeNoteIdRef.current = note.id;
    setNotes(updatedNotes);
    setActiveNoteId(note.id);
    return note;
  }, []);

  function removeEmptyNote(noteId) {
    if (loadStatusRef.current !== 'ready' || !noteId) return;
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId || !isNoteEmpty(note)),
    );
  }

  function updateActiveNote(field, value) {
    if (loadStatusRef.current !== 'ready') return;
    const editableNote = notesRef.current.find((note) => note.id === activeNoteIdRef.current);
    if (!editableNote) return;
    setNotes((currentNotes) => updateNote(currentNotes, editableNote.id, { [field]: value }));
  }

  function toggleNoteFlag(noteId, field) {
    if (loadStatusRef.current !== 'ready') return;
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    setNotes((currentNotes) => updateNote(currentNotes, noteId, { [field]: !note[field] }));
  }

  function toggleNoteTag(noteId, tagId) {
    if (loadStatusRef.current !== 'ready') return;
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    const tagIds = note.tagIds.includes(tagId)
      ? note.tagIds.filter((id) => id !== tagId)
      : [...note.tagIds, tagId].slice(0, 8);
    setNotes((currentNotes) => updateNote(currentNotes, noteId, { tagIds }));
  }

  function addNoteTag(name, colorToken) {
    if (loadStatusRef.current !== 'ready') return { error: 'storage_not_ready', tags: noteTags };
    const result = createNoteTag(noteTags, name, colorToken);
    if (!result.error) setNoteTags(result.tags);
    return result;
  }

  function editNoteTag(tagId, patch) {
    if (loadStatusRef.current !== 'ready') return { error: 'storage_not_ready', tags: noteTags };
    const result = updateNoteTag(noteTags, tagId, patch);
    if (!result.error) setNoteTags(result.tags);
    return result;
  }

  function removeNoteTag(tagId) {
    if (loadStatusRef.current !== 'ready') return;
    const result = deleteNoteTag(noteTags, notes, tagId);
    setNoteTags(result.tags);
    setNotes(result.notes);
  }

  function addNoteNotebook(name) {
    if (loadStatusRef.current !== 'ready') {
      return { error: 'storage_not_ready', notebooks: noteNotebooks };
    }
    const result = createNoteNotebook(noteNotebooks, name);
    if (!result.error) setNoteNotebooks(result.notebooks);
    return result;
  }

  function editNoteNotebook(notebookId, name) {
    if (loadStatusRef.current !== 'ready') {
      return { error: 'storage_not_ready', notebooks: noteNotebooks };
    }
    const result = updateNoteNotebook(noteNotebooks, notebookId, name);
    if (!result.error) setNoteNotebooks(result.notebooks);
    return result;
  }

  function removeNoteNotebook(notebookId) {
    if (loadStatusRef.current !== 'ready') return;
    const result = deleteNoteNotebook(noteNotebooks, notes, notebookId);
    setNoteNotebooks(result.notebooks);
    setNotes(result.notes);
  }

  function reorderNotebooks(sourceId, targetId) {
    if (loadStatusRef.current !== 'ready') return;
    setNoteNotebooks((currentNotebooks) =>
      reorderNoteNotebooks(currentNotebooks, sourceId, targetId),
    );
  }

  function moveNotebook(notebookId, direction) {
    if (loadStatusRef.current !== 'ready') return;
    setNoteNotebooks((currentNotebooks) =>
      moveNoteNotebook(currentNotebooks, notebookId, direction),
    );
  }

  function bulkArchiveNotes(noteIds, isArchived) {
    if (loadStatusRef.current !== 'ready') return;
    setNotes((currentNotes) => updateNotes(currentNotes, noteIds, { isArchived }));
  }

  function bulkTagNotes(noteIds, tagId, shouldAdd) {
    if (loadStatusRef.current !== 'ready') return;
    setNotes((currentNotes) =>
      updateNotes(currentNotes, noteIds, (note) => ({
        tagIds: shouldAdd
          ? [...new Set([...note.tagIds, tagId])].slice(0, 8)
          : note.tagIds.filter((id) => id !== tagId),
      })),
    );
  }

  function deleteNotes(noteIds) {
    if (loadStatusRef.current !== 'ready') return;
    const selectedIds = new Set(noteIds);
    const deletedItems = notes
      .map((note, index) => ({ note, index }))
      .filter((item) => selectedIds.has(item.note.id));
    if (deletedItems.length === 0) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setNotes((currentNotes) => currentNotes.filter((note) => !selectedIds.has(note.id)));
    setUndoState({ items: deletedItems });
    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, UNDO_TIMEOUT);
  }

  function deleteNote(noteId) {
    deleteNotes([noteId]);
  }

  function restoreDeletedNote() {
    if (loadStatusRef.current !== 'ready' || !undoState) return null;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    setNotes((currentNotes) => restoreNotes(currentNotes, undoState.items));
    setActiveNoteId(undoState.items[0]?.note.id || null);
    const restored = undoState.items.map((item) => item.note);
    setUndoState(null);
    return restored;
  }

  async function discardRecoveryDraft(sessionId = recoverySessionIdRef.current) {
    try {
      await clearNoteRecoveryDraft(sessionId);
      adoptedRecoverySessionsRef.current.delete(sessionId);
      setRecoveryDrafts((currentDrafts) =>
        currentDrafts.filter((draft) => draft.sessionId !== sessionId),
      );
      return true;
    } catch (error) {
      const errorCode = error?.code || 'storage_remove_failed';
      setSaveErrorCode(errorCode);
      setSaveStatus('error');
      return false;
    }
  }

  function restoreRecoveryDraft(sessionId) {
    if (loadStatusRef.current !== 'ready') return null;
    const draft = recoveryDrafts.find((item) => item.sessionId === sessionId);
    if (!draft) return null;

    const currentNote = notesRef.current.find((note) => note.id === draft.noteId);
    const restoredNotes = currentNote
      ? updateNote(notesRef.current, currentNote.id, {
          title: draft.title,
          content: draft.content,
          captureSessionId: draft.captureSessionId || currentNote.captureSessionId || null,
        })
      : [
          createNote({
            id: draft.noteId,
            title: draft.title,
            content: draft.content,
            captureSessionId: draft.captureSessionId,
            createdAt: draft.createdAt,
            updatedAt: new Date().toISOString(),
            revision: 1,
          }),
          ...notesRef.current,
        ];
    const restoredNote = restoredNotes.find((note) => note.id === draft.noteId) || null;
    if (!restoredNote) return null;

    notesRef.current = restoredNotes;
    activeNoteIdRef.current = restoredNote.id;
    adoptedRecoverySessionsRef.current.add(sessionId);
    if (restoredNote.captureSessionId) {
      captureSessionsRef.current.set(restoredNote.captureSessionId, restoredNote.id);
    }
    setNotes(restoredNotes);
    setActiveNoteId(restoredNote.id);
    return restoredNote;
  }

  function resolveConflict(strategy, duplicateSuffix = '') {
    if (loadStatusRef.current !== 'ready' || !conflictState) return;
    if (conflictState.type === 'organization') {
      const externalTags = conflictState.externalWorkspace?.noteTags || [];
      const externalNotebooks = conflictState.externalWorkspace?.noteNotebooks || [];
      persistedOrganizationSnapshotRef.current = createOrganizationSnapshot(
        externalTags,
        externalNotebooks,
      );
      if (strategy === 'external') {
        noteTagsRef.current = externalTags;
        noteNotebooksRef.current = externalNotebooks;
        setNoteTags(externalTags);
        setNoteNotebooks(externalNotebooks);
      }
      conflictStateRef.current = null;
      hasPendingChangesRef.current = true;
      setConflictState(null);
      setSaveErrorCode(null);
      setSaveStatus('saving');
      return;
    }

    const { noteId, localNote, externalNote } = conflictState;
    persistedRevisionsRef.current = {
      ...persistedRevisionsRef.current,
      [noteId]: externalNote?.revision ?? null,
    };

    setNotes((currentNotes) => {
      const withoutConflict = currentNotes.filter((note) => note.id !== noteId);
      if (strategy === 'external') {
        return externalNote ? [externalNote, ...withoutConflict] : withoutConflict;
      }
      if (strategy === 'duplicate') {
        const duplicate = localNote
          ? createNote({
              ...localNote,
              id: crypto.randomUUID(),
              captureSessionId: null,
              title: `${localNote.title}${duplicateSuffix}`,
              revision: 1,
              updatedAt: new Date().toISOString(),
            })
          : null;
        return [externalNote, duplicate, ...withoutConflict].filter(Boolean);
      }
      if (!localNote) return withoutConflict;
      return [
        {
          ...localNote,
          revision: Math.max(localNote.revision, (externalNote?.revision || 0) + 1),
          updatedAt: new Date().toISOString(),
        },
        ...withoutConflict,
      ];
    });
    conflictStateRef.current = null;
    hasPendingChangesRef.current = true;
    setConflictState(null);
    setSaveErrorCode(null);
    setSaveStatus('saving');
  }

  return {
    activeNote,
    activeNoteId,
    addNoteNotebook,
    addNoteTag,
    beginCapture,
    bulkArchiveNotes,
    bulkTagNotes,
    conflictState,
    createNewNote,
    deleteNote,
    deleteNotes,
    discardRecoveryDraft,
    editNoteTag,
    editNoteNotebook,
    ensureEditableNote,
    filteredNotes,
    flushPendingNotes,
    isLoaded: loadStatus !== 'loading',
    loadError,
    loadStatus,
    notes,
    noteTags,
    noteNotebooks,
    removeEmptyNote,
    removeNoteTag,
    removeNoteNotebook,
    reorderNotebooks,
    recoveryDrafts,
    resolveConflict,
    restoreRecoveryDraft,
    restoreDeletedNote,
    retryLoad,
    retrySave: flushPendingNotes,
    saveErrorCode,
    saveStatus,
    setActiveNoteId,
    moveNotebook,
    toggleNoteArchive: (noteId) => toggleNoteFlag(noteId, 'isArchived'),
    toggleNotePin: (noteId) => toggleNoteFlag(noteId, 'isPinned'),
    toggleNoteTag,
    undoState,
    updateActiveNote,
  };
}

export default useNotes;
