import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';

/**
 * 1. Storage helpers for notes
 */

const NOTE_STORAGE_KEY = 'tabibe-note';

function load_note() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([NOTE_STORAGE_KEY], (result) => {
        resolve(result[NOTE_STORAGE_KEY] || '');
      });
    });
  }
  return Promise.resolve(localStorage.getItem(NOTE_STORAGE_KEY) || '');
}

function save_note(text) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ [NOTE_STORAGE_KEY]: text });
  } else {
    localStorage.setItem(NOTE_STORAGE_KEY, text);
  }
}

/**
 * 2. Icons
 */

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v8M9 4h6M12 10c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6zM12 16v6M10 22h4" />
    </svg>
  );
}

/**
 * 3. NotePanel component
 */

function NotePanel({ is_open, is_pinned, on_close, on_toggle_pin }) {
  const { t } = useTranslation();
  const [note, set_note] = useState('');
  const [is_loaded, set_is_loaded] = useState(false);
  const save_timer = useRef(null);

  useEffect(() => {
    load_note().then((saved) => {
      set_note(saved);
      set_is_loaded(true);
    });
  }, []);

  function handle_change(event) {
    const value = event.target.value;
    set_note(value);

    if (save_timer.current) {
      clearTimeout(save_timer.current);
    }
    save_timer.current = setTimeout(() => {
      save_note(value);
    }, 500);
  }

  if (!is_loaded) return null;
  if (!is_open && !is_pinned) return null;

  return (
    <>
      {!is_pinned && is_open && (
        <div className="settings-overlay" onClick={on_close} aria-hidden="true" />
      )}
      <aside 
        className={`note-panel ${is_pinned ? 'note-panel--pinned' : ''} ${is_open ? 'note-panel--open' : ''}`}
        role="dialog"
        aria-label={t('note_aria_label')}
      >
        <header className="note-panel-header">
          <h2 className="note-panel-title">{t('note_aria_label')}</h2>
          <div className="note-panel-actions">
            <button 
              className={`note-panel-button ${is_pinned ? 'note-panel-button--active' : ''}`}
              onClick={on_toggle_pin}
              aria-label={t('note_pin')}
              title={t('note_pin')}
            >
              <PinIcon />
            </button>
            {!is_pinned && (
              <button 
                className="note-panel-button" 
                onClick={on_close}
                aria-label={t('modal_cancel')}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </header>
        <div className="note-panel-body">
          <textarea
            className="note-panel-textarea"
            value={note}
            onChange={handle_change}
            placeholder={t('note_placeholder')}
            aria-label={t('note_aria_label')}
          />
        </div>
        {/* /.note-panel */}
      </aside>
    </>
  );
}

export default NotePanel;
