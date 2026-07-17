import { useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';
import useFocusTrap from '../../hooks/useFocusTrap.jsx';

function NoteConflictDialog({ conflict, onResolve }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const externalButtonRef = useRef(null);

  useFocusTrap({
    containerRef: dialogRef,
    isActive: Boolean(conflict),
    initialFocusRef: externalButtonRef,
  });

  if (!conflict) return null;

  return (
    <div className="note-confirm-overlay" role="presentation">
      <div
        className="note-confirm-dialog note-conflict-dialog"
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="note-conflict-title"
        aria-describedby="note-conflict-description"
        tabIndex={-1}
      >
        <h3 className="note-confirm-title" id="note-conflict-title">
          {t('note_conflict_title')}
        </h3>
        <p className="note-confirm-description" id="note-conflict-description">
          {t('note_conflict_description')}
        </p>
        <div className="note-conflict-actions">
          <button
            className="modal-button modal-button--cancel"
            type="button"
            ref={externalButtonRef}
            onClick={() => onResolve('external')}
          >
            {t('note_conflict_use_external')}
          </button>
          <button
            className="modal-button modal-button--cancel"
            type="button"
            onClick={() => onResolve('duplicate')}
          >
            {t('note_conflict_duplicate')}
          </button>
          <button
            className="modal-button modal-button--primary"
            type="button"
            onClick={() => onResolve('local')}
          >
            {t('note_conflict_keep_local')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteConflictDialog;
