import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import { get_all_data, set_all_data } from '../lib/storage.js';
import { BACKGROUND_PRESET_GROUPS } from '../lib/backgroundPresets.js';
import CloseIcon from './icons/CloseIcon.jsx';

const APP_VERSION = import.meta.env.VITE_APP_VERSION;

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
 * 3. SettingsPanel component
 */

function SettingsPanel({
  is_open,
  on_close,
  search_engine,
  on_change_search_engine,
  show_clock,
  on_toggle_clock,
  show_search,
  on_toggle_search,
  show_memory,
  on_toggle_memory,
  bg_color,
  bg_image,
  on_change_bg_color,
  on_change_bg_image,
  on_reset_bg,
}) {
  const { t } = useTranslation();
  const panel_ref = useRef(null);
  const close_button_ref = useRef(null);
  const reload_timer_ref = useRef(null);
  const [status, set_status] = useState(null);

  useFocusTrap({
    containerRef: panel_ref,
    isActive: is_open,
    initialFocusRef: close_button_ref,
    onEscape: on_close,
  });

  async function handle_export() {
    try {
      const data = await get_all_data();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const date = now.getFullYear().toString()
        + String(now.getMonth() + 1).padStart(2, '0')
        + String(now.getDate()).padStart(2, '0')
        + '-'
        + String(now.getHours()).padStart(2, '0')
        + String(now.getMinutes()).padStart(2, '0');
      link.href = url;
      link.download = `tabibe-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      set_status({ type: 'success', message: t('settings_export_success') });
    } catch {
      set_status({ type: 'error', message: t('settings_export_error') });
    }
  }

  async function handle_import(event) {
    const file = event.target.files[0];
    if (!file) return;

    // File size validation (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      set_status({ type: 'error', message: t('settings_import_file_too_large') });
      event.target.value = '';
      return;
    }

    set_status({ type: 'loading', message: t('settings_importing') });

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

        set_status({ type: 'success', message: t('settings_import_success') });
        reload_timer_ref.current = setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch {
        set_status({ type: 'error', message: t('settings_import_error') });
      }
    };
    reader.onerror = () => {
      set_status({ type: 'error', message: t('settings_import_error') });
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    event.target.value = '';
  }

  useEffect(() => {
    if (is_open) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
      if (reload_timer_ref.current) {
        clearTimeout(reload_timer_ref.current);
      }
    };
  }, [is_open]);

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
        tabIndex={-1}
      >
        <header className="settings-header">
          <h2 className="settings-title">{t('settings_title')}</h2>
          <button
            className="settings-close"
            ref={close_button_ref}
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
            <label className="settings-toggle">
              <span className="settings-toggle-label">{t('settings_show_memory')}</span>
              <input
                type="checkbox"
                checked={show_memory}
                onChange={on_toggle_memory}
              />
            </label>
          </div>
          {/* /.settings-group */}

          <div className="settings-group">
            <h3 className="settings-group-title">{t('settings_background')}</h3>
            <div className="settings-bg-groups">
              {BACKGROUND_PRESET_GROUPS.map((group) => (
                <section
                  className="settings-bg-group"
                  key={group.id}
                  aria-labelledby={`settings-bg-${group.id}`}
                  data-theme-target={group.theme}
                >
                  <h4 className="settings-bg-group-title" id={`settings-bg-${group.id}`}>
                    {t(group.labelKey)}
                  </h4>
                  <div className="settings-bg-presets">
                    {group.colors.map((color) => (
                      <button
                        type="button"
                        key={color}
                        className={`settings-bg-swatch${bg_color === color && !bg_image ? ' settings-bg-swatch--active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => on_change_bg_color(color, group.theme)}
                        aria-label={`${t(group.labelKey)} ${color}`}
                        aria-pressed={bg_color === color && !bg_image}
                        title={color}
                        data-theme-target={group.theme}
                      />
                    ))}
                  </div>
                </section>
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
            {status && (
              <p
                className={`settings-status settings-status--${status.type}`}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            )}
          </div>
          {/* /.settings-group */}

          <div className="settings-about">
            <p className="settings-about-title">
              <a href="https://tercan.github.io/tabibe/" target="_blank" rel="noopener noreferrer" className="settings-about-link">
                Tabibe <span>v{APP_VERSION}</span>
              </a>
            </p>
            <p className="settings-about-author">
              {t('settings_about_developer')}: <a href="https://tercan.net" target="_blank" rel="noopener noreferrer" className="settings-author-link">Tercan Keskin</a>
            </p>
          </div>
          {/* /.settings-about */}
        </div>
        {/* /.settings-body */}
      </aside>
      {/* /.settings-panel */}
    </div>
  );
}

export { SEARCH_ENGINES };
export default SettingsPanel;
