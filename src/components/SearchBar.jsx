import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { SEARCH_ENGINES } from './SettingsPanel.jsx';

/**
 * 1. Search icon SVG component
 */

function SearchIcon() {
  return (
    <svg
      className="search-bar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * 2. SearchBar component
 */

function SearchBar({ search_engine }) {
  const [query, set_query] = useState('');
  const { t } = useTranslation();

  const engine = SEARCH_ENGINES.find((e) => e.id === search_engine) || SEARCH_ENGINES[0];
  const placeholder = t('search_placeholder_dynamic', { engine: engine.name });

  function handle_submit(event) {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    const search_url = `${engine.url}${encodeURIComponent(trimmed)}`;
    window.location.href = search_url;
  }

  return (
    <section className="search-bar" aria-label={t('search_aria_label')}>
      <form className="search-bar-form" onSubmit={handle_submit} role="search">
        <SearchIcon />
        <label htmlFor="search-input" className="visually-hidden">{t('search_label')}</label>
        <input
          id="search-input"
          className="search-bar-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => set_query(e.target.value)}
          autoComplete="off"
        />
      </form>
      {/* /.search-bar-form */}
      {/* /.search-bar */}
    </section>
  );
}

export default SearchBar;
