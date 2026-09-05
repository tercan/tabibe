import { useRef, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  Archive,
  BookOpen,
  FolderOpen,
  GripVertical,
  Library,
  Plus,
  Settings2,
  Tags,
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';
import speedDialMoveAnimation from '../../lib/speedDialMotion.js';

function closeParentMenu(event) {
  event.currentTarget.closest('details')?.removeAttribute('open');
}

function NoteNotebookItems({
  activeNoteCount,
  archivedNoteCount,
  isReorderable,
  noteNotebooks,
  noteTags,
  notebookListRef,
  notes,
  onManageNotebooks,
  onManageTags,
  onReorderNotebooks,
  onSelectAll,
  onSelectArchive,
  onSelectNotebook,
  onSelectTag,
  selectedNotebookId,
  selectedTagIds,
  showArchived,
  shouldCloseMenu = false,
}) {
  const { t } = useTranslation();
  const [draggedNotebookId, setDraggedNotebookId] = useState(null);
  const [dragOverNotebookId, setDragOverNotebookId] = useState(null);
  const blockSelectionRef = useRef(false);
  const draggedNotebookIdRef = useRef(null);
  const dragOverNotebookIdRef = useRef(null);

  function handleSelection(event, callback) {
    if (blockSelectionRef.current) {
      event.preventDefault();
      return;
    }
    callback();
    if (shouldCloseMenu) closeParentMenu(event);
  }

  function handleDragStart(event, notebookId) {
    if (!isReorderable) return;
    blockSelectionRef.current = true;
    draggedNotebookIdRef.current = notebookId;
    setDraggedNotebookId(notebookId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', notebookId);
  }

  function handleDragOver(event, targetId) {
    const sourceId = draggedNotebookIdRef.current || event.dataTransfer.getData('text/plain');
    if (!isReorderable || !sourceId || sourceId === targetId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragOverNotebookIdRef.current === targetId) return;
    dragOverNotebookIdRef.current = targetId;
    setDragOverNotebookId(targetId);
    onReorderNotebooks(sourceId, targetId);
  }

  function handleDrop(event, targetId) {
    event.preventDefault();
    const sourceId = draggedNotebookIdRef.current || event.dataTransfer.getData('text/plain');
    if (
      isReorderable &&
      sourceId &&
      sourceId !== targetId &&
      dragOverNotebookIdRef.current !== targetId
    ) {
      onReorderNotebooks(sourceId, targetId);
    }
  }

  function handleDragEnd() {
    draggedNotebookIdRef.current = null;
    dragOverNotebookIdRef.current = null;
    setDraggedNotebookId(null);
    setDragOverNotebookId(null);
    window.setTimeout(() => {
      blockSelectionRef.current = false;
    }, 0);
  }

  return (
    <ul className="note-notebook-tree">
      <li className="note-notebook-tree-item">
        <button
          className={`note-notebook-button ${!showArchived && selectedNotebookId === null && selectedTagIds.length === 0 ? 'note-notebook-button--active' : ''}`}
          type="button"
          aria-pressed={!showArchived && selectedNotebookId === null && selectedTagIds.length === 0}
          aria-label={t('note_all_notes')}
          onClick={(event) => handleSelection(event, onSelectAll)}
        >
          <BookOpen aria-hidden="true" />
          <span className="note-notebook-label">{t('note_all_notes')}</span>
          <span className="note-workspace-count" aria-hidden="true">
            {activeNoteCount}
          </span>
        </button>
      </li>

      <li className="note-notebook-tree-item note-notebook-tree-branch">
        <div className="note-notebook-branch-label">
          <FolderOpen aria-hidden="true" />
          <span>{t('note_notebooks_section')}</span>
          <button
            className="note-notebook-branch-action"
            type="button"
            onClick={(event) => handleSelection(event, onManageNotebooks)}
            aria-label={t('note_notebook_add')}
            title={t('note_notebook_add')}
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
        {noteNotebooks.length > 0 ? (
          <ul
            className="note-notebook-tree note-notebook-tree--nested note-notebook-tree--notebooks"
            ref={notebookListRef}
          >
            {noteNotebooks.map((notebook) => {
              const isActive = !showArchived && selectedNotebookId === notebook.id;
              const noteCount = notes.filter(
                (note) => !note.isArchived && note.notebookId === notebook.id,
              ).length;

              return (
                <li
                  className={`note-notebook-tree-item note-notebook-draggable ${draggedNotebookId === notebook.id ? 'note-notebook-draggable--active' : ''} ${dragOverNotebookId === notebook.id ? 'note-notebook-draggable--over' : ''}`}
                  data-notebook-id={notebook.id}
                  draggable={isReorderable}
                  key={notebook.id}
                  onDragStart={(event) => handleDragStart(event, notebook.id)}
                  onDragOver={(event) => handleDragOver(event, notebook.id)}
                  onDrop={(event) => handleDrop(event, notebook.id)}
                  onDragEnd={handleDragEnd}
                >
                  <button
                    className={`note-notebook-button ${isActive ? 'note-notebook-button--active' : ''}`}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={notebook.name}
                    onClick={(event) => handleSelection(event, () => onSelectNotebook(notebook.id))}
                  >
                    {isReorderable ? (
                      <GripVertical className="note-notebook-drag-handle" aria-hidden="true" />
                    ) : (
                      <BookOpen aria-hidden="true" />
                    )}
                    <span className="note-notebook-label">{notebook.name}</span>
                    <span className="note-workspace-count" aria-hidden="true">
                      {noteCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="note-notebook-empty">{t('note_notebook_empty')}</p>
        )}
        <button
          className="note-notebook-manage"
          type="button"
          onClick={(event) => handleSelection(event, onManageNotebooks)}
        >
          <Settings2 aria-hidden="true" />
          <span>{t('note_manage_notebooks')}</span>
        </button>
      </li>

      <li className="note-notebook-tree-item note-notebook-tree-branch">
        <div className="note-notebook-branch-label">
          <Tags aria-hidden="true" />
          <span>{t('note_filter_tags')}</span>
        </div>
        {noteTags.length > 0 ? (
          <ul className="note-notebook-tree note-notebook-tree--nested">
            {noteTags.map((tag) => {
              const isActive = !showArchived && selectedTagIds.includes(tag.id);
              const noteCount = notes.filter(
                (note) => !note.isArchived && note.tagIds.includes(tag.id),
              ).length;

              return (
                <li className="note-notebook-tree-item" key={tag.id}>
                  <button
                    className={`note-notebook-button ${isActive ? 'note-notebook-button--active' : ''}`}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={tag.name}
                    onClick={(event) => handleSelection(event, () => onSelectTag(tag.id))}
                  >
                    <span className={`note-tag-dot note-tag-dot--${tag.colorToken}`} />
                    <span className="note-notebook-label">{tag.name}</span>
                    <span className="note-workspace-count" aria-hidden="true">
                      {noteCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="note-notebook-empty">{t('note_tag_empty')}</p>
        )}
        <button
          className="note-notebook-manage"
          type="button"
          onClick={(event) => handleSelection(event, onManageTags)}
        >
          <Settings2 aria-hidden="true" />
          <span>{t('note_manage_tags')}</span>
        </button>
      </li>

      <li className="note-notebook-tree-item note-notebook-tree-archive">
        <button
          className={`note-notebook-button ${showArchived ? 'note-notebook-button--active' : ''}`}
          type="button"
          aria-pressed={showArchived}
          aria-label={t('note_filter_archived')}
          onClick={(event) => handleSelection(event, onSelectArchive)}
        >
          <Archive aria-hidden="true" />
          <span className="note-notebook-label">{t('note_filter_archived')}</span>
          <span className="note-workspace-count" aria-hidden="true">
            {archivedNoteCount}
          </span>
        </button>
      </li>
    </ul>
  );
}

function NoteNotebooks({ compact = false, ...props }) {
  const { t } = useTranslation();
  const [notebookListRef] = useAutoAnimate(speedDialMoveAnimation);
  const selectedNotebook = props.noteNotebooks.find(
    (notebook) => notebook.id === props.selectedNotebookId,
  );
  const selectedTag = props.noteTags.find((tag) => props.selectedTagIds.includes(tag.id));
  const selectedLabel = props.showArchived
    ? t('note_filter_archived')
    : selectedNotebook?.name || selectedTag?.name || t('note_all_notes');

  if (compact) {
    return (
      <details className="note-filter-menu note-notebook-compact">
        <summary
          className="note-filter-icon-button"
          aria-label={t('note_notebooks_open')}
          title={t('note_notebooks_open')}
        >
          <Library aria-hidden="true" />
          <span className="visually-hidden">{selectedLabel}</span>
        </summary>
        <div className="note-filter-menu-content note-notebook-menu-content">
          <h4 className="note-notebook-menu-title">{t('note_notebooks_title')}</h4>
          <NoteNotebookItems
            {...props}
            isReorderable={false}
            notebookListRef={notebookListRef}
            shouldCloseMenu
          />
        </div>
      </details>
    );
  }

  return (
    <nav className="note-workspace-navigation" aria-labelledby="note-notebooks-title">
      <h3 className="note-workspace-navigation-title" id="note-notebooks-title">
        {t('note_notebooks_title')}
      </h3>
      <NoteNotebookItems {...props} isReorderable notebookListRef={notebookListRef} />
    </nav>
  );
}

export default NoteNotebooks;
