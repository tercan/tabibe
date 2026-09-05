import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import { SEARCH_ENGINES } from '../config/searchEngines.js';
import { submitSearch } from '../lib/search.js';

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
  const [hasError, setHasError] = useState(false);
  const { t } = useTranslation();

  const engine = SEARCH_ENGINES.find((e) => e.id === search_engine) || SEARCH_ENGINES[0];
  const placeholder =
    engine.id === 'browser'
      ? t('search_browser_placeholder')
      : t('search_placeholder_dynamic', { engine: engine.name });

  async function handle_submit(event) {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    setHasError(false);
    try {
      await submitSearch(trimmed, engine.id);
    } catch {
      setHasError(true);
    }
  }

  return (
    <section className="search-bar" aria-label={t('search_aria_label')}>
      <form className="search-bar-form" onSubmit={handle_submit} role="search">
        <SearchIcon />
        <label htmlFor="search-input" className="visually-hidden">
          {t('search_label')}
        </label>
        <input
          id="search-input"
          className="search-bar-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => set_query(e.target.value)}
          autoComplete="off"
          aria-describedby={hasError ? 'search-error' : undefined}
        />
      </form>
      {/* /.search-bar-form */}
      {hasError && (
        <p id="search-error" role="alert">
          {t('search_browser_error')}
        </p>
      )}
      {/* /.search-bar */}
    </section>
  );
}

export default SearchBar;
