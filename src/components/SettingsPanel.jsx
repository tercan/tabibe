import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import { exportBackup, inspectBackup, restoreBackup, undoLastRestore } from '../lib/storage.js';
import { prepareBackgroundImage } from '../lib/backgroundImage.js';
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
  favicon_permission,
  on_request_favicon_permission,
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
  const [pending_import, set_pending_import] = useState(null);
  const [can_undo_import, set_can_undo_import] = useState(false);

  useFocusTrap({
    containerRef: panel_ref,
    isActive: is_open,
    initialFocusRef: close_button_ref,
    onEscape: on_close,
  });

  async function handle_export() {
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        '-' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0');
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

    try {
      const data = JSON.parse(await file.text());
      const inspected = await inspectBackup(data);
      set_pending_import({ data, summary: inspected.summary });
      set_status(null);
    } catch {
      set_status({ type: 'error', message: t('settings_import_error') });
    }

    event.target.value = '';
  }

  async function handle_confirm_import() {
    if (!pending_import) return;
    set_status({ type: 'loading', message: t('settings_importing') });

    try {
      await restoreBackup(pending_import.data);
      set_pending_import(null);
      set_can_undo_import(true);
      set_status({ type: 'success', message: t('settings_import_success') });
      reload_timer_ref.current = setTimeout(() => window.location.reload(), 1200);
    } catch {
      set_status({ type: 'error', message: t('settings_import_error') });
    }
  }

  async function handle_undo_import() {
    try {
      const restored = await undoLastRestore();
      if (!restored) return;
      set_can_undo_import(false);
      set_status({ type: 'success', message: t('settings_import_undone') });
      reload_timer_ref.current = setTimeout(() => window.location.reload(), 800);
    } catch {
      set_status({ type: 'error', message: t('settings_import_error') });
    }
  }

  async function handle_background_upload(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    set_status({ type: 'loading', message: t('settings_bg_processing') });
    try {
      const dataUrl = await prepareBackgroundImage(file);
      const saved = await on_change_bg_image(dataUrl);
      if (saved === false) throw new Error('save_failed');
      set_status({ type: 'success', message: t('settings_bg_upload_success') });
    } catch (error) {
      const message =
        error?.code === 'unsupported_type'
          ? t('settings_bg_unsupported_type')
          : error?.code === 'file_too_large'
            ? t('settings_import_file_too_large')
            : t('settings_bg_upload_error');
      set_status({ type: 'error', message });
    }
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
            <h3 className="settings-group-title">{t('settings_site_icons')}</h3>
            <p className="settings-description">{t('settings_site_icons_description')}</p>
            {favicon_permission?.hasPermission ? (
              <p className="settings-permission-state settings-permission-state--success">
                {t('settings_site_icons_enabled')}
              </p>
            ) : (
              <button
                type="button"
                className="modal-button modal-button--cancel settings-permission-button"
                onClick={on_request_favicon_permission}
                disabled={
                  !favicon_permission?.supported ||
                  favicon_permission?.requestState === 'requesting'
                }
              >
                {t('settings_site_icons_enable')}
              </button>
            )}
            {favicon_permission?.requestState === 'denied' && (
              <p
                className="settings-permission-state settings-permission-state--error"
                role="status"
              >
                {t('settings_site_icons_denied')}
              </p>
            )}
          </div>
          {/* /.settings-group */}

          <div className="settings-group">
            <h3 className="settings-group-title">{t('settings_layout')}</h3>
            <label className="settings-toggle">
              <span className="settings-toggle-label">{t('settings_show_clock')}</span>
              <input type="checkbox" checked={show_clock} onChange={on_toggle_clock} />
            </label>
            <label className="settings-toggle">
              <span className="settings-toggle-label">{t('settings_show_search')}</span>
              <input type="checkbox" checked={show_search} onChange={on_toggle_search} />
            </label>
            <label className="settings-toggle">
              <span className="settings-toggle-label">{t('settings_show_memory')}</span>
              <input type="checkbox" checked={show_memory} onChange={on_toggle_memory} />
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
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="visually-hidden"
                  onChange={handle_background_upload}
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
            {pending_import && (
              <div className="settings-import-preview" role="status">
                <p className="settings-import-preview-title">
                  {t('settings_import_preview_title')}
                </p>
                <p>{t('settings_import_preview_summary', pending_import.summary)}</p>
                <div className="settings-bg-actions">
                  <button
                    type="button"
                    className="modal-button modal-button--primary"
                    onClick={handle_confirm_import}
                  >
                    {t('settings_import_apply')}
                  </button>
                  <button
                    type="button"
                    className="modal-button modal-button--cancel"
                    onClick={() => set_pending_import(null)}
                  >
                    {t('modal_cancel')}
                  </button>
                </div>
              </div>
            )}
            {can_undo_import && (
              <button type="button" className="toast-action" onClick={handle_undo_import}>
                {t('toast_undo')}
              </button>
            )}
          </div>
          {/* /.settings-group */}

          <div className="settings-about">
            <p className="settings-about-title">
              <a
                href="https://tercan.github.io/tabibe/"
                target="_blank"
                rel="noopener noreferrer"
                className="settings-about-link"
              >
                Tabibe <span>v{APP_VERSION}</span>
              </a>
            </p>
            <p className="settings-about-author">
              {t('settings_about_developer')}:{' '}
              <a
                href="https://tercan.net"
                target="_blank"
                rel="noopener noreferrer"
                className="settings-author-link"
              >
                Tercan Keskin
              </a>
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
