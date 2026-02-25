import { useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';

/**
 * 1. ContextMenu component — right-click menu for speed dial items
 */

function ContextMenu({ x, y, on_edit, on_delete, on_remove_from_folder, on_close }) {
  const { t } = useTranslation();
  const menu_ref = useRef(null);

  useEffect(() => {
    function handle_click_outside(event) {
      if (menu_ref.current && !menu_ref.current.contains(event.target)) {
        on_close();
      }
    }

    function handle_keydown(event) {
      if (event.key === 'Escape') {
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
      menu_ref.current.focus();
    }
  }, []);

  return (
    <div
      className="context-menu"
      ref={menu_ref}
      style={{ top: `${y}px`, left: `${x}px` }}
      role="menu"
      tabIndex={-1}
    >
      <button
        className="context-menu-item"
        role="menuitem"
        onClick={() => { on_edit(); on_close(); }}
      >
        {t('context_edit')}
      </button>
      <button
        className="context-menu-item context-menu-item--danger"
        role="menuitem"
        onClick={() => { on_delete(); on_close(); }}
      >
        {t('context_delete')}
      </button>
      {on_remove_from_folder && (
        <button
          className="context-menu-item"
          role="menuitem"
          onClick={() => { on_remove_from_folder(); on_close(); }}
        >
          {t('context_remove_from_folder')}
        </button>
      )}
    </div>
  );
}

export default ContextMenu;
