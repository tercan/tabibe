import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import { loadNotes, saveNotes } from '../lib/storage.js';
import CloseIcon from './icons/CloseIcon.jsx';

/**
 * 1. Storage helpers for notes
 */

const NOTE_SAVE_DELAY = 450;
const UNDO_TIMEOUT = 7000;

function getSafeString(value) {
  return typeof value === 'string' ? value : '';
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createNote(overrides = {}) {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: '',
    content: '',
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function isNoteEmpty(note) {
  if (!note) return true;

  return !getSafeString(note.title).trim() && !getSafeString(note.content).trim();
}

/**
 * 2. Icons
 */

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v8M9 4h6M12 10c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6zM12 16v6M10 22h4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="4" rx="1" />
      <path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
      <path d="M10 12h4" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v6h6" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * 3. NotePanel component
 */

function NotePanel({ is_open, is_pinned, on_close, on_toggle_pin }) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [noteView, setNoteView] = useState('list');
  const [isLoaded, setIsLoaded] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const saveTimer = useRef(null);
  const notesRef = useRef([]);
  const isLoadedRef = useRef(false);
  const undoTimer = useRef(null);
  const wasVisibleRef = useRef(false);
  const panelRef = useRef(null);
  const titleInputRef = useRef(null);
  const createButtonRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const deleteCancelButtonRef = useRef(null);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notes
      .filter((note) => !isNoteEmpty(note))
      .filter((note) => note.isArchived === showArchived)
      .filter((note) => {
        if (!query) return true;

        return `${note.title} ${note.content}`.toLowerCase().includes(query);
      })
      .sort((firstNote, secondNote) => {
        if (firstNote.isPinned !== secondNote.isPinned) {
          return firstNote.isPinned ? -1 : 1;
        }

        return new Date(secondNote.updatedAt).getTime() - new Date(firstNote.updatedAt).getTime();
      });
  }, [notes, searchQuery, showArchived]);

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;
  const pendingDeleteNote = notes.find((note) => note.id === pendingDeleteNoteId) || null;
  const isEditorView = noteView === 'editor' && activeNote;
  const isPanelVisible = is_open || is_pinned;

  const flushPendingNotes = useCallback(async () => {
    if (!isLoaded) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    setSaveStatus('saving');
    try {
      await saveNotes(notesRef.current.filter((note) => !isNoteEmpty(note)));
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [isLoaded]);

  useFocusTrap({
    containerRef: panelRef,
    isActive: is_open && !is_pinned && !pendingDeleteNoteId,
    initialFocusRef: isEditorView ? titleInputRef : createButtonRef,
    onEscape: handleClosePanel,
  });

  useFocusTrap({
    containerRef: deleteDialogRef,
    isActive: isPanelVisible && Boolean(pendingDeleteNoteId),
    initialFocusRef: deleteCancelButtonRef,
    onEscape: cancelDeleteConfirmation,
  });

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

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    setSaveStatus('saving');
    saveTimer.current = setTimeout(flushPendingNotes, NOTE_SAVE_DELAY);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [flushPendingNotes, isLoaded, notes]);

  useEffect(() => {
    function handlePageLifecycle() {
      if (document.visibilityState === 'hidden') void flushPendingNotes();
    }

    function handlePageHide() {
      void flushPendingNotes();
    }

    document.addEventListener('visibilitychange', handlePageLifecycle);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handlePageLifecycle);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [flushPendingNotes]);

  useEffect(() => {
    if (!isLoaded) return;
    if (noteView === 'editor' && activeNote) return;
    if (
      activeNote &&
      activeNote.isArchived === showArchived &&
      filteredNotes.some((note) => note.id === activeNote.id)
    )
      return;

    setActiveNoteId(filteredNotes[0]?.id || null);
  }, [activeNote, filteredNotes, isLoaded, noteView, showArchived]);

  useEffect(() => {
    if (is_open && !is_pinned) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [is_open, is_pinned]);

  useEffect(() => {
    if (isPanelVisible && !wasVisibleRef.current) {
      setNoteView('list');
    }

    wasVisibleRef.current = isPanelVisible;
  }, [isPanelVisible]);

  useEffect(
    () => () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }

      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }

      if (isLoadedRef.current)
        void saveNotes(notesRef.current.filter((note) => !isNoteEmpty(note)));
    },
    [],
  );

  function formatNoteDate(value) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value));
    } catch {
      return '';
    }
  }

  function getNoteTitle(note) {
    return note.title.trim() || t('note_untitled');
  }

  function focusTitleInput() {
    requestAnimationFrame(() => {
      titleInputRef.current?.focus({ preventScroll: true });
    });
  }

  function removeEmptyNote(noteId) {
    if (!noteId) return;

    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId || !isNoteEmpty(note)),
    );
  }

  function handleBackToList() {
    if (activeNote && isNoteEmpty(activeNote)) {
      removeEmptyNote(activeNote.id);
      setActiveNoteId(filteredNotes[0]?.id || null);
    }

    setNoteView('list');
  }

  function handleClosePanel() {
    if (activeNote && isNoteEmpty(activeNote)) {
      removeEmptyNote(activeNote.id);
      setActiveNoteId(filteredNotes[0]?.id || null);
    }

    setPendingDeleteNoteId(null);
    setNoteView('list');
    on_close();
  }

  function createNewNote() {
    const emptyNote = notes.find((note) => isNoteEmpty(note));

    if (emptyNote) {
      setShowArchived(false);
      setSearchQuery('');
      setActiveNoteId(emptyNote.id);
      setNoteView('editor');
      focusTitleInput();
      return;
    }

    const note = createNote();

    setShowArchived(false);
    setSearchQuery('');
    setNotes((currentNotes) => [note, ...currentNotes]);
    setActiveNoteId(note.id);
    setNoteView('editor');
    focusTitleInput();
  }

  function openNote(noteId) {
    setActiveNoteId(noteId);
    setNoteView('editor');
  }

  function updateActiveNote(field, value) {
    if (!activeNote) return;

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === activeNote.id
          ? { ...note, [field]: value, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  }

  function toggleNotePin(noteId) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  }

  function toggleNoteArchive(noteId) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? { ...note, isArchived: !note.isArchived, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  }

  function deleteNote(noteId) {
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    if (noteIndex === -1) return;

    const deletedNote = notes[noteIndex];

    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
    }

    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
    setUndoState({ note: deletedNote, index: noteIndex });

    undoTimer.current = setTimeout(() => {
      setUndoState(null);
      undoTimer.current = null;
    }, UNDO_TIMEOUT);
  }

  function requestDeleteNote(noteId) {
    setPendingDeleteNoteId(noteId);
  }

  function cancelDeleteConfirmation() {
    setPendingDeleteNoteId(null);
  }

  function confirmDeleteNote() {
    if (!pendingDeleteNoteId) return;

    deleteNote(pendingDeleteNoteId);
    setPendingDeleteNoteId(null);
  }

  function handleDeleteConfirmationOverlayClick(event) {
    if (event.target === event.currentTarget) {
      cancelDeleteConfirmation();
    }
  }

  function restoreDeletedNote() {
    if (!undoState) return;

    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }

    setNotes((currentNotes) => {
      const nextNotes = [...currentNotes];
      nextNotes.splice(Math.min(undoState.index, nextNotes.length), 0, undoState.note);
      return nextNotes;
    });
    setShowArchived(undoState.note.isArchived);
    setActiveNoteId(undoState.note.id);
    setUndoState(null);
  }

  if (!isLoaded) return null;
  if (!is_open && !is_pinned) return null;

  const isSearchEmpty = searchQuery.trim().length > 0 && filteredNotes.length === 0;
  const emptyMessage = showArchived
    ? t('note_archived_empty')
    : isSearchEmpty
      ? t('note_search_empty')
      : t('note_empty');

  return (
    <>
      {!is_pinned && is_open && (
        <div className="settings-overlay" onClick={handleClosePanel} role="presentation" />
      )}
      <aside
        className={`note-panel ${is_pinned ? 'note-panel--pinned' : ''} ${is_open ? 'note-panel--open' : ''}`}
        ref={panelRef}
        role={is_pinned ? 'complementary' : 'dialog'}
        aria-modal={is_pinned ? undefined : 'true'}
        aria-label={t('note_aria_label')}
        tabIndex={-1}
      >
        <header className="note-panel-header">
          <h2 className="note-panel-title">{t('note_aria_label')}</h2>
          <div className="note-panel-actions">
            <button
              className="note-panel-button"
              type="button"
              ref={createButtonRef}
              onClick={createNewNote}
              aria-label={t('note_add')}
              title={t('note_add')}
            >
              <PlusIcon />
            </button>
            <button
              className={`note-panel-button ${is_pinned ? 'note-panel-button--active' : ''}`}
              type="button"
              onClick={on_toggle_pin}
              aria-label={t('note_pin_panel')}
              title={t('note_pin_panel')}
            >
              <PinIcon />
            </button>
            {!is_pinned && (
              <button
                className="note-panel-button"
                type="button"
                onClick={handleClosePanel}
                aria-label={t('modal_cancel')}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </header>

        {!isEditorView && (
          <div className="note-panel-controls">
            <label className="visually-hidden" htmlFor="note-search">
              {t('note_search_label')}
            </label>
            <input
              id="note-search"
              className="note-panel-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('note_search_placeholder')}
            />
            <div className="note-panel-tabs" role="group" aria-label={t('note_filter_label')}>
              <button
                className={`note-panel-tab ${!showArchived ? 'note-panel-tab--active' : ''}`}
                type="button"
                aria-pressed={!showArchived}
                onClick={() => setShowArchived(false)}
              >
                {t('note_filter_active')}
              </button>
              <button
                className={`note-panel-tab ${showArchived ? 'note-panel-tab--active' : ''}`}
                type="button"
                aria-pressed={showArchived}
                onClick={() => setShowArchived(true)}
              >
                {t('note_filter_archived')}
              </button>
            </div>
          </div>
        )}

        <div
          className={`note-panel-body ${isEditorView ? 'note-panel-body--editor' : 'note-panel-body--list'}`}
        >
          {!isEditorView ? (
            <>
              {filteredNotes.length > 0 ? (
                <ul className="note-list" aria-label={t('note_list_label')}>
                  {filteredNotes.map((note) => (
                    <li
                      key={note.id}
                      className={`note-list-row ${activeNoteId === note.id ? 'note-list-row--active' : ''}`}
                    >
                      <button
                        className="note-list-item"
                        type="button"
                        onClick={() => openNote(note.id)}
                        aria-current={activeNoteId === note.id}
                      >
                        <span className="note-list-title">{getNoteTitle(note)}</span>
                      </button>
                      <div className="note-list-actions">
                        <button
                          className={`note-panel-button note-panel-button--compact ${note.isPinned ? 'note-panel-button--active' : ''}`}
                          type="button"
                          onClick={() => toggleNotePin(note.id)}
                          aria-label={note.isPinned ? t('note_unpin_item') : t('note_pin_item')}
                          title={note.isPinned ? t('note_unpin_item') : t('note_pin_item')}
                        >
                          <PinIcon />
                        </button>
                        <button
                          className="note-panel-button note-panel-button--compact"
                          type="button"
                          onClick={() => toggleNoteArchive(note.id)}
                          aria-label={
                            note.isArchived ? t('note_restore_item') : t('note_archive_item')
                          }
                          title={note.isArchived ? t('note_restore_item') : t('note_archive_item')}
                        >
                          {note.isArchived ? <RestoreIcon /> : <ArchiveIcon />}
                        </button>
                        <button
                          className="note-panel-button note-panel-button--compact note-panel-button--danger"
                          type="button"
                          onClick={() => requestDeleteNote(note.id)}
                          aria-label={t('note_delete_item')}
                          title={t('note_delete_item')}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="note-panel-empty">
                  <p>{emptyMessage}</p>
                  <button
                    className="modal-button modal-button--save"
                    type="button"
                    onClick={isSearchEmpty ? () => setSearchQuery('') : createNewNote}
                  >
                    {isSearchEmpty ? t('note_clear_search') : t('note_add')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="note-editor" role="region" aria-label={t('note_editor_label')}>
              <div className="note-editor-header">
                <button
                  className="note-panel-button"
                  type="button"
                  onClick={handleBackToList}
                  aria-label={t('note_back_to_list')}
                  title={t('note_back_to_list')}
                >
                  <BackIcon />
                </button>
              </div>
              <label className="visually-hidden" htmlFor="note-title">
                {t('note_title_label')}
              </label>
              <input
                id="note-title"
                ref={titleInputRef}
                className="note-title-input"
                type="text"
                value={activeNote.title}
                onChange={(event) => updateActiveNote('title', event.target.value)}
                placeholder={t('note_title_placeholder')}
              />
              <label className="visually-hidden" htmlFor="note-content">
                {t('note_content_label')}
              </label>
              <textarea
                id="note-content"
                className="note-panel-textarea"
                value={activeNote.content}
                onChange={(event) => updateActiveNote('content', event.target.value)}
                placeholder={t('note_placeholder')}
                aria-label={t('note_content_label')}
              />
              <p className="note-editor-meta">
                {t('note_updated_at', { date: formatNoteDate(activeNote.updatedAt) })}
              </p>
              <p
                className={`note-save-status note-save-status--${saveStatus}`}
                role="status"
                aria-live="polite"
              >
                {saveStatus === 'saving' && t('note_save_saving')}
                {saveStatus === 'saved' && t('note_save_saved')}
                {saveStatus === 'error' && t('note_save_error')}
              </p>
            </div>
          )}
        </div>

        {pendingDeleteNote && (
          <div
            className="note-confirm-overlay"
            onClick={handleDeleteConfirmationOverlayClick}
            role="presentation"
          >
            <div
              className="note-confirm-dialog"
              ref={deleteDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="note-delete-confirm-title"
              aria-describedby="note-delete-confirm-description"
              tabIndex={-1}
            >
              <h3 className="note-confirm-title" id="note-delete-confirm-title">
                {t('note_delete_confirm_title')}
              </h3>
              <p className="note-confirm-description" id="note-delete-confirm-description">
                {t('note_delete_confirm_description')}
              </p>
              <div className="modal-actions">
                <button
                  className="modal-button modal-button--cancel"
                  type="button"
                  ref={deleteCancelButtonRef}
                  onClick={cancelDeleteConfirmation}
                >
                  {t('note_delete_confirm_cancel')}
                </button>
                <button
                  className="modal-button modal-button--danger"
                  type="button"
                  onClick={confirmDeleteNote}
                >
                  {t('note_delete_confirm_action')}
                </button>
              </div>
            </div>
          </div>
        )}

        {undoState && (
          <div className="note-panel-toast" role="status" aria-live="polite">
            <span>{t('note_deleted')}</span>
            <button className="toast-action" type="button" onClick={restoreDeletedNote}>
              {t('toast_undo')}
            </button>
          </div>
        )}
        {/* /.note-panel */}
      </aside>
    </>
  );
}

export default NotePanel;
