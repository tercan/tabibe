import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import useBodyScrollLock from '../hooks/useBodyScrollLock.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import useNotes from '../hooks/useNotes.js';
import { isNoteEmpty } from '../domain/noteOperations.js';
import { groupNotesForLibrary } from '../domain/notePresentation.js';
import NoteConflictDialog from './notes/NoteConflictDialog.jsx';
import NoteEditor from './notes/NoteEditor.jsx';
import NoteLibraryHeader from './notes/NoteLibraryHeader.jsx';
import { NoteFilterContent, NoteMoreContent, NoteSortContent } from './notes/NoteLibraryMenus.jsx';
import NoteListPane from './notes/NoteListPane.jsx';
import NoteListToolbar from './notes/NoteListToolbar.jsx';
import NoteNotebookManager from './notes/NoteNotebookManager.jsx';
import NoteTagManager from './notes/NoteTagManager.jsx';

function NotePanel({ note_sort, on_change_sort, on_close, on_open_library, request }) {
  const { t } = useTranslation();
  const [isNotebookManagerOpen, setIsNotebookManagerOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [narrowPane, setNarrowPane] = useState('list');
  const [noteScope, setNoteScope] = useState('all');
  const [pendingDeleteNoteIds, setPendingDeleteNoteIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [captureNoteId, setCaptureNoteId] = useState(null);
  const [captureHasPersisted, setCaptureHasPersisted] = useState(false);
  const closeInProgressRef = useRef(false);
  const contentInputRef = useRef(null);
  const deleteCancelButtonRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const panelRef = useRef(null);
  const processedRequestRef = useRef(null);
  const {
    activeNote,
    activeNoteId,
    addNoteNotebook,
    addNoteTag,
    beginCapture,
    conflictState,
    createNewNote,
    deleteNotes,
    discardRecoveryDraft,
    editNoteNotebook,
    editNoteTag,
    filteredNotes,
    flushPendingNotes,
    isLoaded,
    loadStatus,
    moveNotebook,
    noteNotebooks,
    notes,
    noteTags,
    removeEmptyNote,
    removeNoteNotebook,
    removeNoteTag,
    reorderNotebooks,
    recoveryDrafts,
    resolveConflict,
    restoreRecoveryDraft,
    restoreDeletedNote,
    retryLoad,
    retrySave,
    saveErrorCode,
    saveStatus,
    setActiveNoteId,
    toggleNoteArchive,
    toggleNotePin,
    toggleNoteTag,
    undoState,
    updateActiveNote,
  } = useNotes({
    pinnedOnly: noteScope === 'pinned',
    searchQuery,
    selectedNotebookId,
    showArchived: noteScope === 'archived',
    sortBy: note_sort,
  });
  const isCapture = request.type === 'capture';
  const isReady = loadStatus ? loadStatus === 'ready' : isLoaded;
  const panelActiveNote = isCapture && activeNote?.id !== captureNoteId ? null : activeNote;
  const pendingDeleteNotes = notes.filter((note) => pendingDeleteNoteIds.includes(note.id));
  const noteGroups = useMemo(
    () => groupNotesForLibrary(filteredNotes, { preserveOrder: true }),
    [filteredNotes],
  );

  const commitAndClose = useCallback(async () => {
    if (closeInProgressRef.current) return false;
    closeInProgressRef.current = true;

    try {
      if (activeNote && isNoteEmpty(activeNote)) {
        removeEmptyNote(activeNote.id);
        on_close();
        return true;
      }

      const didSave = await flushPendingNotes();
      if (didSave) on_close();
      return didSave;
    } finally {
      closeInProgressRef.current = false;
    }
  }, [activeNote, flushPendingNotes, on_close, removeEmptyNote]);

  function handleEscape() {
    const isNarrowLibraryEditor =
      !isCapture &&
      narrowPane === 'editor' &&
      globalThis.matchMedia?.('(max-width: 48rem)').matches;

    if (isNarrowLibraryEditor) {
      setNarrowPane('list');
      return;
    }

    void commitAndClose();
  }

  useFocusTrap({
    containerRef: panelRef,
    isActive:
      isReady &&
      pendingDeleteNoteIds.length === 0 &&
      !isNotebookManagerOpen &&
      !isTagManagerOpen &&
      !conflictState,
    initialFocusRef: contentInputRef,
    onEscape: handleEscape,
  });
  useBodyScrollLock(true);

  useFocusTrap({
    containerRef: deleteDialogRef,
    isActive: isReady && pendingDeleteNoteIds.length > 0,
    initialFocusRef: deleteCancelButtonRef,
    onEscape: () => setPendingDeleteNoteIds([]),
  });

  useEffect(() => {
    if (!isReady || processedRequestRef.current === request.requestId) return;
    processedRequestRef.current = request.requestId;

    if (request.type === 'capture') {
      const note = beginCapture(request.captureSessionId);
      setCaptureNoteId(note.id);
      setCaptureHasPersisted(false);
      setNarrowPane('editor');
      return;
    }

    setCaptureNoteId(null);
    setNarrowPane('list');
  }, [beginCapture, isReady, request]);

  useEffect(() => {
    if (!isCapture || !panelActiveNote) return undefined;
    const frameId = requestAnimationFrame(() => {
      contentInputRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frameId);
  }, [isCapture, panelActiveNote]);

  useEffect(() => {
    if (isCapture && saveStatus === 'saved') setCaptureHasPersisted(true);
  }, [isCapture, saveStatus]);

  useEffect(() => {
    if (!isReady || isCapture || activeNote || filteredNotes.length === 0) return;
    setActiveNoteId(filteredNotes[0].id);
  }, [activeNote, filteredNotes, isCapture, isReady, setActiveNoteId]);

  function focusContent() {
    requestAnimationFrame(() => contentInputRef.current?.focus({ preventScroll: true }));
  }

  function handleCreateNote() {
    const note = createNewNote({ notebookId: selectedNotebookId });
    setNoteScope('all');
    setSearchQuery('');
    setCaptureNoteId(note.id);
    setNarrowPane('editor');
    focusContent();
  }

  function handleOpenNote(noteId) {
    setActiveNoteId(noteId);
    setNarrowPane('editor');
    focusContent();
  }

  function handleBackToList() {
    if (activeNote && isNoteEmpty(activeNote)) removeEmptyNote(activeNote.id);
    setActiveNoteId(null);
    setNarrowPane('list');
  }

  function handleOpenLibrary() {
    const selectionStart = contentInputRef.current?.selectionStart;
    const selectionEnd = contentInputRef.current?.selectionEnd;
    setNarrowPane('editor');
    on_open_library();
    requestAnimationFrame(() => {
      const input = contentInputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      if (Number.isInteger(selectionStart) && Number.isInteger(selectionEnd)) {
        input.setSelectionRange(selectionStart, selectionEnd);
      }
    });
  }

  async function handleCopyActiveNote() {
    if (!activeNote || !navigator.clipboard?.writeText) return false;
    const title = activeNote.title.trim();
    const content = title ? `${title}\n\n${activeNote.content}` : activeNote.content;
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return false;
    }
  }

  async function handleDiscardAndClose() {
    if (activeNote) {
      deleteNotes([activeNote.id]);
    }
    const didDiscard = await discardRecoveryDraft();
    if (didDiscard) on_close();
  }

  function handleToggleArchive(noteId) {
    toggleNoteArchive(noteId);
    if (noteId === activeNoteId) {
      setActiveNoteId(null);
      setNarrowPane('list');
    }
  }

  function handleClearFilters() {
    setSearchQuery('');
    setNoteScope('all');
    setSelectedNotebookId(null);
  }

  function handleClearListFilters() {
    setNoteScope('all');
    setSelectedNotebookId(null);
  }

  function handleSelectNoteScope(nextScope) {
    setNoteScope(nextScope);
    setActiveNoteId(null);
    setNarrowPane('list');
  }

  function handleSelectNotebook(notebookId) {
    setSelectedNotebookId(notebookId);
    setActiveNoteId(null);
    setNarrowPane('list');
  }

  function handleRemoveNoteTag(tagId) {
    removeNoteTag(tagId);
  }

  function handleRemoveNoteNotebook(notebookId) {
    removeNoteNotebook(notebookId);
    if (selectedNotebookId === notebookId) setSelectedNotebookId(null);
  }

  function handleResolveConflict(strategy) {
    resolveConflict(strategy, t('note_conflict_copy_suffix'));
  }

  function handleRestoreRecoveryDraft() {
    const draft = recoveryDrafts[0];
    if (!draft) return;
    const note = restoreRecoveryDraft(draft.sessionId);
    if (!note) return;
    setActiveNoteId(note.id);
    setNarrowPane('editor');
    focusContent();
  }

  async function handleDiscardRecoveryDraft() {
    const draft = recoveryDrafts[0];
    if (draft) await discardRecoveryDraft(draft.sessionId);
  }

  function confirmDeleteNote() {
    if (pendingDeleteNoteIds.length === 0) return;
    deleteNotes(pendingDeleteNoteIds);
    if (pendingDeleteNoteIds.includes(activeNoteId)) {
      setActiveNoteId(null);
      setNarrowPane('list');
    }
    setPendingDeleteNoteIds([]);
  }

  const hasFilters =
    searchQuery.trim().length > 0 || noteScope !== 'all' || selectedNotebookId !== null;
  const hasListFilters = noteScope !== 'all' || selectedNotebookId !== null;
  const emptyMessage =
    noteScope === 'archived'
      ? t('note_archived_empty')
      : hasFilters
        ? t('note_search_empty')
        : t('note_empty');

  if (!isReady) {
    const hasLoadError = loadStatus === 'error';
    return (
      <>
        <div className="notes-backdrop" role="presentation" />
        <section
          className={`notes-surface notes-surface--${request.type}`}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('note_aria_label')}
          tabIndex={-1}
        >
          <div className="notes-empty" role={hasLoadError ? 'alert' : 'status'}>
            <p>{hasLoadError ? t('note_load_error') : t('app_loading')}</p>
            {hasLoadError && (
              <button
                className="notes-button notes-button--primary"
                type="button"
                onClick={retryLoad}
              >
                {t('common_retry')}
              </button>
            )}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {isCapture && (
        <div className="notes-backdrop" onClick={() => void commitAndClose()} role="presentation" />
      )}
      <section
        className={`notes-surface notes-surface--${request.type}`}
        data-pane={narrowPane}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('note_aria_label')}
        tabIndex={-1}
      >
        <NoteLibraryHeader
          moreContent={
            <NoteMoreContent
              onManageNotebooks={() => setIsNotebookManagerOpen(true)}
              onManageTags={() => setIsTagManagerOpen(true)}
            />
          }
          onClose={() => void commitAndClose()}
          onCreate={handleCreateNote}
        />

        {!isCapture && recoveryDrafts.length > 0 && (
          <section
            className="notes-recovery-banner"
            aria-label={t('note_recovery_available', {
              count: recoveryDrafts.length,
            })}
          >
            <p role="status">{t('note_recovery_available', { count: recoveryDrafts.length })}</p>
            <div className="notes-recovery-actions">
              <button className="notes-button" type="button" onClick={handleRestoreRecoveryDraft}>
                {t('note_recovery_restore')}
              </button>
              <button
                className="notes-button notes-button--danger"
                type="button"
                onClick={() => void handleDiscardRecoveryDraft()}
              >
                {t('note_recovery_discard')}
              </button>
            </div>
          </section>
        )}

        <div className="notes-workspace">
          <NoteListPane
            activeNoteId={activeNoteId}
            emptyActionLabel={hasFilters ? t('note_clear_filters') : t('note_add')}
            emptyMessage={emptyMessage}
            groups={noteGroups}
            noteNotebooks={noteNotebooks}
            onCreate={hasFilters ? handleClearFilters : handleCreateNote}
            onOpenNote={handleOpenNote}
            toolbar={
              <NoteListToolbar
                filterContent={
                  <NoteFilterContent
                    hasFilters={hasListFilters}
                    noteScope={noteScope}
                    noteNotebooks={noteNotebooks}
                    onClear={handleClearListFilters}
                    onSelectNotebook={handleSelectNotebook}
                    onSelectScope={handleSelectNoteScope}
                    selectedNotebookId={selectedNotebookId}
                  />
                }
                hasFilters={hasListFilters}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
                sortContent={<NoteSortContent onChangeSort={on_change_sort} sortBy={note_sort} />}
              />
            }
          />

          <section className="notes-editor-pane" aria-label={t('note_editor_label')}>
            {panelActiveNote ? (
              <NoteEditor
                key={panelActiveNote.id}
                activeNote={panelActiveNote}
                contentInputRef={contentInputRef}
                noteNotebooks={noteNotebooks}
                noteTags={noteTags}
                onBack={handleBackToList}
                onCommitAndClose={commitAndClose}
                onCopy={handleCopyActiveNote}
                onDiscard={captureHasPersisted ? undefined : handleDiscardAndClose}
                onManageTags={() => setIsTagManagerOpen(true)}
                onOpenLibrary={handleOpenLibrary}
                onRequestClose={() => void commitAndClose()}
                onRequestDelete={() => setPendingDeleteNoteIds([panelActiveNote.id])}
                onRetrySave={retrySave}
                onToggleArchive={() => handleToggleArchive(panelActiveNote.id)}
                onTogglePin={() => toggleNotePin(panelActiveNote.id)}
                onToggleTag={toggleNoteTag}
                onUpdate={updateActiveNote}
                presentation={request.type}
                saveErrorCode={saveErrorCode}
                saveStatus={saveStatus}
              />
            ) : (
              <div className="notes-empty">
                <NotebookPen aria-hidden="true" />
                <p>{t('note_select_to_edit')}</p>
                <button
                  className="notes-button notes-button--primary"
                  type="button"
                  onClick={handleCreateNote}
                >
                  {t('note_add')}
                </button>
              </div>
            )}
          </section>
        </div>

        <NoteTagManager
          isOpen={isTagManagerOpen && !isNotebookManagerOpen && !conflictState}
          noteTags={noteTags}
          onAdd={addNoteTag}
          onClose={() => setIsTagManagerOpen(false)}
          onDelete={handleRemoveNoteTag}
          onEdit={editNoteTag}
        />

        <NoteNotebookManager
          isOpen={isNotebookManagerOpen && !isTagManagerOpen && !conflictState}
          noteNotebooks={noteNotebooks}
          notes={notes}
          onAdd={addNoteNotebook}
          onClose={() => setIsNotebookManagerOpen(false)}
          onDelete={handleRemoveNoteNotebook}
          onEdit={editNoteNotebook}
          onMove={moveNotebook}
          onReorder={reorderNotebooks}
        />

        {pendingDeleteNotes.length > 0 && (
          <div className="note-confirm-overlay" role="presentation">
            <div
              className="note-confirm-dialog"
              ref={deleteDialogRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="note-delete-confirm-title"
              aria-describedby="note-delete-confirm-description"
              tabIndex={-1}
            >
              <h3 className="note-confirm-title" id="note-delete-confirm-title">
                {pendingDeleteNotes.length > 1
                  ? t('note_bulk_delete_confirm_title')
                  : t('note_delete_confirm_title')}
              </h3>
              <p className="note-confirm-description" id="note-delete-confirm-description">
                {pendingDeleteNotes.length > 1
                  ? t('note_bulk_delete_confirm_description', {
                      count: pendingDeleteNotes.length,
                    })
                  : t('note_delete_confirm_description')}
              </p>
              <div className="modal-actions">
                <button
                  className="modal-button modal-button--cancel"
                  type="button"
                  ref={deleteCancelButtonRef}
                  onClick={() => setPendingDeleteNoteIds([])}
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

        <NoteConflictDialog conflict={conflictState} onResolve={handleResolveConflict} />

        {undoState && (
          <div className="note-panel-toast" role="status" aria-live="polite">
            <span>
              {undoState.items.length > 1
                ? t('note_deleted_count', { count: undoState.items.length })
                : t('note_deleted')}
            </span>
            <button className="toast-action" type="button" onClick={restoreDeletedNote}>
              {t('toast_undo')}
            </button>
          </div>
        )}
        {/* /.notes-surface */}
      </section>
    </>
  );
}

export default NotePanel;
