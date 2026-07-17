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
import { loadNoteWorkspace, saveNoteWorkspace, subscribeToStateChanges } from '../lib/storage.js';

const NOTE_SAVE_DELAY = 450;
const SAVE_STATUS_TIMEOUT = 1600;
const UNDO_TIMEOUT = 7000;

function findExternalConflict(localNotes, externalNotes, expectedRevisions) {
  const localById = new Map(localNotes.map((note) => [note.id, note]));
  const externalById = new Map(externalNotes.map((note) => [note.id, note]));
  const noteIds = new Set([
    ...localById.keys(),
    ...externalById.keys(),
    ...Object.keys(expectedRevisions),
  ]);

  for (const noteId of noteIds) {
    const localNote = localById.get(noteId) || null;
    const externalNote = externalById.get(noteId) || null;
    const expectedRevision = Object.prototype.hasOwnProperty.call(expectedRevisions, noteId)
      ? expectedRevisions[noteId]
      : undefined;
    const externalRevision = externalNote?.revision ?? null;
    const notesMatch = JSON.stringify(localNote) === JSON.stringify(externalNote);

    if (externalRevision !== expectedRevision && !notesMatch) {
      return { noteId, localNote, externalNote };
    }
  }

  return null;
}

function useNotes({
  dateRange = 'all',
  pinnedOnly = false,
  searchQuery,
  selectedTagIds = [],
  showArchived,
  sortBy = 'updated-desc',
}) {
  const [notes, setNotes] = useState([]);
  const [noteTags, setNoteTags] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [conflictState, setConflictState] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const saveTimerRef = useRef(null);
  const saveStatusTimerRef = useRef(null);
  const undoTimerRef = useRef(null);
  const notesRef = useRef([]);
  const noteTagsRef = useRef([]);
  const isLoadedRef = useRef(false);
  const isSavingRef = useRef(false);
  const hasPendingChangesRef = useRef(false);
  const skipNextSaveRef = useRef(true);
  const persistedRevisionsRef = useRef({});
  const latestStateRevisionRef = useRef(0);
  const conflictStateRef = useRef(null);

  const filteredNotes = useMemo(
    () =>
      filterNotes(notes, {
        dateRange,
        noteTags,
        pinnedOnly,
        searchQuery,
        selectedTagIds,
        showArchived,
        sortBy,
      }),
    [dateRange, noteTags, notes, pinnedOnly, searchQuery, selectedTagIds, showArchived, sortBy],
  );
  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  const showSavedStatus = useCallback(() => {
    if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
    setSaveStatus('saved');
    saveStatusTimerRef.current = setTimeout(() => {
      setSaveStatus('idle');
      saveStatusTimerRef.current = null;
    }, SAVE_STATUS_TIMEOUT);
  }, []);

  const flushPendingNotes = useCallback(async () => {
    if (!isLoadedRef.current || conflictState || !hasPendingChangesRef.current) return false;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');
    try {
      const savedWorkspace = await saveNoteWorkspace(
        {
          notes: notesRef.current.filter((note) => !isNoteEmpty(note)),
          noteTags: noteTagsRef.current,
        },
        { expectedRevisions: persistedRevisionsRef.current },
      );
      persistedRevisionsRef.current = savedWorkspace.noteRevisions;
      latestStateRevisionRef.current = savedWorkspace.stateRevision;
      hasPendingChangesRef.current = false;
      showSavedStatus();
      return true;
    } catch (error) {
      if (error?.code === 'note_revision_conflict' && error.conflicts?.[0]) {
        setConflictState(error.conflicts[0]);
        setSaveStatus('conflict');
      } else {
        setSaveStatus('error');
      }
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [conflictState, showSavedStatus]);

  useEffect(() => {
    let active = true;

    loadNoteWorkspace()
      .then((workspace) => {
        if (!active) return;
        notesRef.current = workspace.notes;
        noteTagsRef.current = workspace.noteTags;
        persistedRevisionsRef.current = workspace.noteRevisions;
        latestStateRevisionRef.current = workspace.stateRevision;
        isLoadedRef.current = true;
        skipNextSaveRef.current = true;
        setNotes(workspace.notes);
        setNoteTags(workspace.noteTags);
        setActiveNoteId(
          workspace.notes.find((note) => !note.isArchived)?.id || workspace.notes[0]?.id || null,
        );
        setIsLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        isLoadedRef.current = true;
        setSaveStatus('error');
        setIsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    notesRef.current = notes;
    noteTagsRef.current = noteTags;
  }, [noteTags, notes]);

  useEffect(() => {
    conflictStateRef.current = conflictState;
  }, [conflictState]);

  useEffect(() => {
    if (!isLoaded) return undefined;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return undefined;
    }
    if (conflictState) return undefined;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    hasPendingChangesRef.current = true;
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(flushPendingNotes, NOTE_SAVE_DELAY);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [conflictState, flushPendingNotes, isLoaded, noteTags, notes]);

  useEffect(() => {
    if (!isLoaded) return undefined;

    return subscribeToStateChanges((workspace) => {
      if (isSavingRef.current || workspace.stateRevision <= latestStateRevisionRef.current) {
        return;
      }

      if (!hasPendingChangesRef.current) {
        latestStateRevisionRef.current = workspace.stateRevision;
        persistedRevisionsRef.current = workspace.noteRevisions;
        skipNextSaveRef.current = true;
        setNotes(workspace.notes);
        setNoteTags(workspace.noteTags);
        return;
      }

      const conflict = findExternalConflict(
        notesRef.current,
        workspace.notes,
        persistedRevisionsRef.current,
      );
      if (conflict) {
        setConflictState(conflict);
        setSaveStatus('conflict');
      }
    });
  }, [isLoaded]);

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
      if (isLoadedRef.current && hasPendingChangesRef.current && !conflictStateRef.current) {
        void saveNoteWorkspace(
          {
            notes: notesRef.current.filter((note) => !isNoteEmpty(note)),
            noteTags: noteTagsRef.current,
          },
          { expectedRevisions: persistedRevisionsRef.current },
        );
      }
    },
    [],
  );

  const ensureEditableNote = useCallback((initialValues = {}) => {
    const existingNote = notesRef.current.find((note) => isNoteEmpty(note));
    if (existingNote) {
      if (Object.keys(initialValues).length > 0) {
        const updatedNotes = updateNote(notesRef.current, existingNote.id, initialValues);
        notesRef.current = updatedNotes;
        setNotes(updatedNotes);
      }
      setActiveNoteId(existingNote.id);
      return notesRef.current.find((note) => note.id === existingNote.id) || existingNote;
    }

    const note = createNote(initialValues);
    const updatedNotes = [note, ...notesRef.current];
    notesRef.current = updatedNotes;
    setNotes(updatedNotes);
    setActiveNoteId(note.id);
    return note;
  }, []);

  function removeEmptyNote(noteId) {
    if (!noteId) return;
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId || !isNoteEmpty(note)),
    );
  }

  function updateActiveNote(field, value) {
    if (!activeNote) return;
    setNotes((currentNotes) => updateNote(currentNotes, activeNote.id, { [field]: value }));
  }

  function toggleNoteFlag(noteId, field) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    setNotes((currentNotes) => updateNote(currentNotes, noteId, { [field]: !note[field] }));
  }

  function toggleNoteTag(noteId, tagId) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    const tagIds = note.tagIds.includes(tagId)
      ? note.tagIds.filter((id) => id !== tagId)
      : [...note.tagIds, tagId].slice(0, 8);
    setNotes((currentNotes) => updateNote(currentNotes, noteId, { tagIds }));
  }

  function addNoteTag(name, colorToken) {
    const result = createNoteTag(noteTags, name, colorToken);
    if (!result.error) setNoteTags(result.tags);
    return result;
  }

  function editNoteTag(tagId, patch) {
    const result = updateNoteTag(noteTags, tagId, patch);
    if (!result.error) setNoteTags(result.tags);
    return result;
  }

  function removeNoteTag(tagId) {
    const result = deleteNoteTag(noteTags, notes, tagId);
    setNoteTags(result.tags);
    setNotes(result.notes);
  }

  function bulkArchiveNotes(noteIds, isArchived) {
    setNotes((currentNotes) => updateNotes(currentNotes, noteIds, { isArchived }));
  }

  function bulkTagNotes(noteIds, tagId, shouldAdd) {
    setNotes((currentNotes) =>
      updateNotes(currentNotes, noteIds, (note) => ({
        tagIds: shouldAdd
          ? [...new Set([...note.tagIds, tagId])].slice(0, 8)
          : note.tagIds.filter((id) => id !== tagId),
      })),
    );
  }

  function deleteNotes(noteIds) {
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
    if (!undoState) return null;
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

  function resolveConflict(strategy, duplicateSuffix = '') {
    if (!conflictState) return;
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
    hasPendingChangesRef.current = true;
    setConflictState(null);
    setSaveStatus('saving');
  }

  return {
    activeNote,
    activeNoteId,
    addNoteTag,
    bulkArchiveNotes,
    bulkTagNotes,
    conflictState,
    deleteNote,
    deleteNotes,
    editNoteTag,
    ensureEditableNote,
    filteredNotes,
    flushPendingNotes,
    isLoaded,
    notes,
    noteTags,
    removeEmptyNote,
    removeNoteTag,
    resolveConflict,
    restoreDeletedNote,
    retrySave: flushPendingNotes,
    saveStatus,
    setActiveNoteId,
    toggleNoteArchive: (noteId) => toggleNoteFlag(noteId, 'isArchived'),
    toggleNotePin: (noteId) => toggleNoteFlag(noteId, 'isPinned'),
    toggleNoteTag,
    undoState,
    updateActiveNote,
  };
}

export default useNotes;
