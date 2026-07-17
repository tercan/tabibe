import { useState, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import {
  ROOT_FOLDER_ID,
  cloneSites,
  deleteFolder,
  deleteSite,
  getAllSites,
  getCurrentFolderId,
  getFolders,
  moveSiteToRoot,
  renameFolder,
  upsertSite,
} from '../domain/speedDialOperations.js';
import useIconCatalog from '../hooks/useIconCatalog.js';
import useSpeedDialData from '../hooks/useSpeedDialData.js';
import useSpeedDialDrag from '../hooks/useSpeedDialDrag.js';
import { openSiteUrl } from '../lib/siteNavigation.js';
import Folder from './Folder.jsx';
import SiteIcon from './SiteIcon.jsx';
import SpeedDialOverlays from './SpeedDialOverlays.jsx';

/**
 * 1. Icon URL helpers
 */

function MoreIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
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

function FolderPlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * 3. SpeedDial component
 */

function SpeedDial({ icon_style, has_favicon_permission = false, on_request_favicon_permission }) {
  const { t } = useTranslation();
  const icon_catalog = useIconCatalog();
  const {
    clearSaveError: clear_save_error,
    isLoading: is_loading,
    loadError: load_error,
    persistSites: persist_sites,
    queueUndo: queue_undo,
    reportSaveError: report_save_error,
    retryLoad: retry_load,
    saveError: save_error,
    setSites: set_sites,
    sites,
    sitesRef: sites_ref,
    undo: handle_undo,
    undoState: undo_state,
  } = useSpeedDialData(t('toast_restored'));
  const [modal_open, set_modal_open] = useState(false);
  const [modal_mode, set_modal_mode] = useState('site');
  const [editing_site, set_editing_site] = useState(null);
  const [modal_folder_id, set_modal_folder_id] = useState(ROOT_FOLDER_ID);
  const [folder_delete_candidate, set_folder_delete_candidate] = useState(null);
  const [context_menu, set_context_menu] = useState(null);
  const [manage_mode, set_manage_mode] = useState(false);

  /**
   * 4. Navigation handlers
   */

  function handle_click(url) {
    if (is_click_blocked() || !url) return;

    try {
      openSiteUrl(url);
    } catch {
      report_save_error();
    }
  }

  function handle_key_down(event, site) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (manage_mode) {
        handle_edit(site);
        return;
      }
      handle_click(site.url);
    }
  }

  /**
   * 5. Icon helpers
   */

  function render_site_icon(site) {
    return (
      <SiteIcon
        site={site}
        catalog={icon_catalog}
        globalStyle={icon_style}
        hasFaviconPermission={has_favicon_permission}
      />
    );
  }

  /**
   * 6. Drag and drop handlers
   */

  const {
    animationParent: animation_parent,
    dragIndex: drag_index,
    dragOverFolderId: drag_over_folder_id,
    dragOverIndex: drag_over_index,
    folderChildDragOverIndex: folder_child_drag_over_index,
    folderChildDragState: folder_child_drag_state,
    handleDragEnd: handle_drag_end,
    handleDragEnter: handle_drag_enter,
    handleDragLeave: handle_drag_leave,
    handleDragOver: handle_drag_over,
    handleDragStart: handle_drag_start,
    handleDrop: handle_drop,
    handleDropOnItem: handle_drop_on_item,
    handleFolderChildDragEnd: handle_folder_child_drag_end,
    handleFolderChildDragEnter: handle_folder_child_drag_enter,
    handleFolderChildDragLeave: handle_folder_child_drag_leave,
    handleFolderChildDragOver: handle_folder_child_drag_over,
    handleFolderChildDragStart: handle_folder_child_drag_start,
    handleFolderChildDrop: handle_folder_child_drop,
    handleFolderChildDropToRoot: handle_folder_child_drop_to_root,
    isClickBlocked: is_click_blocked,
  } = useSpeedDialDrag({
    sites,
    setSites: set_sites,
    sitesRef: sites_ref,
    persistSites: persist_sites,
    queueUndo: queue_undo,
    messages: {
      siteMovedToFolder: t('toast_site_moved_folder'),
      siteMovedToRoot: t('toast_site_removed_from_folder'),
    },
  });

  /**
   * 8. Context menu and modal handlers
   */

  function open_context_menu(event, site, folder_id = null) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();

    set_context_menu({
      x: event.clientX || rect.right,
      y: event.clientY || rect.bottom,
      site,
      folderId: folder_id,
    });
  }

  function handle_action_click(event, site, folder_id = null) {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();

    set_context_menu({
      x: rect.right,
      y: rect.bottom,
      site,
      folderId: folder_id,
    });
  }

  function handle_add_click(folder_id = ROOT_FOLDER_ID) {
    set_editing_site(null);
    set_modal_folder_id(folder_id);
    set_modal_mode('site');
    set_modal_open(true);
  }

  function handle_add_folder_click() {
    set_editing_site(null);
    set_modal_folder_id(ROOT_FOLDER_ID);
    set_modal_mode('folder');
    set_modal_open(true);
  }

  function handle_edit(site) {
    set_editing_site(site);
    set_modal_folder_id(getCurrentFolderId(sites, site));
    set_modal_mode(site.type === 'folder' ? 'folder' : 'site');
    set_modal_open(true);
  }

  const handle_close_modal = useCallback(() => {
    set_modal_open(false);
    set_editing_site(null);
    set_modal_folder_id(ROOT_FOLDER_ID);
  }, []);

  async function handle_save(data, target_folder_id = ROOT_FOLDER_ID) {
    if (modal_mode === 'folder') {
      const sites_list = cloneSites(sites_ref.current);

      if (editing_site) {
        const folder_id = data.id || editing_site?.id;
        const next_sites = renameFolder(sites_list, folder_id, data.name);

        if (!next_sites) {
          return false;
        }

        if (!(await persist_sites(next_sites))) return false;
      } else {
        sites_list.push({
          type: 'folder',
          id: crypto.randomUUID(),
          name: data.name,
          children: [],
        });
        if (!(await persist_sites(sites_list))) return false;
      }
    } else {
      const sites_list = cloneSites(sites_ref.current);
      const site_data = {
        ...(editing_site || {}),
        ...data,
        id: editing_site?.id || data.id || crypto.randomUUID(),
      };
      const next_sites = upsertSite(sites_list, site_data, target_folder_id);
      if (!(await persist_sites(next_sites))) return false;
    }

    handle_close_modal();
    return true;
  }

  async function handle_delete(item) {
    if (item.type === 'folder') {
      set_folder_delete_candidate(item);
      return;
    }

    const previous_sites = cloneSites(sites_ref.current);
    const sites_list = deleteSite(previous_sites, item.id);
    if (!sites_list) return;

    const was_saved = await persist_sites(sites_list, previous_sites);
    if (was_saved) queue_undo(t('toast_site_deleted'), previous_sites);
  }

  async function handle_confirm_folder_delete(mode) {
    if (!folder_delete_candidate) return;

    const previous_sites = cloneSites(sites_ref.current);
    const sites_list = deleteFolder(previous_sites, folder_delete_candidate.id, mode);

    if (!sites_list) {
      set_folder_delete_candidate(null);
      return;
    }

    if (mode === 'move') {
      if (!(await persist_sites(sites_list, previous_sites))) return;
      set_folder_delete_candidate(null);
      queue_undo(t('toast_folder_deleted'), previous_sites);
      return;
    }

    if (!(await persist_sites(sites_list, previous_sites))) return;
    set_folder_delete_candidate(null);
    queue_undo(t('toast_folder_deleted_with_contents'), previous_sites);
  }

  async function handle_remove_from_folder(site) {
    const previous_sites = cloneSites(sites_ref.current);
    const sites_list = moveSiteToRoot(previous_sites, site.id);
    if (!sites_list) return;
    const was_saved = await persist_sites(sites_list, previous_sites);
    if (was_saved) queue_undo(t('toast_site_removed_from_folder'), previous_sites);
  }

  if (is_loading) {
    return (
      <nav
        className="speed-dial speed-dial--loading"
        aria-busy="true"
        aria-label={t('speed_dial_aria_label')}
      />
    );
  }

  if (load_error) {
    return (
      <nav className="speed-dial speed-dial--error" aria-label={t('speed_dial_aria_label')}>
        <p>{t('speed_dial_load_error')}</p>
        <button type="button" className="modal-button modal-button--primary" onClick={retry_load}>
          {t('common_retry')}
        </button>
      </nav>
    );
  }

  const folders = getFolders(sites);
  const all_sites = getAllSites(sites);
  const is_dragging_any = drag_index !== null || folder_child_drag_state !== null;
  const root_drop_preview_site = folder_child_drag_state
    ? sites.find((item) => item.id === folder_child_drag_state.folderId)?.children?.[
        folder_child_drag_state.index
      ] || null
    : null;

  return (
    <nav
      className={`speed-dial${manage_mode ? ' speed-dial--manage' : ''}${is_dragging_any ? ' speed-dial--dragging' : ''}`}
      aria-label={t('speed_dial_aria_label')}
    >
      <div className="speed-dial-toolbar" role="toolbar" aria-label={t('speed_dial_toolbar_label')}>
        <div className="speed-dial-toolbar-actions">
          <button
            className="speed-dial-toolbar-button"
            type="button"
            onClick={() => handle_add_click()}
            aria-label={t('speed_dial_add')}
            title={t('speed_dial_add')}
          >
            <PlusIcon />
          </button>
          <button
            className="speed-dial-toolbar-button"
            type="button"
            onClick={handle_add_folder_click}
            aria-label={t('speed_dial_add_folder')}
            title={t('speed_dial_add_folder')}
          >
            <FolderPlusIcon />
          </button>
        </div>
        <button
          className={`speed-dial-toolbar-button${manage_mode ? ' speed-dial-toolbar-button--active' : ''}`}
          type="button"
          onClick={() => set_manage_mode((prev) => !prev)}
          aria-label={manage_mode ? t('speed_dial_done') : t('speed_dial_manage')}
          aria-pressed={manage_mode}
          title={manage_mode ? t('speed_dial_done') : t('speed_dial_manage')}
        >
          {manage_mode ? <CheckIcon /> : <EditIcon />}
        </button>
      </div>
      {/* /.speed-dial-toolbar */}

      <ul className="speed-dial-grid" ref={animation_parent}>
        {sites.map((item, index) => {
          if (item.type === 'folder') {
            return (
              <Folder
                key={item.id}
                folder={item}
                render_icon={render_site_icon}
                on_click={handle_click}
                on_context_menu={open_context_menu}
                on_action_menu={handle_action_click}
                on_add_site={() => handle_add_click(item.id)}
                on_edit_folder={() => handle_edit(item)}
                on_delete_folder={() => handle_delete(item)}
                is_manage_mode={manage_mode}
                is_modal_blocked={modal_open || !!folder_delete_candidate}
                is_drag_over={drag_over_folder_id === item.id || drag_over_index === index}
                is_folder_drop_target={drag_over_folder_id === item.id}
                is_dragging={drag_index === index}
                folder_child_drag_state={folder_child_drag_state}
                folder_child_drag_over_index={folder_child_drag_over_index}
                on_drag_start={(e) => handle_drag_start(e, index)}
                on_drag_enter={handle_drag_enter}
                on_drag_over={(e) => handle_drag_over(e, index)}
                on_drag_leave={handle_drag_leave}
                on_drop={(event) => handle_drop_on_item(event, item, index)}
                on_drag_end={handle_drag_end}
                on_child_drag_start={handle_folder_child_drag_start}
                on_child_drag_enter={handle_folder_child_drag_enter}
                on_child_drag_over={handle_folder_child_drag_over}
                on_child_drag_leave={handle_folder_child_drag_leave}
                on_child_drop={handle_folder_child_drop}
                on_child_drop_to_root={handle_folder_child_drop_to_root}
                on_child_drag_end={handle_folder_child_drag_end}
              />
            );
          }

          return (
            <li
              key={item.id}
              draggable="true"
              onDragStart={(e) => handle_drag_start(e, index)}
              onDragEnter={handle_drag_enter}
              onDragOver={(e) => handle_drag_over(e, index)}
              onDragLeave={handle_drag_leave}
              onDrop={handle_drop}
              onDragEnd={handle_drag_end}
              className={`${drag_index === index ? 'speed-dial-item--dragging' : ''} ${drag_over_index === index ? 'speed-dial-drop-target' : ''}`.trim()}
            >
              <div className="speed-dial-card">
                <div
                  className="speed-dial-item"
                  role="link"
                  tabIndex={0}
                  onClick={() => (manage_mode ? handle_edit(item) : handle_click(item.url))}
                  onKeyDown={(e) => handle_key_down(e, item)}
                  onContextMenu={(e) => open_context_menu(e, item)}
                  aria-label={`${item.name} - ${item.url}`}
                >
                  <div className="speed-dial-icon-wrapper">{render_site_icon(item)}</div>
                  <span className="speed-dial-label">{item.name}</span>
                </div>
                {/* /.speed-dial-item */}
                <button
                  className="speed-dial-action-button"
                  type="button"
                  onClick={(e) => handle_action_click(e, item)}
                  aria-label={`${item.name} ${t('speed_dial_actions')}`}
                  title={t('speed_dial_actions')}
                >
                  <MoreIcon />
                </button>
              </div>
              {/* /.speed-dial-card */}
            </li>
          );
        })}
        {root_drop_preview_site && (
          <li className="speed-dial-root-drop-preview" aria-hidden="true">
            <div className="speed-dial-card">
              <div className="speed-dial-item">
                <div className="speed-dial-icon-wrapper">
                  {render_site_icon(root_drop_preview_site)}
                </div>
                <span className="speed-dial-label">{root_drop_preview_site.name}</span>
              </div>
            </div>
          </li>
        )}
      </ul>
      {/* /.speed-dial-grid */}

      <SpeedDialOverlays
        allSites={all_sites}
        contextMenu={context_menu}
        editingSite={editing_site}
        faviconPermission={has_favicon_permission}
        folderDeleteCandidate={folder_delete_candidate}
        folders={folders}
        iconCatalog={icon_catalog}
        iconStyle={icon_style}
        modalFolderId={modal_folder_id}
        modalMode={modal_mode}
        modalOpen={modal_open}
        onClearSaveError={clear_save_error}
        onCloseContextMenu={() => set_context_menu(null)}
        onCloseFolderDelete={() => set_folder_delete_candidate(null)}
        onCloseModal={handle_close_modal}
        onConfirmFolderDelete={handle_confirm_folder_delete}
        onDelete={handle_delete}
        onEdit={handle_edit}
        onRemoveFromFolder={handle_remove_from_folder}
        onRequestFaviconPermission={on_request_favicon_permission}
        onSave={handle_save}
        onUndo={handle_undo}
        saveError={save_error}
        undoState={undo_state}
      />
      {/* /.speed-dial */}
    </nav>
  );
}

export default SpeedDial;
