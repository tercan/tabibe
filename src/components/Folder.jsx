import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../hooks/useTranslation.jsx';

/**
 * 1. CloseIcon SVG
 */
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * 2. Folder component — opens a modal (via portal) with speed dial items.
 *    Returns a single <li> root so auto-animate can track it properly.
 */

function Folder({
  folder,
  icon_style,
  theme,
  get_icon_src,
  handle_icon_error,
  on_click,
  on_context_menu,
  on_folder_context_menu,
  is_drag_over,
  is_dragging,
  on_drag_start,
  on_drag_enter,
  on_drag_over,
  on_drag_leave,
  on_drop,
  on_drag_end,
}) {
  const { t } = useTranslation();
  const [is_open, set_is_open] = useState(false);

  useEffect(() => {
    function handle_keydown(event) {
      if (is_open && event.key === 'Escape') {
        set_is_open(false);
      }
    }
    document.addEventListener('keydown', handle_keydown);
    return () => document.removeEventListener('keydown', handle_keydown);
  }, [is_open]);

  function toggle_folder(event) {
    event.stopPropagation();
    set_is_open((prev) => !prev);
  }

  function handle_overlay_click(event) {
    if (event.target === event.currentTarget) {
      set_is_open(false);
    }
  }

  const modal_content = is_open
    ? createPortal(
        <div className="folder-overlay" onClick={handle_overlay_click} role="dialog" aria-modal="true" aria-label={folder.name}>
          <div className="folder-modal">
            <header className="folder-header">
              <h2 className="folder-title">{folder.name}</h2>
              <button className="settings-close" onClick={() => set_is_open(false)} aria-label={t('modal_cancel')}>
                <CloseIcon />
              </button>
            </header>

            <ul className="folder-grid">
              {folder.children && folder.children.length > 0 ? (
                folder.children.map((site) => (
                  <li key={site.url}>
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
                        <img
                          className={`speed-dial-icon${icon_style === 'simple' && (!site.icon_slug || !get_icon_src(site).includes('simpleicons.org')) ? ' speed-dial-icon--fallback' : ''}`}
                          src={get_icon_src(site)}
                          alt=""
                          aria-hidden="true"
                          width="40"
                          height="40"
                          loading="lazy"
                          onError={(e) => handle_icon_error(e, site)}
                        />
                      </div>
                      <span className="speed-dial-label">{site.name}</span>
                    </div>
                  </li>
                ))
              ) : (
                <div className="folder-empty">{t('folder_empty')}</div>
              )}
            </ul>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <li
      className={`speed-dial-folder${is_drag_over ? ' speed-dial-drop-target' : ''}${is_dragging ? ' speed-dial-item--dragging' : ''}`}
      draggable="true"
      onDragStart={on_drag_start}
      onDragEnter={on_drag_enter}
      onDragOver={on_drag_over}
      onDragLeave={on_drag_leave}
      onDrop={on_drop}
      onDragEnd={on_drag_end}
    >
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
        onContextMenu={(e) => on_folder_context_menu(e, folder)}
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
      {modal_content}
    </li>
  );
}

export default Folder;
