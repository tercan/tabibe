import { ArrowUpDown, ListFilter, Search } from 'lucide-react';
import { useRef } from 'react';
import useDismissibleMenus from '../../hooks/useDismissibleMenus.js';
import { useTranslation } from '../../hooks/useTranslation.js';

function NoteListToolbar({ filterContent, hasFilters, onSearchChange, searchQuery, sortContent }) {
  const { t } = useTranslation();
  const toolbarRef = useRef(null);
  useDismissibleMenus(toolbarRef);

  return (
    <div className="notes-list-controls" ref={toolbarRef}>
      <div className="notes-list-toolbar" role="group" aria-label={t('note_list_label')}>
        <details
          className="notes-menu-anchor notes-list-toolbar-menu notes-list-toolbar-menu--filter"
          data-active={hasFilters ? 'true' : 'false'}
          data-dismissible-menu
        >
          <summary
            className="notes-button"
            role="button"
            aria-label={t('note_filter_label')}
            title={t('note_filter_label')}
          >
            <ListFilter aria-hidden="true" />
            <span>{t('note_filter_label')}</span>
          </summary>
          {filterContent}
        </details>

        <details
          className="notes-menu-anchor notes-list-toolbar-menu notes-list-toolbar-menu--sort"
          data-dismissible-menu
        >
          <summary
            className="notes-button"
            role="button"
            aria-label={t('note_sort_label')}
            title={t('note_sort_label')}
          >
            <ArrowUpDown aria-hidden="true" />
            <span>{t('note_sort_label')}</span>
          </summary>
          {sortContent}
        </details>
      </div>
      {/* /.notes-list-toolbar */}

      <label className="notes-list-search-wrap">
        <Search aria-hidden="true" />
        <span className="visually-hidden">{t('note_search_label')}</span>
        <input
          className="notes-list-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('note_search_placeholder')}
          autoComplete="off"
        />
      </label>
      {/* /.notes-list-search-wrap */}
      {/* /.notes-list-controls */}
    </div>
  );
}

export default NoteListToolbar;
