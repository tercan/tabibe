import { useEffect, useRef, useState } from 'react';
import { NOTE_TAG_COLORS } from '../../domain/noteTagOperations.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import useFocusTrap from '../../hooks/useFocusTrap.jsx';
import CloseIcon from '../icons/CloseIcon.jsx';

function EditIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
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
    </svg>
  );
}

function NoteTagManager({ isOpen, noteTags, onAdd, onClose, onDelete, onEdit }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);
  const [name, setName] = useState('');
  const [colorToken, setColorToken] = useState('blue');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('blue');
  const [pendingDeleteTagId, setPendingDeleteTagId] = useState(null);
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
    setColorToken('blue');
    setEditingTagId(null);
    setPendingDeleteTagId(null);
    setErrorCode(null);
  }, [isOpen]);

  function getErrorMessage(code) {
    if (code === 'duplicate') return t('note_tag_error_duplicate');
    if (code === 'too_long') return t('note_tag_error_too_long');
    if (code === 'limit') return t('note_tag_error_limit');
    return t('note_tag_error_required');
  }

  function handleAdd(event) {
    event.preventDefault();
    const result = onAdd(name, colorToken);
    if (result.error) {
      setErrorCode(result.error);
      return;
    }
    setName('');
    setErrorCode(null);
    nameInputRef.current?.focus();
  }

  function startEditing(tag) {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.colorToken);
    setErrorCode(null);
  }

  function saveEditing(tagId) {
    const result = onEdit(tagId, { name: editingName, colorToken: editingColor });
    if (result.error) {
      setErrorCode(result.error);
      return;
    }
    setEditingTagId(null);
    setErrorCode(null);
  }

  if (!isOpen) return null;

  return (
    <div className="note-confirm-overlay note-tag-manager-overlay" role="presentation">
      <div
        className="note-tag-manager"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-tag-manager-title"
        tabIndex={-1}
      >
        <header className="note-tag-manager-header">
          <h3 className="note-tag-manager-title" id="note-tag-manager-title">
            {t('note_manage_tags')}
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

        <form className="note-tag-create-form" onSubmit={handleAdd}>
          <label className="note-tag-name-field">
            <span className="visually-hidden">{t('note_tag_name')}</span>
            <input
              ref={nameInputRef}
              className="note-panel-search"
              type="text"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('note_tag_name_placeholder')}
            />
          </label>
          <label className="note-tag-color-field">
            <span className="visually-hidden">{t('note_tag_color')}</span>
            <select value={colorToken} onChange={(event) => setColorToken(event.target.value)}>
              {NOTE_TAG_COLORS.map((color) => (
                <option value={color} key={color}>
                  {t(`note_tag_color_${color}`)}
                </option>
              ))}
            </select>
          </label>
          <button className="modal-button modal-button--primary" type="submit">
            {t('note_tag_add')}
          </button>
        </form>

        {errorCode && (
          <p className="note-tag-error" role="alert">
            {getErrorMessage(errorCode)}
          </p>
        )}

        {noteTags.length > 0 ? (
          <ul className="note-tag-manager-list">
            {noteTags.map((tag) => (
              <li className="note-tag-manager-row" key={tag.id}>
                {editingTagId === tag.id ? (
                  <>
                    <input
                      className="note-panel-search"
                      type="text"
                      value={editingName}
                      maxLength={40}
                      aria-label={t('note_tag_name')}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                    <select
                      value={editingColor}
                      aria-label={t('note_tag_color')}
                      onChange={(event) => setEditingColor(event.target.value)}
                    >
                      {NOTE_TAG_COLORS.map((color) => (
                        <option value={color} key={color}>
                          {t(`note_tag_color_${color}`)}
                        </option>
                      ))}
                    </select>
                    <button
                      className="note-tag-row-action"
                      type="button"
                      onClick={() => saveEditing(tag.id)}
                    >
                      {t('modal_save')}
                    </button>
                    <button
                      className="note-tag-row-action"
                      type="button"
                      onClick={() => setEditingTagId(null)}
                    >
                      {t('modal_cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`note-tag-dot note-tag-dot--${tag.colorToken}`} />
                    <span className="note-tag-manager-name">{tag.name}</span>
                    <button
                      className="note-panel-button"
                      type="button"
                      onClick={() => startEditing(tag)}
                      aria-label={t('note_tag_edit', { name: tag.name })}
                      title={t('note_tag_edit', { name: tag.name })}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="note-panel-button note-panel-button--danger"
                      type="button"
                      onClick={() => setPendingDeleteTagId(tag.id)}
                      aria-label={t('note_tag_delete', { name: tag.name })}
                      title={t('note_tag_delete', { name: tag.name })}
                    >
                      <DeleteIcon />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="note-tag-manager-empty">{t('note_tag_empty')}</p>
        )}

        {pendingDeleteTagId && (
          <div className="note-tag-delete-confirm" role="alertdialog">
            <p>{t('note_tag_delete_confirm')}</p>
            <div className="modal-actions">
              <button
                className="modal-button modal-button--cancel"
                type="button"
                onClick={() => setPendingDeleteTagId(null)}
              >
                {t('modal_cancel')}
              </button>
              <button
                className="modal-button modal-button--danger"
                type="button"
                onClick={() => {
                  onDelete(pendingDeleteTagId);
                  setPendingDeleteTagId(null);
                }}
              >
                {t('note_tag_delete_action')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteTagManager;
