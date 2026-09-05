import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import useFocusTrap from '../hooks/useFocusTrap.jsx';
import useBodyScrollLock from '../hooks/useBodyScrollLock.js';
import { normalizeSiteUrl } from '../domain/dataSchema.js';
import { getBrandIconUrl, resolveBrandIcon, searchIconCatalog } from '../lib/iconCatalog.js';
import { getHttpConnectionKind } from '../lib/urlSafety.js';
import SiteIcon from './SiteIcon.jsx';

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
    return { final_url, name: '' };
  }

  try {
    const parsed = new URL(final_url);
    const host = parsed.hostname;

    if (!host) {
      return { final_url, name: '' };
    }

    return {
      final_url,
      name: format_name_from_host(host),
    };
  } catch {
    return { final_url, name: '' };
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
  icon_catalog,
  icon_style = 'favicon',
  has_favicon_permission = false,
  on_request_favicon_permission,
  on_save,
  on_close,
}) {
  const { t } = useTranslation();
  const is_folder = mode === 'folder';
  const is_edit = !!site;
  const [name, set_name] = useState(site ? site.name || '' : '');
  const [url, set_url] = useState(site && !is_folder ? site.url || '' : '');
  const [icon_preference, set_icon_preference] = useState(site?.icon?.preference || 'auto');
  const [icon_slug, set_icon_slug] = useState(site?.icon?.slug || site?.icon_slug || '');
  const [brand_query, set_brand_query] = useState('');
  const [highlighted_brand_index, set_highlighted_brand_index] = useState(0);
  const [target_folder_id, set_target_folder_id] = useState(current_folder_id || ROOT_FOLDER_ID);
  const [duplicate_decision, set_duplicate_decision] = useState(null);
  const [is_saving, set_is_saving] = useState(false);
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
  const connection_kind = useMemo(
    () => (is_folder ? 'secure-or-internal' : getHttpConnectionKind(normalize_url(url))),
    [is_folder, url],
  );
  const brand_results = useMemo(
    () => searchIconCatalog(icon_catalog, brand_query),
    [brand_query, icon_catalog],
  );
  const selected_brand = icon_catalog?.bySlug?.get(icon_slug) || null;
  const preview_site = useMemo(
    () => ({
      id: site?.id || 'preview',
      name: get_safe_string(name).trim() || t('modal_preview_empty_name'),
      url: normalize_url(url),
      icon: { preference: icon_preference, slug: selected_brand?.slug || null },
    }),
    [icon_preference, name, selected_brand?.slug, site?.id, t, url],
  );

  useFocusTrap({
    containerRef: dialog_ref,
    isActive: true,
    initialFocusRef: first_field_ref,
    onEscape: on_close,
  });
  useBodyScrollLock(true);

  useEffect(() => {
    set_name(site ? site.name || '' : '');
    set_url(site && !is_folder ? site.url || '' : '');
    const next_slug = site?.icon?.slug || site?.icon_slug || '';
    set_icon_preference(site?.icon?.preference || 'auto');
    set_icon_slug(next_slug);
    set_brand_query(icon_catalog?.bySlug?.get(next_slug)?.title || '');
    set_highlighted_brand_index(0);
    set_target_folder_id(current_folder_id || ROOT_FOLDER_ID);
    set_duplicate_decision(null);
    set_is_saving(false);
    set_error('');
    name_touched_ref.current = !!site;
  }, [current_folder_id, icon_catalog?.bySlug, is_folder, site]);

  useEffect(() => {
    set_duplicate_decision(null);
  }, [duplicate_site?.id, normalized_url]);

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

  function handle_icon_preference_change(preference) {
    set_icon_preference(preference);
    set_highlighted_brand_index(0);

    if (preference !== 'brand') {
      set_icon_slug('');
      set_brand_query('');
      return;
    }

    const suggested_brand = resolveBrandIcon(
      { name, url: normalize_url(url), icon: { preference: 'brand', slug: null } },
      icon_catalog,
    );
    if (suggested_brand) {
      set_icon_slug(suggested_brand.slug);
      set_brand_query(suggested_brand.title);
    }
  }

  function handle_brand_query_change(event) {
    set_brand_query(event.target.value);
    set_icon_slug('');
    set_highlighted_brand_index(0);
  }

  function handle_brand_select(icon) {
    set_icon_slug(icon.slug);
    set_brand_query(icon.title);
    set_highlighted_brand_index(0);
  }

  function handle_brand_key_down(event) {
    if (!brand_results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      set_highlighted_brand_index((current) => (current + 1) % brand_results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      set_highlighted_brand_index(
        (current) => (current - 1 + brand_results.length) % brand_results.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      handle_brand_select(brand_results[highlighted_brand_index]);
    } else if (event.key === 'Escape') {
      set_brand_query(selected_brand?.title || '');
    }
  }

  async function handle_save_result(payload, folder_id) {
    set_error('');
    set_is_saving(true);

    try {
      const saved = await on_save(payload, folder_id);

      if (saved === false) {
        set_error(t('modal_error_save_failed'));
        return false;
      }
      return true;
    } catch {
      set_error(t('modal_error_save_failed'));
      return false;
    } finally {
      set_is_saving(false);
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

    if (duplicate_site && !duplicate_decision) {
      set_error(t('modal_duplicate_decision_required'));
      return;
    }

    set_error('');

    const update_duplicate = duplicate_site && duplicate_decision === 'update';

    await handle_save_result(
      {
        id: update_duplicate ? duplicate_site.id : site?.id,
        replaceId: update_duplicate && site?.id !== duplicate_site.id ? site?.id : null,
        name: trimmed_name,
        url: final_url,
        icon: {
          preference: icon_preference,
          slug: icon_catalog?.bySlug?.has(icon_slug) ? icon_slug : null,
        },
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
              <fieldset className="modal-icon-selector">
                <legend className="modal-label">{t('modal_icon_label')}</legend>
                <div
                  className="modal-icon-preferences"
                  role="group"
                  aria-label={t('modal_icon_label')}
                >
                  {['auto', 'brand', 'favicon', 'monogram'].map((preference) => (
                    <button
                      key={preference}
                      type="button"
                      className={`modal-icon-preference${icon_preference === preference ? ' modal-icon-preference--active' : ''}`}
                      aria-pressed={icon_preference === preference}
                      onClick={() => handle_icon_preference_change(preference)}
                    >
                      {t(`modal_icon_${preference}`)}
                    </button>
                  ))}
                </div>

                {icon_preference === 'brand' && (
                  <div className="modal-brand-picker">
                    <label htmlFor="site-brand-search" className="modal-label">
                      {t('modal_icon_brand_search')}
                    </label>
                    <input
                      id="site-brand-search"
                      className="modal-input"
                      type="search"
                      role="combobox"
                      value={brand_query}
                      onChange={handle_brand_query_change}
                      onKeyDown={handle_brand_key_down}
                      autoComplete="off"
                      aria-expanded={brand_results.length > 0}
                      aria-controls="site-brand-results"
                      aria-activedescendant={
                        brand_results.length
                          ? `site-brand-${brand_results[highlighted_brand_index]?.slug}`
                          : undefined
                      }
                    />
                    {brand_query && brand_results.length > 0 && !selected_brand && (
                      <ul id="site-brand-results" className="modal-brand-results" role="listbox">
                        {brand_results.map((icon, index) => (
                          <li key={icon.slug} role="presentation">
                            <button
                              id={`site-brand-${icon.slug}`}
                              type="button"
                              className={`modal-brand-result${index === highlighted_brand_index ? ' modal-brand-result--active' : ''}`}
                              role="option"
                              aria-selected={index === highlighted_brand_index}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handle_brand_select(icon)}
                            >
                              <span
                                className="modal-brand-result-icon"
                                style={{
                                  '--site-icon-mask': `url("${getBrandIconUrl(icon.slug)}")`,
                                }}
                                aria-hidden="true"
                              />
                              <span>{icon.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {brand_query && !brand_results.length && icon_catalog?.isLoaded && (
                      <p className="modal-icon-help">{t('modal_icon_brand_empty')}</p>
                    )}
                    {!icon_catalog?.isLoaded && (
                      <p className="modal-icon-help">{t('modal_icon_catalog_loading')}</p>
                    )}
                  </div>
                )}

                {icon_preference === 'favicon' && !has_favicon_permission && (
                  <div className="modal-icon-permission">
                    <p>{t('modal_icon_favicon_permission')}</p>
                    <button
                      type="button"
                      className="modal-button modal-button--cancel"
                      onClick={on_request_favicon_permission}
                    >
                      {t('modal_icon_favicon_enable')}
                    </button>
                  </div>
                )}
              </fieldset>

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

              {connection_kind === 'public-insecure' && (
                <p className="modal-warning" role="status">
                  {t('modal_http_public_warning')}
                </p>
              )}
              {connection_kind === 'local' && (
                <p className="modal-notice" role="status">
                  {t('modal_http_local_notice')}
                </p>
              )}
              {connection_kind === 'private' && (
                <p className="modal-notice" role="status">
                  {t('modal_http_private_notice')}
                </p>
              )}

              <div className="modal-site-preview" aria-label={t('modal_preview_title')}>
                <span className="modal-site-preview-label">{t('modal_preview_title')}</span>
                <div className="modal-site-preview-card">
                  <span className="modal-site-preview-icon" aria-hidden="true">
                    <SiteIcon
                      site={preview_site}
                      catalog={icon_catalog}
                      globalStyle={icon_style}
                      hasFaviconPermission={has_favicon_permission}
                      compact
                    />
                  </span>
                  <span className="modal-site-preview-content">
                    <strong>{preview_name}</strong>
                    <small>{preview_url}</small>
                  </span>
                </div>
              </div>

              {duplicate_site && (
                <div className="modal-duplicate-decision">
                  <p className="modal-warning">{t('modal_duplicate_url')}</p>
                  <div
                    className="modal-duplicate-actions"
                    role="group"
                    aria-label={t('modal_duplicate_url')}
                  >
                    <button
                      type="button"
                      className={`modal-button modal-button--cancel${duplicate_decision === 'update' ? ' modal-button--selected' : ''}`}
                      aria-pressed={duplicate_decision === 'update'}
                      onClick={() => set_duplicate_decision('update')}
                    >
                      {t('modal_duplicate_update')}
                    </button>
                    <button
                      type="button"
                      className={`modal-button modal-button--cancel${duplicate_decision === 'add' ? ' modal-button--selected' : ''}`}
                      aria-pressed={duplicate_decision === 'add'}
                      onClick={() => set_duplicate_decision('add')}
                    >
                      {t('modal_duplicate_add_anyway')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-button modal-button--cancel"
              onClick={on_close}
              disabled={is_saving}
            >
              {t('modal_cancel')}
            </button>
            <button
              type="submit"
              className="modal-button modal-button--save"
              disabled={is_saving}
              aria-busy={is_saving}
            >
              {is_saving ? t('modal_saving') : t('modal_save')}
            </button>
          </div>
        </form>
      </div>
      {/* /.modal-dialog */}
    </div>
  );
}

export default SiteModal;
