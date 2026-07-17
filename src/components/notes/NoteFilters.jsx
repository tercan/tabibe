import { useTranslation } from '../../hooks/useTranslation.js';

function NoteFilters({
  dateRange,
  noteTags,
  onChangeDateRange,
  onChangeSort,
  onClear,
  onManageTags,
  onTogglePinned,
  onToggleTag,
  pinnedOnly,
  resultCount,
  selectedTagIds,
  sortBy,
}) {
  const { t } = useTranslation();
  const hasActiveFilters = pinnedOnly || dateRange !== 'all' || selectedTagIds.length > 0;

  return (
    <div className="note-filter-bar">
      <details className="note-filter-menu">
        <summary className="note-filter-control">
          {t('note_filter_tags')}
          {selectedTagIds.length > 0 && (
            <span className="note-filter-count">{selectedTagIds.length}</span>
          )}
        </summary>
        <div className="note-filter-menu-content">
          {noteTags.length > 0 ? (
            noteTags.map((tag) => (
              <label className="note-filter-checkbox" key={tag.id}>
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => onToggleTag(tag.id)}
                />
                <span className={`note-tag-dot note-tag-dot--${tag.colorToken}`} />
                <span>{tag.name}</span>
              </label>
            ))
          ) : (
            <p className="note-filter-empty">{t('note_tag_empty')}</p>
          )}
          {hasActiveFilters && (
            <button className="note-filter-menu-action" type="button" onClick={onClear}>
              {t('note_clear_filters')}
            </button>
          )}
          <button className="note-filter-menu-action" type="button" onClick={onManageTags}>
            {t('note_manage_tags')}
          </button>
        </div>
      </details>

      <label className="note-filter-select">
        <span className="visually-hidden">{t('note_filter_date')}</span>
        <select value={dateRange} onChange={(event) => onChangeDateRange(event.target.value)}>
          <option value="all">{t('note_date_all')}</option>
          <option value="today">{t('note_date_today')}</option>
          <option value="7-days">{t('note_date_7_days')}</option>
          <option value="30-days">{t('note_date_30_days')}</option>
        </select>
      </label>

      <label className="note-filter-select">
        <span className="visually-hidden">{t('note_sort_label')}</span>
        <select value={sortBy} onChange={(event) => onChangeSort(event.target.value)}>
          <option value="updated-desc">{t('note_sort_updated')}</option>
          <option value="created-desc">{t('note_sort_created')}</option>
          <option value="title-asc">{t('note_sort_title')}</option>
        </select>
      </label>

      <button
        className={`note-filter-control ${pinnedOnly ? 'note-filter-control--active' : ''}`}
        type="button"
        aria-pressed={pinnedOnly}
        onClick={onTogglePinned}
      >
        {t('note_filter_pinned')}
      </button>

      {hasActiveFilters && (
        <button className="note-filter-clear" type="button" onClick={onClear}>
          {t('note_clear_filters')}
        </button>
      )}

      <p className="note-result-count" role="status" aria-live="polite">
        {t('note_result_count', { count: resultCount })}
      </p>
    </div>
  );
}

export default NoteFilters;
