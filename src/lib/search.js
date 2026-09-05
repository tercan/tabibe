import { SEARCH_ENGINES } from '../config/searchEngines.js';

async function submitSearch(query, engineId = 'browser') {
  const text = query.trim();
  if (!text) return;
  const engine = SEARCH_ENGINES.find((item) => item.id === engineId) || SEARCH_ENGINES[0];
  if (engine.id === 'browser') {
    if (!globalThis.chrome?.search?.query) throw new Error('browser_search_unavailable');
    await new Promise((resolve, reject) => {
      chrome.search.query({ text, disposition: 'CURRENT_TAB' }, () => {
        const error = chrome.runtime.lastError;
        if (error) reject(new Error(error.message));
        else resolve();
      });
    });
    return;
  }
  window.location.assign(`${engine.url}${encodeURIComponent(text)}`);
}

export { submitSearch };
