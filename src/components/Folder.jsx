import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import speedDialMoveAnimation from '../lib/speedDialMotion.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import CloseIcon from './icons/CloseIcon.jsx';

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

/**
 * 1. Folder component - opens a modal with speed dial items.
 */

function Folder({
  folder,
  render_icon,
  on_click,
  on_context_menu,
  on_action_menu,
  on_add_site,
  on_edit_folder,
  on_delete_folder,
  is_manage_mode,
  is_modal_blocked,
  is_drag_over,
  is_folder_drop_target,
  is_dragging,
  folder_child_drag_state,
  folder_child_drag_over_index,
  on_drag_start,
  on_drag_enter,
  on_drag_over,
  on_drag_leave,
  on_drop,
  on_drag_end,
  on_child_drag_start,
  on_child_drag_enter,
  on_child_drag_over,
  on_child_drag_leave,
  on_child_drop,
  on_child_drop_to_root,
  on_child_drag_end,
}) {
  const { t } = useTranslation();
  const [is_open, set_is_open] = useState(false);
  const modal_ref = useRef(null);
  const close_button_ref = useRef(null);
  const [folder_animation_parent] = useAutoAnimate(speedDialMoveAnimation);

  useFocusTrap({
    containerRef: modal_ref,
    isActive: is_open && !is_modal_blocked,
    initialFocusRef: close_button_ref,
    onEscape: () => set_is_open(false),
  });

  useEffect(() => {
    if (is_open) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [is_open]);

  function toggle_folder(event) {
    event.stopPropagation();
    if (is_manage_mode) {
      on_edit_folder();
      return;
    }
    set_is_open((prev) => !prev);
  }

  function handle_overlay_click(event) {
    if (event.target === event.currentTarget) {
      set_is_open(false);
    }
  }

  function handle_add_site_click() {
    on_add_site();
  }

  function handle_edit_folder_click() {
    on_edit_folder();
  }

  function handle_delete_folder_click() {
    on_delete_folder();
  }

  function is_dragging_child_from_folder() {
    return folder_child_drag_state?.folder_id === folder.id;
  }

  function is_event_outside_modal(event) {
    return modal_ref.current && !modal_ref.current.contains(event.target);
  }

  function handle_overlay_drag_over(event) {
    if (!is_dragging_child_from_folder() || !is_event_outside_modal(event)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function handle_overlay_drop(event) {
    if (!is_dragging_child_from_folder() || !is_event_outside_modal(event)) return;

    event.preventDefault();
    on_child_drop_to_root(event, folder.id);
  }

  const is_root_drop_active = is_dragging_child_from_folder();

  const modal_content = is_open
    ? createPortal(
        <div
          className={`folder-overlay${is_root_drop_active ? ' folder-overlay--root-drop-target' : ''}`}
          onClick={handle_overlay_click}
          onDragOver={handle_overlay_drag_over}
          onDrop={handle_overlay_drop}
        >
          {is_root_drop_active && (
            <div className="folder-root-drop-hint" aria-hidden="true">
              {t('folder_drop_to_root_hint')}
            </div>
          )}
          <div
            className="folder-modal"
            ref={modal_ref}
            role="dialog"
            aria-modal="true"
            aria-label={folder.name}
            tabIndex={-1}
          >
            <header className="folder-header">
              <h2 className="folder-title">{folder.name}</h2>
              <div className="folder-header-actions">
                <button
                  className="folder-header-button"
                  type="button"
                  onClick={handle_add_site_click}
                  aria-label={t('folder_add_site')}
                  title={t('folder_add_site')}
                >
                  <PlusIcon />
                </button>
                <button
                  className="folder-header-button"
                  type="button"
                  onClick={handle_edit_folder_click}
                  aria-label={t('folder_edit')}
                  title={t('folder_edit')}
                >
                  <EditIcon />
                </button>
                <button
                  className="folder-header-button folder-header-button--danger"
                  type="button"
                  onClick={handle_delete_folder_click}
                  aria-label={t('folder_delete')}
                  title={t('folder_delete')}
                >
                  <TrashIcon />
                </button>
                <button
                  className="settings-close"
                  ref={close_button_ref}
                  type="button"
                  onClick={() => set_is_open(false)}
                  aria-label={t('modal_cancel')}
                >
                  <CloseIcon />
                </button>
              </div>
            </header>

            <ul
              className={`folder-grid${folder_child_drag_state?.folder_id === folder.id ? ' folder-grid--dragging' : ''}`}
              ref={folder_animation_parent}
            >
              {folder.children && folder.children.length > 0 ? (
                folder.children.map((site, child_index) => {
                  const is_child_dragging = folder_child_drag_state?.folder_id === folder.id
                    && folder_child_drag_state.index === child_index;
                  const is_child_drag_over = folder_child_drag_state?.folder_id === folder.id
                    && folder_child_drag_over_index === child_index;

                  return (
                    <li
                      key={site.id}
                      draggable="true"
                      className={`${is_child_dragging ? 'speed-dial-item--dragging' : ''} ${is_child_drag_over ? 'speed-dial-drop-target' : ''}`.trim()}
                      onDragStart={(event) => on_child_drag_start(event, folder.id, child_index)}
                      onDragEnter={on_child_drag_enter}
                      onDragOver={(event) => on_child_drag_over(event, folder.id, child_index)}
                      onDragLeave={on_child_drag_leave}
                      onDrop={(event) => on_child_drop(event, folder.id, child_index)}
                      onDragEnd={on_child_drag_end}
                    >
                      <div className="speed-dial-card">
                        <div
                          className="speed-dial-item"
                          role="link"
                          tabIndex={0}
                          onClick={() => {
                            set_is_open(false);
                            on_click(site.url);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              set_is_open(false);
                              on_click(site.url);
                            }
                          }}
                          onContextMenu={(e) => on_context_menu(e, site, folder.id)}
                          aria-label={`${site.name} - ${site.url}`}
                        >
                          <div className="speed-dial-icon-wrapper">
                            {render_icon(site)}
                          </div>
                          <span className="speed-dial-label">{site.name}</span>
                        </div>
                        <button
                          className="speed-dial-action-button"
                          type="button"
                          onClick={(e) => on_action_menu(e, site, folder.id)}
                          aria-label={`${site.name} ${t('speed_dial_actions')}`}
                          title={t('speed_dial_actions')}
                        >
                          <MoreIcon />
                        </button>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="folder-empty">
                  <p>{t('folder_empty')}</p>
                  <button className="modal-button modal-button--save" type="button" onClick={handle_add_site_click}>
                    {t('folder_add_site')}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <li
      className={`speed-dial-folder${is_drag_over ? ' speed-dial-drop-target' : ''}${is_folder_drop_target ? ' speed-dial-folder--drop-target' : ''}${is_dragging ? ' speed-dial-item--dragging' : ''}`}
      draggable="true"
      onDragStart={on_drag_start}
      onDragEnter={on_drag_enter}
      onDragOver={on_drag_over}
      onDragLeave={on_drag_leave}
      onDrop={on_drop}
      onDragEnd={on_drag_end}
    >
      <div className="speed-dial-card">
        <div
          className="speed-dial-item speed-dial-item--folder"
          role="button"
          tabIndex={0}
          onClick={toggle_folder}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle_folder(e);
            }
          }}
          onContextMenu={(e) => on_context_menu(e, folder)}
          aria-expanded={is_open}
          aria-label={folder.name}
        >
          <div className="speed-dial-icon-wrapper speed-dial-icon--folder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              {folder.children && folder.children.length > 0 && (
                <>
                  <line x1="7" y1="11" x2="17" y2="11" opacity="0.3" />
                  <line x1="7" y1="15" x2="17" y2="15" opacity="0.3" />
                </>
              )}
            </svg>
          </div>
          <span className="speed-dial-label">{folder.name}</span>
        </div>
        <button
          className="speed-dial-action-button"
          type="button"
          onClick={(e) => on_action_menu(e, folder)}
          aria-label={`${folder.name} ${t('speed_dial_actions')}`}
          title={t('speed_dial_actions')}
        >
          <MoreIcon />
        </button>
      </div>
      {modal_content}
    </li>
  );
}

export default Folder;
