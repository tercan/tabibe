import { useTranslation } from '../hooks/useTranslation.js';
import ContextMenu from './ContextMenu.jsx';
import FolderDeleteModal from './FolderDeleteModal.jsx';
import SiteModal from './SiteModal.jsx';

function SpeedDialOverlays({
  allSites,
  contextMenu,
  editingSite,
  faviconPermission,
  folderDeleteCandidate,
  folders,
  iconCatalog,
  iconStyle,
  modalFolderId,
  modalMode,
  modalOpen,
  onClearSaveError,
  onCloseContextMenu,
  onCloseFolderDelete,
  onCloseModal,
  onConfirmFolderDelete,
  onDelete,
  onEdit,
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
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          on_edit={() => onEdit(contextMenu.site)}
          on_delete={() => onDelete(contextMenu.site)}
          on_remove_from_folder={
            contextMenu.folderId ? () => onRemoveFromFolder(contextMenu.site) : null
          }
          on_close={onCloseContextMenu}
        />
      )}

      {modalOpen && (
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
      )}

      {folderDeleteCandidate && (
        <FolderDeleteModal
          folder={folderDeleteCandidate}
          onMoveContents={() => onConfirmFolderDelete('move')}
          onDeleteContents={() => onConfirmFolderDelete('delete')}
          onClose={onCloseFolderDelete}
        />
      )}
    </>
  );
}

export default SpeedDialOverlays;
