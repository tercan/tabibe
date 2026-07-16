import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../hooks/useTranslation.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';

/**
 * 1. Folder delete decision modal
 */

function FolderDeleteModal({ folder, onMoveContents, onDeleteContents, onClose }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const primaryActionRef = useRef(null);
  const children = Array.isArray(folder?.children) ? folder.children : [];
  const childCount = children.length;
  const descriptionKey =
    childCount > 0 ? 'folder_delete_modal_description' : 'folder_delete_modal_empty_description';

  useFocusTrap({
    containerRef: dialogRef,
    isActive: true,
    initialFocusRef: primaryActionRef,
    onEscape: onClose,
  });

  useEffect(() => {
    const hadNoScroll = document.body.classList.contains('no-scroll');
    document.body.classList.add('no-scroll');

    return () => {
      if (!hadNoScroll) {
        document.body.classList.remove('no-scroll');
      }
    };
  }, []);

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-dialog modal-dialog--decision"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-delete-title"
        aria-describedby="folder-delete-description"
        tabIndex={-1}
      >
        <h2 className="modal-title" id="folder-delete-title">
          {t('folder_delete_modal_title')}
        </h2>
        <p className="modal-description" id="folder-delete-description">
          {t(descriptionKey, {
            name: folder?.name || t('folder_delete_modal_unnamed_folder'),
            count: childCount,
          })}
        </p>

        {childCount > 0 ? (
          <div className="modal-decision-list">
            <button
              className="modal-decision-option"
              type="button"
              ref={primaryActionRef}
              onClick={onMoveContents}
            >
              <span className="modal-decision-title">{t('folder_delete_modal_move_title')}</span>
              <span className="modal-decision-description">
                {t('folder_delete_modal_move_description')}
              </span>
            </button>
            <button
              className="modal-decision-option modal-decision-option--danger"
              type="button"
              onClick={onDeleteContents}
            >
              <span className="modal-decision-title">{t('folder_delete_modal_delete_title')}</span>
              <span className="modal-decision-description">
                {t('folder_delete_modal_delete_description')}
              </span>
            </button>
          </div>
        ) : (
          <p className="modal-warning">{t('folder_delete_modal_empty_notice')}</p>
        )}

        <div className="modal-actions">
          <button type="button" className="modal-button modal-button--cancel" onClick={onClose}>
            {t('modal_cancel')}
          </button>
          {childCount === 0 && (
            <button
              type="button"
              className="modal-button modal-button--danger"
              ref={primaryActionRef}
              onClick={onDeleteContents}
            >
              {t('folder_delete_modal_empty_action')}
            </button>
          )}
        </div>
      </div>
      {/* /.modal-dialog--decision */}
    </div>,
    document.body,
  );
}

export default FolderDeleteModal;
