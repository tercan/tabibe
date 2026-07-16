import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import { normalizeSiteUrl } from '../domain/dataSchema.js';

const ROOT_FOLDER_ID = 'root';

/**
 * 1. URL and suggestion helpers
 */

function get_safe_string(value) {
  return typeof value === 'string' ? value : '';
}

function normalize_url(value) {
  const trimmed = get_safe_string(value).trim();
  if (!trimmed) return '';

  try {
    return normalizeSiteUrl(trimmed);
  } catch {
    return trimmed;
  }
}

function validate_url(value) {
  try {
    normalizeSiteUrl(value);
    return true;
  } catch {
    return false;
  }
}

function format_name_from_host(hostname) {
  return hostname
    .replace(/^www\./, '')
    .split('.')[0]
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function get_url_suggestion(value) {
  const final_url = normalize_url(value);

  if (!validate_url(final_url)) {
    return { final_url, name: '', icon_slug: '' };
  }

  try {
    const parsed = new URL(final_url);
    const host = parsed.hostname;

    if (!host) {
      return { final_url, name: '', icon_slug: '' };
    }

    return {
      final_url,
      name: format_name_from_host(host),
      icon_slug: host
        .replace(/^www\./, '')
        .split('.')[0]
        .toLowerCase(),
    };
  } catch {
    return { final_url, name: '', icon_slug: '' };
  }
}

function normalize_url_for_compare(value) {
  const safe_value = get_safe_string(value);

  try {
    return new URL(normalize_url(safe_value)).href.replace(/\/$/, '');
  } catch {
    return safe_value.trim().replace(/\/$/, '');
  }
}

/**
 * 2. SiteModal component - add/edit speed dial sites and folders
 */

function SiteModal({
  site,
  mode = 'site',
  folders = [],
  current_folder_id = ROOT_FOLDER_ID,
  existing_sites = [],
  on_save,
  on_close,
}) {
  const { t } = useTranslation();
  const is_folder = mode === 'folder';
  const is_edit = !!site;
  const [name, set_name] = useState(site ? site.name || '' : '');
  const [url, set_url] = useState(site && !is_folder ? site.url || '' : '');
  const [icon_slug, set_icon_slug] = useState(site ? site.icon_slug || '' : '');
  const [target_folder_id, set_target_folder_id] = useState(current_folder_id || ROOT_FOLDER_ID);
  const [error, set_error] = useState('');
  const first_field_ref = useRef(null);
  const overlay_ref = useRef(null);
  const dialog_ref = useRef(null);
  const name_touched_ref = useRef(is_edit);

  const normalized_url = useMemo(
    () => (is_folder ? '' : normalize_url_for_compare(url)),
    [is_folder, url],
  );
  const duplicate_site = useMemo(() => {
    if (is_folder || !get_safe_string(url).trim() || !normalized_url) return null;

    return existing_sites.find(
      (item) =>
        item.id !== site?.id && normalize_url_for_compare(item.url || '') === normalized_url,
    );
  }, [existing_sites, is_folder, normalized_url, site?.id, url]);

  useFocusTrap({
    containerRef: dialog_ref,
    isActive: true,
    initialFocusRef: first_field_ref,
    onEscape: on_close,
  });

  useEffect(() => {
    const hadNoScroll = document.body.classList.contains('no-scroll');
    document.body.classList.add('no-scroll');

    return () => {
      if (!hadNoScroll) {
        document.body.classList.remove('no-scroll');
      }
    };
  }, []);

  useEffect(() => {
    set_name(site ? site.name || '' : '');
    set_url(site && !is_folder ? site.url || '' : '');
    set_icon_slug(site ? site.icon_slug || '' : '');
    set_target_folder_id(current_folder_id || ROOT_FOLDER_ID);
    set_error('');
    name_touched_ref.current = !!site;
  }, [current_folder_id, is_folder, site]);

  function handle_overlay_click(event) {
    if (event.target === overlay_ref.current) {
      on_close();
    }
  }

  function get_title() {
    if (is_folder) {
      return is_edit ? t('modal_title_edit_folder') : t('modal_title_add_folder');
    }
    return is_edit ? t('modal_title_edit') : t('modal_title_add');
  }

  function handle_url_change(event) {
    const value = event.target.value;
    set_url(value);

    const suggestion = get_url_suggestion(value);

    if (!is_edit && suggestion.name && !name_touched_ref.current) {
      set_name(suggestion.name);
    }
  }

  function handle_name_change(event) {
    name_touched_ref.current = true;
    set_name(event.target.value);
  }

  function handle_icon_change(event) {
    set_icon_slug(event.target.value);
  }

  async function handle_save_result(payload, folder_id) {
    set_error('');

    try {
      const saved = await on_save(payload, folder_id);

      if (saved === false) {
        set_error(t('modal_error_save_failed'));
      }
    } catch {
      set_error(t('modal_error_save_failed'));
    }
  }

  async function handle_submit(event) {
    event.preventDefault();

    const trimmed_name = get_safe_string(name).trim();

    if (!trimmed_name) {
      set_error(t('modal_error_name'));
      return;
    }

    if (is_folder) {
      await handle_save_result({
        id: site?.id,
        type: 'folder',
        name: trimmed_name,
      });

      return;
    }

    const trimmed_url = get_safe_string(url).trim();
    const trimmed_slug = get_safe_string(icon_slug).trim();

    if (!trimmed_url) {
      set_error(t('modal_error_url'));
      return;
    }

    let final_url;

    try {
      final_url = normalizeSiteUrl(trimmed_url);
    } catch {
      set_error(t('modal_error_url_invalid'));
      return;
    }

    if (!validate_url(final_url)) {
      set_error(t('modal_error_url_invalid'));
      return;
    }

    set_error('');

    await handle_save_result(
      {
        name: trimmed_name,
        url: final_url,
        icon_slug: trimmed_slug,
      },
      target_folder_id,
    );
  }

  const preview_name = get_safe_string(name).trim() || t('modal_preview_empty_name');
  const preview_url = get_safe_string(url).trim()
    ? normalize_url(url)
    : t('modal_preview_empty_url');

  return (
    <div className="modal-overlay" ref={overlay_ref} onClick={handle_overlay_click}>
      <div
        className="modal-dialog"
        ref={dialog_ref}
        role="dialog"
        aria-modal="true"
        aria-label={get_title()}
        tabIndex={-1}
      >
        <h2 className="modal-title">{get_title()}</h2>
        <form className="modal-form" onSubmit={handle_submit}>
          {!is_folder && (
            <div className="modal-field">
              <label htmlFor="site-url" className="modal-label">
                {t('modal_label_url')}
              </label>
              <input
                id="site-url"
                ref={first_field_ref}
                className="modal-input"
                type="text"
                value={url}
                onChange={handle_url_change}
                placeholder="https://www.google.com"
                autoComplete="off"
              />
            </div>
          )}

          <div className="modal-field">
            <label htmlFor="site-name" className="modal-label">
              {t('modal_label_name')}
            </label>
            <input
              id="site-name"
              ref={is_folder ? first_field_ref : null}
              className="modal-input"
              type="text"
              value={name}
              onChange={handle_name_change}
              placeholder={is_folder ? t('modal_placeholder_folder') : 'Google'}
              autoComplete="off"
            />
          </div>

          {!is_folder && (
            <>
              <div className="modal-field">
                <label htmlFor="site-icon" className="modal-label">
                  {t('modal_label_icon')}
                </label>
                <input
                  id="site-icon"
                  className="modal-input"
                  type="text"
                  value={icon_slug}
                  onChange={handle_icon_change}
                  placeholder="google"
                  autoComplete="off"
                />
              </div>

              <div className="modal-field">
                <label htmlFor="site-location" className="modal-label">
                  {t('modal_label_location')}
                </label>
                <select
                  id="site-location"
                  className="modal-input modal-select"
                  value={target_folder_id}
                  onChange={(event) => set_target_folder_id(event.target.value)}
                >
                  <option value={ROOT_FOLDER_ID}>{t('modal_location_root')}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-site-preview" aria-label={t('modal_preview_title')}>
                <span className="modal-site-preview-label">{t('modal_preview_title')}</span>
                <div className="modal-site-preview-card">
                  <span className="modal-site-preview-icon" aria-hidden="true">
                    {preview_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="modal-site-preview-content">
                    <strong>{preview_name}</strong>
                    <small>{preview_url}</small>
                  </span>
                </div>
              </div>

              {duplicate_site && <p className="modal-warning">{t('modal_duplicate_url')}</p>}
            </>
          )}

          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="modal-button modal-button--cancel" onClick={on_close}>
              {t('modal_cancel')}
            </button>
            <button type="submit" className="modal-button modal-button--save">
              {t('modal_save')}
            </button>
          </div>
        </form>
      </div>
      {/* /.modal-dialog */}
    </div>
  );
}

export default SiteModal;
