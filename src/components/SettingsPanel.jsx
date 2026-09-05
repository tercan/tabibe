import { useEffect, useRef, useState } from 'react';
import { Download, Grid2X2, ImageUp, Moon, RotateCcw, Sun, Upload } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import useBodyScrollLock from '../hooks/useBodyScrollLock.js';
import { exportBackup, inspectBackup, restoreBackup, undoLastRestore } from '../lib/storage.js';
import { prepareBackgroundImage } from '../lib/backgroundImage.js';
import { downloadBackupFile } from '../lib/backupFile.js';
import { BACKGROUND_PRESET_GROUPS } from '../lib/backgroundPresets.js';
import CloseIcon from './icons/CloseIcon.jsx';
import LocaleFlag from './icons/LocaleFlag.jsx';
import { SEARCH_ENGINES } from '../config/searchEngines.js';
import { LOCALE_OPTIONS } from '../i18n/translationContext.js';

const APP_VERSION = import.meta.env.VITE_APP_VERSION;

/**
 * 3. SettingsPanel component
 */

function SettingsPanel({
  is_open,
  on_close,
  iconStyle,
  onToggleIconStyle,
  theme,
  onToggleTheme,
  search_engine,
  on_change_search_engine,
  show_clock,
  on_toggle_clock,
  show_search,
  on_toggle_search,
  show_memory,
  on_toggle_memory,
  locale,
  on_change_locale,
  favicon_permission,
  on_request_favicon_permission,
  on_revoke_favicon_permission,
  bg_color,
  bg_image,
  on_change_bg_color,
  on_change_bg_image,
  on_reset_bg,
}) {
  const { t } = useTranslation();
  const panel_ref = useRef(null);
  const close_button_ref = useRef(null);
  const language_menu_ref = useRef(null);
  const language_trigger_ref = useRef(null);
  const reload_timer_ref = useRef(null);
  const [status, set_status] = useState(null);
  const [pending_import, set_pending_import] = useState(null);
  const [can_undo_import, set_can_undo_import] = useState(false);
  const [is_language_menu_open, set_is_language_menu_open] = useState(false);
  const active_locale = LOCALE_OPTIONS.find((option) => option.id === locale) || LOCALE_OPTIONS[0];
  const iconStyleLabel =
    iconStyle === 'simple' ? t('footer_icon_style_simple') : t('footer_icon_style_favicon');

  useFocusTrap({
    containerRef: panel_ref,
    isActive: is_open,
    initialFocusRef: close_button_ref,
    onEscape: on_close,
  });
  useBodyScrollLock(is_open);

  useEffect(() => {
    if (!is_language_menu_open) return undefined;

    function handle_pointer_down(event) {
      if (!language_menu_ref.current?.contains(event.target)) {
        set_is_language_menu_open(false);
      }
    }

    function handle_key_down(event) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      set_is_language_menu_open(false);
      language_trigger_ref.current?.focus();
    }

    document.addEventListener('pointerdown', handle_pointer_down);
    document.addEventListener('keydown', handle_key_down, true);

    return () => {
      document.removeEventListener('pointerdown', handle_pointer_down);
      document.removeEventListener('keydown', handle_key_down, true);
    };
  }, [is_language_menu_open]);

  useEffect(() => {
    if (!is_open) set_is_language_menu_open(false);
  }, [is_open]);

  async function handle_export() {
    try {
      const data = await exportBackup();
      downloadBackupFile(data);
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

  useEffect(
    () => () => {
      if (reload_timer_ref.current) {
        clearTimeout(reload_timer_ref.current);
      }
    },
    [],
  );

  function handle_overlay_click(event) {
    if (event.target === event.currentTarget) {
      on_close();
    }
  }

  function handle_favicon_permission_change(event) {
    if (event.target.checked) {
      on_request_favicon_permission();
      return;
    }
    on_revoke_favicon_permission();
  }

  function handle_locale_change(locale_id) {
    on_change_locale(locale_id);
    set_is_language_menu_open(false);
    language_trigger_ref.current?.focus();
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
          <div className="settings-header-actions">
            <button
              type="button"
              className="settings-header-button settings-header-button--icon-style"
              onClick={onToggleIconStyle}
              aria-label={iconStyleLabel}
              aria-pressed={iconStyle === 'favicon'}
              title={iconStyleLabel}
            >
              <Grid2X2 aria-hidden="true" />
            </button>
            <button
              type="button"
              className="settings-header-button settings-header-button--theme"
              onClick={onToggleTheme}
              aria-label={t('footer_theme_toggle')}
              title={t('footer_theme_toggle')}
            >
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <div className="settings-language-menu" ref={language_menu_ref}>
              <button
                type="button"
                className="settings-language-trigger"
                ref={language_trigger_ref}
                onClick={() => set_is_language_menu_open((is_open) => !is_open)}
                aria-label={`${t('settings_language')}: ${active_locale.name}`}
                aria-controls="settings-language-options"
                aria-expanded={is_language_menu_open}
                aria-haspopup="true"
                title={active_locale.name}
              >
                <LocaleFlag locale={active_locale.id} />
                <span className="visually-hidden">{active_locale.name}</span>
              </button>
              {is_language_menu_open && (
                <div
                  className="settings-language-options"
                  id="settings-language-options"
                  role="group"
                  aria-label={t('settings_language')}
                >
                  {LOCALE_OPTIONS.filter((option) => option.id !== locale).map((option) => (
                    <button
                      type="button"
                      className="settings-language-option"
                      key={option.id}
                      onClick={() => handle_locale_change(option.id)}
                      title={option.name}
                    >
                      <LocaleFlag locale={option.id} />
                      <span className="visually-hidden">{option.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* /.settings-language-menu */}
            <button
              className="settings-close"
              ref={close_button_ref}
              onClick={on_close}
              aria-label={t('modal_cancel')}
            >
              <CloseIcon />
            </button>
          </div>
          {/* /.settings-header-actions */}
        </header>
        {/* /.settings-header */}

        <div className="settings-body">
          <div className="settings-group settings-group--search-engines">
            <h3 className="settings-group-title">{t('settings_search_engine')}</h3>
            <div className="settings-options settings-options--search-engines">
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
                  <span className="settings-radio-label">
                    {engine.nameKey ? t(engine.nameKey) : engine.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {/* /.settings-group */}

          <div className="settings-group settings-group--site-icons">
            <h3 className="settings-group-title">{t('settings_site_icons')}</h3>
            <label className="settings-toggle settings-toggle--described">
              <span className="settings-toggle-copy">
                <span className="settings-toggle-label">{t('settings_site_icons_toggle')}</span>
                <span className="settings-toggle-description" id="settings-site-icons-description">
                  {t('settings_site_icons_description')}
                </span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(favicon_permission?.hasPermission)}
                onChange={handle_favicon_permission_change}
                disabled={
                  !favicon_permission?.supported ||
                  favicon_permission?.requestState === 'requesting' ||
                  favicon_permission?.requestState === 'revoking'
                }
                aria-describedby="settings-site-icons-description"
              />
            </label>
            {favicon_permission?.requestState === 'granted' && (
              <p
                className="settings-permission-feedback settings-permission-feedback--success"
                role="status"
              >
                {t('settings_site_icons_enabled')}
              </p>
            )}
            {favicon_permission?.requestState === 'denied' && (
              <p
                className="settings-permission-feedback settings-permission-feedback--error"
                role="status"
              >
                {t('settings_site_icons_denied')}
              </p>
            )}
            {favicon_permission?.requestState === 'revoked' && (
              <p className="settings-permission-feedback" role="status">
                {t('settings_site_icons_disabled')}
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
                <ImageUp aria-hidden="true" />
                <span>{t('settings_bg_upload')}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="visually-hidden"
                  onChange={handle_background_upload}
                />
              </label>
              <button className="modal-button modal-button--cancel" onClick={on_reset_bg}>
                <RotateCcw aria-hidden="true" />
                <span>{t('settings_bg_reset')}</span>
              </button>
            </div>
          </div>
          {/* /.settings-group */}

          <div className="settings-group">
            <h3 className="settings-group-title">{t('settings_data_management')}</h3>
            <div className="settings-bg-actions settings-data-actions">
              <button className="modal-button modal-button--cancel" onClick={handle_export}>
                <Download aria-hidden="true" />
                <span>{t('settings_export')}</span>
              </button>
              <label className="modal-button modal-button--cancel">
                <Upload aria-hidden="true" />
                <span>{t('settings_import')}</span>
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
        </div>
        {/* /.settings-body */}

        <footer className="settings-about">
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
          <p className="settings-about-privacy">
            <a
              href={`privacy-policy.html?lang=${encodeURIComponent(locale)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="settings-author-link"
            >
              {t('settings_privacy_policy')}
            </a>
          </p>
        </footer>
        {/* /.settings-about */}
      </aside>
      {/* /.settings-panel */}
    </div>
  );
}

export default SettingsPanel;
