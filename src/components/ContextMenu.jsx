import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';

/**
 * 1. ContextMenu component — right-click menu for speed dial items
 */

function ContextMenu({
  x,
  y,
  can_move_left,
  can_move_right,
  move_folders = [],
  on_edit,
  on_delete,
  on_move_left,
  on_move_right,
  on_move_to_folder,
  on_remove_from_folder,
  on_close,
}) {
  const { t } = useTranslation();
  const menu_ref = useRef(null);
  const first_action_ref = useRef(null);
  const [target_folder_id, set_target_folder_id] = useState(move_folders[0]?.id || '');

  useEffect(() => {
    function handle_click_outside(event) {
      if (menu_ref.current && !menu_ref.current.contains(event.target)) {
        on_close();
      }
    }

    function handle_keydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        on_close();
      }
    }

    document.addEventListener('mousedown', handle_click_outside);
    document.addEventListener('keydown', handle_keydown);

    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
      document.removeEventListener('keydown', handle_keydown);
    };
  }, [on_close]);

  useEffect(() => {
    if (menu_ref.current) {
      first_action_ref.current?.focus();

      // Adjust position if overflowing viewport
      const rect = menu_ref.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (rect.right > vw) {
        menu_ref.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > vh) {
        menu_ref.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  useEffect(() => {
    set_target_folder_id(move_folders[0]?.id || '');
  }, [move_folders, x, y]);

  function run_action(action) {
    action?.();
    on_close();
  }

  return (
    <div
      className="context-menu"
      ref={menu_ref}
      style={{ top: `${y}px`, left: `${x}px` }}
      aria-label={t('context_actions_label')}
    >
      <button
        ref={first_action_ref}
        className="context-menu-item"
        type="button"
        onClick={() => run_action(on_edit)}
      >
        {t('context_edit')}
      </button>
      <div className="context-menu-order-actions">
        <button
          className="context-menu-item"
          type="button"
          disabled={!can_move_left}
          onClick={() => run_action(on_move_left)}
        >
          {t('context_move_left')}
        </button>
        <button
          className="context-menu-item"
          type="button"
          disabled={!can_move_right}
          onClick={() => run_action(on_move_right)}
        >
          {t('context_move_right')}
        </button>
      </div>
      {on_move_to_folder && move_folders.length > 0 && (
        <div className="context-menu-folder-actions">
          <label className="context-menu-label" htmlFor="context-menu-folder">
            {t('context_folder_label')}
          </label>
          <select
            id="context-menu-folder"
            className="context-menu-select"
            value={target_folder_id}
            onChange={(event) => set_target_folder_id(event.target.value)}
          >
            {move_folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button
            className="context-menu-item"
            type="button"
            onClick={() => run_action(() => on_move_to_folder(target_folder_id))}
          >
            {t('context_move_to_folder')}
          </button>
        </div>
      )}
      {on_remove_from_folder && (
        <button
          className="context-menu-item"
          type="button"
          onClick={() => run_action(on_remove_from_folder)}
        >
          {t('context_move_to_root')}
        </button>
      )}
      <button
        className="context-menu-item context-menu-item--danger"
        type="button"
        onClick={() => run_action(on_delete)}
      >
        {t('context_delete')}
      </button>
    </div>
  );
}

export default ContextMenu;
