import { lazy, Suspense } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';

const ContextMenu = lazy(() => import('./ContextMenu.jsx'));
const FolderDeleteModal = lazy(() => import('./FolderDeleteModal.jsx'));
const SiteModal = lazy(() => import('./SiteModal.jsx'));

function OverlayLoading({ message }) {
  return (
    <div className="modal-overlay" aria-busy="true">
      <div className="modal-dialog modal-dialog--loading" role="status">
        {message}
      </div>
    </div>
  );
}

function SpeedDialOverlays({
  allSites,
  contextMenu,
  contextPosition,
  editingSite,
  faviconPermission,
  folderDeleteCandidate,
  folders,
  iconCatalog,
  iconStyle,
  modalFolderId,
  modalMode,
  modalOpen,
  moveLeftDelta,
  moveRightDelta,
  onClearSaveError,
  onCloseContextMenu,
  onCloseFolderDelete,
  onCloseModal,
  onConfirmFolderDelete,
  onDelete,
  onEdit,
  onMoveLeft,
  onMoveRight,
  onMoveToFolder,
  onRemoveFromFolder,
  onRequestFaviconPermission,
  onSave,
  onUndo,
  saveError,
  undoState,
}) {
  const { t } = useTranslation();

  return (
    <>
      {undoState && (
        <div className="toast" role="status" aria-live="polite">
          <span>{undoState.message}</span>
          {undoState.previousSites && (
            <button className="toast-action" type="button" onClick={onUndo}>
              {t('toast_undo')}
            </button>
          )}
        </div>
      )}

      {saveError && (
        <div className="toast toast--error" role="alert">
          <span>{t('speed_dial_save_error')}</span>
          <button className="toast-action" type="button" onClick={onClearSaveError}>
            {t('modal_cancel')}
          </button>
        </div>
      )}

      {contextMenu && (
        <Suspense fallback={null}>
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            can_move_left={
              contextPosition.index >= 0 &&
              contextPosition.index + moveLeftDelta >= 0 &&
              contextPosition.index + moveLeftDelta < contextPosition.total
            }
            can_move_right={
              contextPosition.index >= 0 &&
              contextPosition.index + moveRightDelta >= 0 &&
              contextPosition.index + moveRightDelta < contextPosition.total
            }
            move_folders={
              !contextMenu.folderId && contextMenu.site.type !== 'folder' ? folders : []
            }
            on_edit={() => onEdit(contextMenu.site)}
            on_delete={() => onDelete(contextMenu.site)}
            on_move_left={onMoveLeft}
            on_move_right={onMoveRight}
            on_move_to_folder={
              !contextMenu.folderId && contextMenu.site.type !== 'folder' ? onMoveToFolder : null
            }
            on_remove_from_folder={
              contextMenu.folderId ? () => onRemoveFromFolder(contextMenu.site) : null
            }
            on_close={onCloseContextMenu}
          />
        </Suspense>
      )}

      {modalOpen && (
        <Suspense fallback={<OverlayLoading message={t('app_loading')} />}>
          <SiteModal
            key={`${modalMode}-${editingSite?.id || 'new'}-${modalFolderId}`}
            site={editingSite}
            mode={modalMode}
            folders={folders}
            current_folder_id={modalFolderId}
            existing_sites={allSites}
            icon_catalog={iconCatalog}
            icon_style={iconStyle}
            has_favicon_permission={faviconPermission}
            on_request_favicon_permission={onRequestFaviconPermission}
            on_save={onSave}
            on_close={onCloseModal}
          />
        </Suspense>
      )}

      {folderDeleteCandidate && (
        <Suspense fallback={<OverlayLoading message={t('app_loading')} />}>
          <FolderDeleteModal
            folder={folderDeleteCandidate}
            onMoveContents={() => onConfirmFolderDelete('move')}
            onDeleteContents={() => onConfirmFolderDelete('delete')}
            onClose={onCloseFolderDelete}
          />
        </Suspense>
      )}
    </>
  );
}

export default SpeedDialOverlays;
