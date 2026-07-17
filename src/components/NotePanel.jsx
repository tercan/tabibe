import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import useBodyScrollLock from '../hooks/useBodyScrollLock.js';
import useNotes from '../hooks/useNotes.js';
import { isNoteEmpty } from '../domain/noteOperations.js';
import CloseIcon from './icons/CloseIcon.jsx';
import NoteBulkActions from './notes/NoteBulkActions.jsx';
import NoteConflictDialog from './notes/NoteConflictDialog.jsx';
import NoteFilters from './notes/NoteFilters.jsx';
import NoteTagManager from './notes/NoteTagManager.jsx';
import NoteTagPicker from './notes/NoteTagPicker.jsx';

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

function PanelSideIcon({ side }) {
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
      <rect x="3" y="4" width="18" height="16" />
      <path d={side === 'left' ? 'M9 4v16' : 'M15 4v16'} />
    </svg>
  );
}

function FullscreenIcon({ active }) {
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
      {active ? (
        <>
          <path d="M8 3v5H3" />
          <path d="M16 3v5h5" />
          <path d="M8 21v-5H3" />
          <path d="M16 21v-5h5" />
        </>
      ) : (
        <>
          <path d="M8 3H3v5" />
          <path d="M16 3h5v5" />
          <path d="M8 21H3v-5" />
          <path d="M16 21h5v-5" />
        </>
      )}
    </svg>
  );
}

function SelectIcon() {
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
      <rect x="3" y="3" width="18" height="18" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

/**
 * 3. NotePanel component
 */

function NotePanel({
  capture_request,
  is_open,
  is_pinned,
  layout_side,
  layout_mode,
  note_sort,
  on_close,
  on_capture_consumed,
  on_toggle_pin,
  on_change_side,
  on_toggle_fullscreen,
  on_change_sort,
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [noteView, setNoteView] = useState('list');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [pendingDeleteNoteIds, setPendingDeleteNoteIds] = useState([]);
  const wasVisibleRef = useRef(false);
  const panelRef = useRef(null);
  const titleInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const createButtonRef = useRef(null);
  const captureRequestRef = useRef(0);
  const deleteDialogRef = useRef(null);
  const deleteCancelButtonRef = useRef(null);
  const {
    activeNote,
    activeNoteId,
    addNoteTag,
    bulkArchiveNotes,
    bulkTagNotes,
    conflictState,
    deleteNotes,
    editNoteTag,
    ensureEditableNote,
    filteredNotes,
    isLoaded,
    notes,
    noteTags,
    removeEmptyNote,
    removeNoteTag,
    resolveConflict,
    restoreDeletedNote,
    retrySave,
    saveStatus,
    setActiveNoteId,
    toggleNoteArchive,
    toggleNotePin,
    toggleNoteTag,
    undoState,
    updateActiveNote,
  } = useNotes({
    dateRange,
    pinnedOnly,
    searchQuery,
    selectedTagIds,
    showArchived,
    sortBy: note_sort,
  });
  const pendingDeleteNotes = notes.filter((note) => pendingDeleteNoteIds.includes(note.id));
  const isEditorView = noteView === 'editor' && activeNote;
  const isPanelVisible = is_open || is_pinned;
  const isFullscreen = layout_mode === 'fullscreen';

  useFocusTrap({
    containerRef: panelRef,
    isActive:
      isLoaded &&
      is_open &&
      (!is_pinned || isFullscreen) &&
      pendingDeleteNoteIds.length === 0 &&
      !isTagManagerOpen &&
      !conflictState,
    initialFocusRef: isEditorView ? titleInputRef : createButtonRef,
    onEscape: handleClosePanel,
  });
  useBodyScrollLock(is_open && (!is_pinned || isFullscreen));

  useFocusTrap({
    containerRef: deleteDialogRef,
    isActive: isPanelVisible && pendingDeleteNoteIds.length > 0,
    initialFocusRef: deleteCancelButtonRef,
    onEscape: cancelDeleteConfirmation,
  });

  const focusTitleInput = useCallback(() => {
    requestAnimationFrame(() => {
      titleInputRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const createNewNote = useCallback(() => {
    setShowArchived(false);
    setSearchQuery('');
    setSelectionMode(false);
    setSelectedNoteIds([]);
    ensureEditableNote();
    setNoteView('editor');
    focusTitleInput();
  }, [ensureEditableNote, focusTitleInput]);

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
  }, [activeNote, filteredNotes, isLoaded, noteView, setActiveNoteId, showArchived]);

  useEffect(() => {
    if (isPanelVisible && !wasVisibleRef.current) {
      setNoteView('list');
    }

    wasVisibleRef.current = isPanelVisible;
  }, [isPanelVisible]);

  useEffect(() => {
    setSelectedNoteIds((currentIds) =>
      currentIds.filter((noteId) => filteredNotes.some((note) => note.id === noteId)),
    );
  }, [filteredNotes]);

  useEffect(() => {
    if (!isLoaded || !isPanelVisible || capture_request <= captureRequestRef.current) return;
    captureRequestRef.current = capture_request;
    createNewNote();
    on_capture_consumed();
  }, [capture_request, createNewNote, isLoaded, isPanelVisible, on_capture_consumed]);

  useEffect(() => {
    if (!isLoaded || !isPanelVisible) return undefined;

    function handleWorkspaceShortcut(event) {
      const target = event.target;
      const isEditing =
        target instanceof HTMLElement &&
        (target.matches('input, textarea, select') || target.isContentEditable);
      if (isEditing || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const key = event.key.toLocaleLowerCase();
      if (key === 'n') {
        event.preventDefault();
        createNewNote();
      }
      if (key === '/') {
        event.preventDefault();
        setNoteView('list');
        requestAnimationFrame(() => searchInputRef.current?.focus({ preventScroll: true }));
      }
    }

    document.addEventListener('keydown', handleWorkspaceShortcut);
    return () => document.removeEventListener('keydown', handleWorkspaceShortcut);
  }, [createNewNote, isLoaded, isPanelVisible]);

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

    setPendingDeleteNoteIds([]);
    setIsTagManagerOpen(false);
    setSelectionMode(false);
    setSelectedNoteIds([]);
    setNoteView('list');
    on_close();
  }

  function openNote(noteId) {
    setActiveNoteId(noteId);
    setNoteView('editor');
  }

  function requestDeleteNote(noteId) {
    setPendingDeleteNoteIds([noteId]);
  }

  function cancelDeleteConfirmation() {
    setPendingDeleteNoteIds([]);
  }

  function confirmDeleteNote() {
    if (pendingDeleteNoteIds.length === 0) return;

    deleteNotes(pendingDeleteNoteIds);
    setPendingDeleteNoteIds([]);
    setSelectedNoteIds([]);
    setSelectionMode(false);
  }

  function handleDeleteConfirmationOverlayClick(event) {
    if (event.target === event.currentTarget) {
      cancelDeleteConfirmation();
    }
  }

  function handleRestoreDeletedNote() {
    const restoredNotes = restoreDeletedNote();
    if (restoredNotes?.[0]) setShowArchived(restoredNotes[0].isArchived);
  }

  function handleToggleNoteSelection(noteId) {
    setSelectedNoteIds((currentIds) =>
      currentIds.includes(noteId)
        ? currentIds.filter((id) => id !== noteId)
        : [...currentIds, noteId],
    );
  }

  function handleToggleSelectAll() {
    const visibleIds = filteredNotes.map((note) => note.id);
    const allSelected = visibleIds.every((noteId) => selectedNoteIds.includes(noteId));
    setSelectedNoteIds(allSelected ? [] : visibleIds);
  }

  function handleBulkTag(tagId, shouldAdd) {
    bulkTagNotes(selectedNoteIds, tagId, shouldAdd);
  }

  function handleBulkArchive() {
    bulkArchiveNotes(selectedNoteIds, !showArchived);
    setSelectedNoteIds([]);
    setSelectionMode(false);
  }

  function handleRequestBulkDelete() {
    setPendingDeleteNoteIds(selectedNoteIds);
  }

  function handleToggleFilterTag(tagId) {
    setSelectedTagIds((currentIds) =>
      currentIds.includes(tagId) ? currentIds.filter((id) => id !== tagId) : [...currentIds, tagId],
    );
  }

  function handleClearFilters() {
    setSelectedTagIds([]);
    setPinnedOnly(false);
    setDateRange('all');
  }

  function handleClearSearchAndFilters() {
    setSearchQuery('');
    handleClearFilters();
  }

  function handleRemoveNoteTag(tagId) {
    removeNoteTag(tagId);
    setSelectedTagIds((currentIds) => currentIds.filter((id) => id !== tagId));
  }

  function handleResolveConflict(strategy) {
    resolveConflict(strategy, t('note_conflict_copy_suffix'));
  }

  if (!isLoaded) return null;
  if (!is_open && !is_pinned) return null;

  const isSearchEmpty = searchQuery.trim().length > 0 && filteredNotes.length === 0;
  const hasAdvancedFilters = selectedTagIds.length > 0 || pinnedOnly || dateRange !== 'all';
  const hasNoMatches = isSearchEmpty || hasAdvancedFilters;
  const emptyMessage = showArchived
    ? t('note_archived_empty')
    : hasNoMatches
      ? t('note_search_empty')
      : t('note_empty');
  const activeNoteCount = notes.filter((note) => !note.isArchived).length;
  const archivedNoteCount = notes.length - activeNoteCount;
  const allVisibleSelected =
    filteredNotes.length > 0 && filteredNotes.every((note) => selectedNoteIds.includes(note.id));

  return (
    <>
      {!is_pinned && is_open && !isFullscreen && (
        <div className="settings-overlay" onClick={handleClosePanel} role="presentation" />
      )}
      <aside
        className={[
          'note-panel',
          `note-panel--${layout_side}`,
          is_pinned ? 'note-panel--pinned' : '',
          is_open ? 'note-panel--open' : '',
          isFullscreen ? 'note-panel--fullscreen' : '',
        ]
          .filter(Boolean)
          .join(' ')}
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
              className={`note-panel-button ${selectionMode ? 'note-panel-button--active' : ''}`}
              type="button"
              onClick={() => {
                setSelectionMode((currentValue) => !currentValue);
                setSelectedNoteIds([]);
                setNoteView('list');
              }}
              aria-pressed={selectionMode}
              aria-label={t('note_select_mode')}
              title={t('note_select_mode')}
            >
              <SelectIcon />
            </button>
            <button
              className="note-panel-button"
              type="button"
              onClick={on_change_side}
              aria-label={
                layout_side === 'left' ? t('note_move_panel_right') : t('note_move_panel_left')
              }
              title={
                layout_side === 'left' ? t('note_move_panel_right') : t('note_move_panel_left')
              }
            >
              <PanelSideIcon side={layout_side === 'left' ? 'right' : 'left'} />
            </button>
            <button
              className={`note-panel-button ${isFullscreen ? 'note-panel-button--active' : ''}`}
              type="button"
              onClick={on_toggle_fullscreen}
              aria-label={isFullscreen ? t('note_exit_fullscreen') : t('note_enter_fullscreen')}
              title={isFullscreen ? t('note_exit_fullscreen') : t('note_enter_fullscreen')}
            >
              <FullscreenIcon active={isFullscreen} />
            </button>
            {!isFullscreen && (
              <button
                className={`note-panel-button ${is_pinned ? 'note-panel-button--active' : ''}`}
                type="button"
                onClick={on_toggle_pin}
                aria-label={t('note_pin_panel')}
                title={t('note_pin_panel')}
              >
                <PinIcon />
              </button>
            )}
            {(!is_pinned || isFullscreen) && (
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

        <div className="note-workspace">
          <nav className="note-workspace-navigation" aria-label={t('note_filter_label')}>
            <h3 className="note-workspace-navigation-title">{t('note_filter_label')}</h3>
            <div className="note-workspace-navigation-items">
              <button
                className={`note-workspace-navigation-button ${!showArchived ? 'note-workspace-navigation-button--active' : ''}`}
                type="button"
                aria-pressed={!showArchived}
                onClick={() => setShowArchived(false)}
              >
                <span>{t('note_filter_active')}</span>
                <span className="note-workspace-count">{activeNoteCount}</span>
              </button>
              <button
                className={`note-workspace-navigation-button ${showArchived ? 'note-workspace-navigation-button--active' : ''}`}
                type="button"
                aria-pressed={showArchived}
                onClick={() => setShowArchived(true)}
              >
                <span>{t('note_filter_archived')}</span>
                <span className="note-workspace-count">{archivedNoteCount}</span>
              </button>
            </div>
          </nav>

          <div
            className={`note-workspace-list-pane ${isEditorView ? 'note-workspace-pane--compact-hidden' : ''}`}
          >
            <div className="note-panel-controls">
              <label className="visually-hidden" htmlFor="note-search">
                {t('note_search_label')}
              </label>
              <input
                id="note-search"
                ref={searchInputRef}
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

            <NoteFilters
              dateRange={dateRange}
              noteTags={noteTags}
              onChangeDateRange={setDateRange}
              onChangeSort={on_change_sort}
              onClear={handleClearFilters}
              onManageTags={() => setIsTagManagerOpen(true)}
              onTogglePinned={() => setPinnedOnly((currentValue) => !currentValue)}
              onToggleTag={handleToggleFilterTag}
              pinnedOnly={pinnedOnly}
              resultCount={filteredNotes.length}
              selectedTagIds={selectedTagIds}
              sortBy={note_sort}
            />

            {selectionMode && (
              <NoteBulkActions
                allVisibleSelected={allVisibleSelected}
                noteTags={noteTags}
                onArchive={handleBulkArchive}
                onCancel={() => {
                  setSelectionMode(false);
                  setSelectedNoteIds([]);
                }}
                onDelete={handleRequestBulkDelete}
                onSelectAll={handleToggleSelectAll}
                onTag={handleBulkTag}
                selectedCount={selectedNoteIds.length}
                showArchived={showArchived}
              />
            )}

            {filteredNotes.length > 0 ? (
              <ul className="note-list" aria-label={t('note_list_label')}>
                {filteredNotes.map((note) => (
                  <li
                    key={note.id}
                    className={[
                      'note-list-row',
                      activeNoteId === note.id ? 'note-list-row--active' : '',
                      selectionMode ? 'note-list-row--selecting' : '',
                      selectedNoteIds.includes(note.id) ? 'note-list-row--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {selectionMode && (
                      <label className="note-list-selection">
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.includes(note.id)}
                          onChange={() => handleToggleNoteSelection(note.id)}
                        />
                        <span className="visually-hidden">
                          {t('note_select_item', { title: getNoteTitle(note) })}
                        </span>
                      </label>
                    )}
                    <button
                      className="note-list-item"
                      type="button"
                      onClick={() =>
                        selectionMode ? handleToggleNoteSelection(note.id) : openNote(note.id)
                      }
                      aria-current={activeNoteId === note.id}
                    >
                      <span className="note-list-title">{getNoteTitle(note)}</span>
                    </button>
                    {!selectionMode && (
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
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="note-panel-empty">
                <p>{emptyMessage}</p>
                <button
                  className="modal-button modal-button--save"
                  type="button"
                  onClick={hasNoMatches ? handleClearSearchAndFilters : createNewNote}
                >
                  {hasNoMatches ? t('note_clear_search') : t('note_add')}
                </button>
              </div>
            )}
          </div>

          <div
            className={`note-workspace-editor-pane ${!isEditorView ? 'note-workspace-pane--compact-hidden' : ''}`}
          >
            {activeNote ? (
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
                <NoteTagPicker
                  activeNote={activeNote}
                  noteTags={noteTags}
                  onManageTags={() => setIsTagManagerOpen(true)}
                  onToggleTag={toggleNoteTag}
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
                  {saveStatus === 'conflict' && t('note_save_conflict')}
                </p>
                {saveStatus === 'error' && (
                  <button className="note-save-retry" type="button" onClick={retrySave}>
                    {t('note_save_retry')}
                  </button>
                )}
              </div>
            ) : (
              <div className="note-panel-empty note-panel-empty--editor">
                <p>{t('note_select_to_edit')}</p>
                <button
                  className="modal-button modal-button--save"
                  type="button"
                  onClick={createNewNote}
                >
                  {t('note_add')}
                </button>
              </div>
            )}
          </div>
        </div>

        <NoteTagManager
          isOpen={isTagManagerOpen && !conflictState}
          noteTags={noteTags}
          onAdd={addNoteTag}
          onClose={() => setIsTagManagerOpen(false)}
          onDelete={handleRemoveNoteTag}
          onEdit={editNoteTag}
        />

        {pendingDeleteNotes.length > 0 && (
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

        <NoteConflictDialog conflict={conflictState} onResolve={handleResolveConflict} />

        {undoState && (
          <div className="note-panel-toast" role="status" aria-live="polite">
            <span>
              {undoState.items.length > 1
                ? t('note_deleted_count', { count: undoState.items.length })
                : t('note_deleted')}
            </span>
            <button className="toast-action" type="button" onClick={handleRestoreDeletedNote}>
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
