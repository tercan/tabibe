import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';
import useFocusTrap from '../../hooks/useFocusTrap.jsx';
import CloseIcon from '../icons/CloseIcon.jsx';

function NoteNotebookManager({
  isOpen,
  noteNotebooks,
  notes,
  onAdd,
  onClose,
  onDelete,
  onEdit,
  onMove,
}) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);
  const [name, setName] = useState('');
  const [editingNotebookId, setEditingNotebookId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [pendingDeleteNotebookId, setPendingDeleteNotebookId] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  useFocusTrap({
    containerRef: dialogRef,
    isActive: isOpen,
    initialFocusRef: nameInputRef,
    onEscape: onClose,
  });

  useEffect(() => {
    if (isOpen) return;
    setName('');
    setEditingNotebookId(null);
    setPendingDeleteNotebookId(null);
    setErrorCode(null);
  }, [isOpen]);

  function getErrorMessage(code) {
    if (code === 'duplicate') return t('note_notebook_error_duplicate');
    if (code === 'too_long') return t('note_notebook_error_too_long');
    if (code === 'limit') return t('note_notebook_error_limit');
    return t('note_notebook_error_required');
  }

  function handleAdd(event) {
    event.preventDefault();
    const result = onAdd(name);
    if (result.error) {
      setErrorCode(result.error);
      return;
    }
    setName('');
    setErrorCode(null);
    nameInputRef.current?.focus();
  }

  function startEditing(notebook) {
    setEditingNotebookId(notebook.id);
    setEditingName(notebook.name);
    setErrorCode(null);
  }

  function saveEditing(notebookId) {
    const result = onEdit(notebookId, editingName);
    if (result.error) {
      setErrorCode(result.error);
      return;
    }
    setEditingNotebookId(null);
    setErrorCode(null);
  }

  if (!isOpen) return null;

  const pendingDeleteNotebook = noteNotebooks.find(
    (notebook) => notebook.id === pendingDeleteNotebookId,
  );
  const pendingDeleteNoteCount = pendingDeleteNotebook
    ? notes.filter((note) => note.notebookId === pendingDeleteNotebook.id).length
    : 0;

  return (
    <div className="note-confirm-overlay note-notebook-manager-overlay" role="presentation">
      <div
        className="note-notebook-manager"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-notebook-manager-title"
        tabIndex={-1}
      >
        <header className="note-tag-manager-header">
          <h3 className="note-tag-manager-title" id="note-notebook-manager-title">
            {t('note_manage_notebooks')}
          </h3>
          <button
            className="note-panel-button"
            type="button"
            onClick={onClose}
            aria-label={t('modal_cancel')}
          >
            <CloseIcon />
          </button>
        </header>

        <form className="note-notebook-create-form" onSubmit={handleAdd}>
          <label className="note-tag-name-field">
            <span className="visually-hidden">{t('note_notebook_name')}</span>
            <input
              ref={nameInputRef}
              className="note-panel-search"
              type="text"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('note_notebook_name_placeholder')}
            />
          </label>
          <button className="modal-button modal-button--primary" type="submit">
            {t('note_notebook_add')}
          </button>
        </form>

        {errorCode && (
          <p className="note-tag-error" role="alert">
            {getErrorMessage(errorCode)}
          </p>
        )}

        {noteNotebooks.length > 0 ? (
          <ul className="note-notebook-manager-list">
            {noteNotebooks.map((notebook, index) => (
              <li className="note-notebook-manager-row" key={notebook.id}>
                {editingNotebookId === notebook.id ? (
                  <>
                    <input
                      className="note-panel-search"
                      type="text"
                      value={editingName}
                      maxLength={40}
                      aria-label={t('note_notebook_name')}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                    <button
                      className="note-tag-row-action"
                      type="button"
                      onClick={() => saveEditing(notebook.id)}
                    >
                      {t('modal_save')}
                    </button>
                    <button
                      className="note-tag-row-action"
                      type="button"
                      onClick={() => setEditingNotebookId(null)}
                    >
                      {t('modal_cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="note-notebook-manager-name">{notebook.name}</span>
                    <button
                      className="note-panel-button"
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMove(notebook.id, -1)}
                      aria-label={t('note_notebook_move_up', { name: notebook.name })}
                      title={t('note_notebook_move_up', { name: notebook.name })}
                    >
                      <ArrowUp aria-hidden="true" />
                    </button>
                    <button
                      className="note-panel-button"
                      type="button"
                      disabled={index === noteNotebooks.length - 1}
                      onClick={() => onMove(notebook.id, 1)}
                      aria-label={t('note_notebook_move_down', { name: notebook.name })}
                      title={t('note_notebook_move_down', { name: notebook.name })}
                    >
                      <ArrowDown aria-hidden="true" />
                    </button>
                    <button
                      className="note-panel-button"
                      type="button"
                      onClick={() => startEditing(notebook)}
                      aria-label={t('note_notebook_edit', { name: notebook.name })}
                      title={t('note_notebook_edit', { name: notebook.name })}
                    >
                      <Pencil aria-hidden="true" />
                    </button>
                    <button
                      className="note-panel-button note-panel-button--danger"
                      type="button"
                      onClick={() => setPendingDeleteNotebookId(notebook.id)}
                      aria-label={t('note_notebook_delete', { name: notebook.name })}
                      title={t('note_notebook_delete', { name: notebook.name })}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="note-tag-manager-empty">{t('note_notebook_empty')}</p>
        )}

        {pendingDeleteNotebook && (
          <div className="note-tag-delete-confirm" role="alertdialog">
            <p>
              {t('note_notebook_delete_confirm', {
                count: pendingDeleteNoteCount,
                name: pendingDeleteNotebook.name,
              })}
            </p>
            <div className="modal-actions">
              <button
                className="modal-button modal-button--cancel"
                type="button"
                onClick={() => setPendingDeleteNotebookId(null)}
              >
                {t('modal_cancel')}
              </button>
              <button
                className="modal-button modal-button--danger"
                type="button"
                onClick={() => {
                  onDelete(pendingDeleteNotebook.id);
                  setPendingDeleteNotebookId(null);
                }}
              >
                {t('note_notebook_delete_action')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteNotebookManager;
