import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';

/**
 * 1. SiteModal component — add/edit speed dial sites and folders
 */

function SiteModal({ site, mode = 'site', on_save, on_close }) {
  const { t } = useTranslation();
  const is_folder = mode === 'folder';
  const [name, set_name] = useState(site ? site.name : '');
  const [url, set_url] = useState(site ? site.url : '');
  const [icon_slug, set_icon_slug] = useState(site ? (site.icon_slug || '') : '');
  const [error, set_error] = useState('');
  const name_ref = useRef(null);
  const overlay_ref = useRef(null);
  const is_edit = !!site;

  useEffect(() => {
    if (name_ref.current) {
      name_ref.current.focus();
    }
  }, []);

  useEffect(() => {
    function handle_keydown(event) {
      if (event.key === 'Escape') {
        on_close();
      }
    }

    document.addEventListener('keydown', handle_keydown);
    document.body.classList.add('no-scroll');

    return () => {
      document.removeEventListener('keydown', handle_keydown);
      document.body.classList.remove('no-scroll');
    };
  }, [on_close]);

  function handle_overlay_click(event) {
    if (event.target === overlay_ref.current) {
      on_close();
    }
  }

  function validate_url(value) {
    try {
      const parsed = new URL(value);
      const allowed_protocols = ['http:', 'https:', 'chrome:', 'edge:', 'about:'];
      return allowed_protocols.includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function get_title() {
    if (is_folder) {
      return is_edit ? t('modal_title_edit_folder') : t('modal_title_add_folder');
    }
    return is_edit ? t('modal_title_edit') : t('modal_title_add');
  }

  function handle_submit(event) {
    event.preventDefault();

    const trimmed_name = name.trim();

    if (!trimmed_name) {
      set_error(t('modal_error_name'));
      return;
    }

    // Folder mode: only name is needed
    if (is_folder) {
      set_error('');
      on_save({ name: trimmed_name });
      return;
    }

    const trimmed_url = url.trim();
    const trimmed_slug = icon_slug.trim();

    if (!trimmed_url) {
      set_error(t('modal_error_url'));
      return;
    }

    let final_url = trimmed_url;
    const has_valid_protocol = /^(https?|chrome|edge|about):\/\//i.test(final_url) || final_url.startsWith('about:');
    
    if (!has_valid_protocol) {
      final_url = `https://${final_url}`;
    }

    if (!validate_url(final_url)) {
      set_error(t('modal_error_url_invalid'));
      return;
    }

    set_error('');

    // Auto-derive icon slug from domain only for new sites
    let final_slug = trimmed_slug;
    if (!final_slug && !is_edit) {
      try {
        const domain = new URL(final_url).hostname;
        final_slug = domain.replace(/^www\./, '').split('.')[0].toLowerCase();
      } catch {
        final_slug = '';
      }
    }

    on_save({
      name: trimmed_name,
      url: final_url,
      icon_slug: final_slug,
    });
  }

  return (
    <div
      className="modal-overlay"
      ref={overlay_ref}
      onClick={handle_overlay_click}
      role="dialog"
      aria-modal="true"
      aria-label={get_title()}
    >
      <div className="modal-dialog">
        <h2 className="modal-title">{get_title()}</h2>
        <form className="modal-form" onSubmit={handle_submit}>
          <div className="modal-field">
            <label htmlFor="site-name" className="modal-label">
              {t('modal_label_name')}
            </label>
            <input
              id="site-name"
              ref={name_ref}
              className="modal-input"
              type="text"
              value={name}
              onChange={(e) => set_name(e.target.value)}
              placeholder={is_folder ? t('modal_placeholder_folder') : 'Google'}
              autoComplete="off"
            />
          </div>
          {!is_folder && (
            <>
              <div className="modal-field">
                <label htmlFor="site-url" className="modal-label">
                  {t('modal_label_url')}
                </label>
                <input
                  id="site-url"
                  className="modal-input"
                  type="text"
                  value={url}
                  onChange={(e) => set_url(e.target.value)}
                  placeholder="https://www.google.com"
                  autoComplete="off"
                />
              </div>
              <div className="modal-field">
                <label htmlFor="site-icon" className="modal-label">
                  {t('modal_label_icon')}
                </label>
                <input
                  id="site-icon"
                  className="modal-input"
                  type="text"
                  value={icon_slug}
                  onChange={(e) => set_icon_slug(e.target.value)}
                  placeholder="google"
                  autoComplete="off"
                />
              </div>
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
