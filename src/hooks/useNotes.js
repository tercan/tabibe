import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createNote,
  filterNotes,
  isNoteEmpty,
  restoreNote,
  updateNote,
} from '../domain/noteOperations.js';
import { loadNotes, saveNotes } from '../lib/storage.js';

const NOTE_SAVE_DELAY = 450;
const UNDO_TIMEOUT = 7000;

function useNotes({ searchQuery, showArchived }) {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const saveTimerRef = useRef(null);
  const undoTimerRef = useRef(null);
  const notesRef = useRef([]);
  const isLoadedRef = useRef(false);

  const filteredNotes = useMemo(
    () => filterNotes(notes, searchQuery, showArchived),
    [notes, searchQuery, showArchived],
  );
  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  const flushPendingNotes = useCallback(async () => {
    if (!isLoaded) return false;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setSaveStatus('saving');
    try {
      await saveNotes(notesRef.current.filter((note) => !isNoteEmpty(note)));
      setSaveStatus('saved');
      return true;
    } catch {
      setSaveStatus('error');
      return false;
    }
  }, [isLoaded]);

  useEffect(() => {
    loadNotes()
      .then((savedNotes) => {
        notesRef.current = savedNotes;
        isLoadedRef.current = true;
        setNotes(savedNotes);
        setActiveNoteId(
          savedNotes.find((note) => !note.isArchived)?.id || savedNotes[0]?.id || null,
        );
        setIsLoaded(true);
      })
      .catch(() => {
        isLoadedRef.current = true;
        setSaveStatus('error');
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    if (!isLoaded) return undefined;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(flushPendingNotes, NOTE_SAVE_DELAY);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [flushPendingNotes, isLoaded, notes]);

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
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (isLoadedRef.current) {
        void saveNotes(notesRef.current.filter((note) => !isNoteEmpty(note)));
      }
    },
    [],
  );

  function ensureEditableNote() {
    const existingNote = notes.find((note) => isNoteEmpty(note));
    if (existingNote) {
      setActiveNoteId(existingNote.id);
      return existingNote;
    }

    const note = createNote();
    setNotes((currentNotes) => [note, ...currentNotes]);
    setActiveNoteId(note.id);
    return note;
  }

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

  function deleteNote(noteId) {
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    if (noteIndex === -1) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
    setUndoState({ note: notes[noteIndex], index: noteIndex });
    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, UNDO_TIMEOUT);
  }

  function restoreDeletedNote() {
    if (!undoState) return null;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    setNotes((currentNotes) => restoreNote(currentNotes, undoState.note, undoState.index));
    setActiveNoteId(undoState.note.id);
    const restored = undoState.note;
    setUndoState(null);
    return restored;
  }

  return {
    activeNote,
    activeNoteId,
    deleteNote,
    ensureEditableNote,
    filteredNotes,
    flushPendingNotes,
    isLoaded,
    notes,
    removeEmptyNote,
    restoreDeletedNote,
    saveStatus,
    setActiveNoteId,
    toggleNoteArchive: (noteId) => toggleNoteFlag(noteId, 'isArchived'),
    toggleNotePin: (noteId) => toggleNoteFlag(noteId, 'isPinned'),
    undoState,
    updateActiveNote,
  };
}

export default useNotes;
