import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { get_daily_quote } from '../data/quotes.js';

const APP_VERSION = '0.1.0';

/**
 * 1. SVG icon components
 */

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconStyleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/**
 * 2. Footer component
 */

function Footer({ theme, on_toggle_theme, icon_style, on_toggle_icon_style, on_open_settings, on_open_notes, show_memory }) {
  const { t, locale } = useTranslation();
  const [tab_count, set_tab_count] = useState(0);
  const [window_count, set_window_count] = useState(0);
  const [memory_info, set_memory_info] = useState(null);
  const quote = get_daily_quote(locale);

  useEffect(() => {
    function update_counts() {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({}, (tabs) => {
          if (chrome.runtime.lastError) return;
          set_tab_count(tabs.length);
        });
        chrome.windows.getAll({}, (windows) => {
          if (chrome.runtime.lastError) return;
          set_window_count(windows.length);
        });
      }

      if (show_memory && typeof chrome !== 'undefined' && chrome.system && chrome.system.memory) {
        chrome.system.memory.getInfo((info) => {
          if (chrome.runtime.lastError) return;
          const used_gb = ((info.capacity - info.availableCapacity) / (1024 ** 3)).toFixed(1);
          const total_gb = (info.capacity / (1024 ** 3)).toFixed(0);
          set_memory_info(`${used_gb}/${total_gb} GB`);
        });
      } else if (!show_memory) {
        set_memory_info(null);
      }
    }

    update_counts();

    // Refresh counts every 30 seconds
    let interval_id = setInterval(update_counts, 30000);

    // Pause polling when tab is hidden
    function handle_visibility() {
      if (document.hidden) {
        clearInterval(interval_id);
        interval_id = null;
      } else {
        update_counts();
        interval_id = setInterval(update_counts, 30000);
      }
    }

    document.addEventListener('visibilitychange', handle_visibility);

    return () => {
      if (interval_id) clearInterval(interval_id);
      document.removeEventListener('visibilitychange', handle_visibility);
    };
  }, [show_memory]);

  return (
    <footer className="footer">
      <div className="footer-left">
        {tab_count > 0 && (
          <span className="footer-tabs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 8h18" />
              <path d="M9 4v4" />
            </svg>
            {tab_count}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="16" height="14" rx="2" />
              <rect x="6" y="2" width="16" height="14" rx="2" />
            </svg>
            {window_count}
          </span>
        )}
        {memory_info && (
          <span className="footer-tabs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 6V4" />
              <path d="M10 6V4" />
              <path d="M14 6V4" />
              <path d="M18 6V4" />
              <path d="M6 18v2" />
              <path d="M10 18v2" />
              <path d="M14 18v2" />
              <path d="M18 18v2" />
            </svg>
            {memory_info}
          </span>
        )}
      </div>
      {/* /.footer-left */}

      <div className="footer-center">
        <blockquote className="footer-quote">
          <p className="footer-quote-text">&ldquo;{quote.text}&rdquo;</p>
          <cite className="footer-quote-author">&mdash; {quote.author}</cite>
        </blockquote>
      </div>
      {/* /.footer-center */}

      <div className="footer-right">
        <button
          className="footer-button"
          onClick={on_toggle_icon_style}
          aria-label={t('footer_icon_style')}
          title={t('footer_icon_style')}
        >
          <IconStyleIcon />
        </button>
        <button
          className="footer-button"
          onClick={on_toggle_theme}
          aria-label={t('footer_theme_toggle')}
          title={t('footer_theme_toggle')}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          className="footer-button"
          onClick={on_open_notes}
          aria-label={t('note_aria_label')}
          title={t('note_aria_label')}
        >
          <NoteIcon />
        </button>
        <button
          className="footer-button"
          onClick={on_open_settings}
          aria-label={t('footer_settings')}
          title={t('footer_settings')}
        >
          <SettingsIcon />
        </button>
      </div>
      {/* /.footer-right */}
      {/* /.footer */}
    </footer>
  );
}

export default Footer;
