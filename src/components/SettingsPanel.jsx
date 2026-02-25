import { useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { get_all_data, set_all_data } from '../lib/storage.js';

/**
 * 1. Search engine definitions
 */

const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text=' },
];

/**
 * 2. CloseIcon component
 */

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * 3. SettingsPanel component
 */

const BG_PRESETS = [
  // 6 Light Colors
  '#f8f9fa', // Default Light
  '#e3f2fd', // Light Blue
  '#e8f5e9', // Light Green
  '#fff3e0', // Light Orange
  '#fce4ec', // Light Pink
  '#f3e5f5', // Light Purple
  // 6 Dark Colors
  '#181828', // Default Dark
  '#1a237e', // Indigo
  '#1b5e20', // Forest Green
  '#4a148c', // Deep Purple
  '#212121', // Jet Black
  '#263238', // Blue Grey
];

function SettingsPanel({
  is_open,
  on_close,
  search_engine,
  on_change_search_engine,
  show_clock,
  on_toggle_clock,
  show_search,
  on_toggle_search,
  bg_color,
  bg_image,
  on_change_bg_color,
  on_change_bg_image,
  on_reset_bg,
}) {
  const { t } = useTranslation();
  const panel_ref = useRef(null);

  async function handle_export() {
    const data = await get_all_data();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `tabibe-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handle_import(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Basic validation: must be an object and have at least one tabibe key
        if (typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Invalid format');
        }

        const keys = Object.keys(data);
        const has_tabibe_keys = keys.some(key => key.startsWith('tabibe-'));
        
        if (!has_tabibe_keys) {
          throw new Error('No valid keys found');
        }

        // Apply data using unified set_all_data
        await set_all_data(data);

        alert(t('settings_import_success'));
        window.location.reload();
      } catch (err) {
        alert(t('settings_import_error'));
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    event.target.value = '';
  }

  useEffect(() => {
    function handle_keydown(event) {
      if (event.key === 'Escape') {
        on_close();
      }
    }

    if (is_open) {
      document.addEventListener('keydown', handle_keydown);
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.removeEventListener('keydown', handle_keydown);
      document.body.classList.remove('no-scroll');
    };
  }, [is_open, on_close]);

  function handle_overlay_click(event) {
    if (event.target === event.currentTarget) {
      on_close();
    }
  }

  if (!is_open) return null;

  return (
    <div className="settings-overlay" onClick={handle_overlay_click}>
      <aside
        className="settings-panel"
        ref={panel_ref}
        role="dialog"
        aria-modal="true"
        aria-label={t('settings_title')}
      >
        <header className="settings-header">
          <h2 className="settings-title">{t('settings_title')}</h2>
          <button
            className="settings-close"
            onClick={on_close}
            aria-label={t('modal_cancel')}
          >
            <CloseIcon />
          </button>
        </header>
        {/* /.settings-header */}

        <div className="settings-body">
          <div className="settings-group">
            <h3 className="settings-group-title">{t('settings_search_engine')}</h3>
            <div className="settings-options">
              {SEARCH_ENGINES.map((engine) => (
                <label 
                  key={engine.id} 
                  className={`settings-radio-modern${search_engine === engine.id ? ' settings-radio-modern--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="search-engine"
                    value={engine.id}
                    checked={search_engine === engine.id}
                    onChange={() => on_change_search_engine(engine.id)}
                  />
                  <span className="settings-radio-label">{engine.name}</span>
                </label>
              ))}
            </div>
          </div>
          {/* /.settings-group */}

          <div className="settings-group">
            <h3 className="settings-group-title">{t('settings_layout')}</h3>
            <label className="settings-toggle">
              <span className="settings-toggle-label">{t('settings_show_clock')}</span>
              <input
                type="checkbox"
                checked={show_clock}
                onChange={on_toggle_clock}
              />
            </label>
            <label className="settings-toggle">
              <span className="settings-toggle-label">{t('settings_show_search')}</span>
              <input
                type="checkbox"
                checked={show_search}
                onChange={on_toggle_search}
              />
            </label>
          </div>
          {/* /.settings-group */}

          <div className="settings-group">
            <h3 className="settings-group-title">{t('settings_background')}</h3>
            <div className="settings-bg-presets">
              {BG_PRESETS.map((color) => (
                <button
                   key={color}
                   className={`settings-bg-swatch${bg_color === color && !bg_image ? ' settings-bg-swatch--active' : ''}`}
                   style={{ backgroundColor: color }}
                   onClick={() => on_change_bg_color(color)}
                   aria-label={color}
                   title={color}
                />
              ))}
            </div>
            <div className="settings-bg-actions">
              <label className="modal-button modal-button--cancel settings-bg-upload">
                {t('settings_bg_upload')}
                <input
                  type="file"
                  accept="image/*"
                  className="visually-hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => on_change_bg_image(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <button className="modal-button modal-button--cancel" onClick={on_reset_bg}>
                {t('settings_bg_reset')}
              </button>
            </div>
          </div>
          {/* /.settings-group */}

          <div className="settings-group">
            <h3 className="settings-group-title">{t('settings_data_management')}</h3>
            <div className="settings-bg-actions">
              <button className="modal-button modal-button--cancel" onClick={handle_export}>
                {t('settings_export')}
              </button>
              <label className="modal-button modal-button--cancel">
                {t('settings_import')}
                <input
                  type="file"
                  accept=".json"
                  className="visually-hidden"
                  onChange={handle_import}
                />
              </label>
            </div>
          </div>
          {/* /.settings-group */}
        </div>
        {/* /.settings-body */}
      </aside>
      {/* /.settings-panel */}
    </div>
  );
}

export { SEARCH_ENGINES };
export default SettingsPanel;
