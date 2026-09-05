import { ArrowUpDown, Check, Pin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';
import NoteNotebooks from './NoteNotebooks.jsx';

function closeParentMenu(event) {
  event.currentTarget.closest('details')?.removeAttribute('open');
}

function NoteFilters({
  activeNoteCount,
  archivedNoteCount,
  noteNotebooks,
  noteTags,
  notes,
  onChangeSort,
  onManageNotebooks,
  onManageTags,
  onReorderNotebooks,
  onSelectAll,
  onSelectArchive,
  onSelectNotebook,
  onSelectTag,
  onTogglePinned,
  pinnedOnly,
  resultCount,
  selectedNotebookId,
  selectedTagIds,
  showArchived,
  sortBy,
}) {
  const { t } = useTranslation();
  const sortOptions = [
    { value: 'updated-desc', label: t('note_sort_updated') },
    { value: 'created-desc', label: t('note_sort_created') },
    { value: 'title-asc', label: t('note_sort_title') },
  ];
  const activeSortLabel = sortOptions.find((option) => option.value === sortBy)?.label;

  return (
    <div className="note-filter-bar">
      <NoteNotebooks
        compact
        activeNoteCount={activeNoteCount}
        archivedNoteCount={archivedNoteCount}
        noteNotebooks={noteNotebooks}
        noteTags={noteTags}
        notes={notes}
        onManageNotebooks={onManageNotebooks}
        onManageTags={onManageTags}
        onReorderNotebooks={onReorderNotebooks}
        onSelectAll={onSelectAll}
        onSelectArchive={onSelectArchive}
        onSelectNotebook={onSelectNotebook}
        onSelectTag={onSelectTag}
        selectedNotebookId={selectedNotebookId}
        selectedTagIds={selectedTagIds}
        showArchived={showArchived}
      />

      <details className="note-filter-menu note-sort-menu">
        <summary
          className="note-filter-icon-button"
          aria-label={t('note_sort_label')}
          title={t('note_sort_label')}
        >
          <ArrowUpDown aria-hidden="true" />
          <span className="visually-hidden">{activeSortLabel}</span>
        </summary>
        <div className="note-filter-menu-content note-sort-menu-content">
          {sortOptions.map((option) => (
            <button
              className={`note-sort-option ${sortBy === option.value ? 'note-sort-option--active' : ''}`}
              type="button"
              aria-pressed={sortBy === option.value}
              key={option.value}
              onClick={(event) => {
                onChangeSort(option.value);
                closeParentMenu(event);
              }}
            >
              <span>{option.label}</span>
              {sortBy === option.value && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>
      </details>

      <button
        className={`note-filter-icon-button ${pinnedOnly ? 'note-filter-icon-button--active' : ''}`}
        type="button"
        aria-label={t('note_filter_pinned')}
        aria-pressed={pinnedOnly}
        title={t('note_filter_pinned')}
        onClick={onTogglePinned}
      >
        <Pin aria-hidden="true" />
      </button>

      <p className="note-result-count" role="status" aria-live="polite">
        {t('note_result_count', { count: resultCount })}
      </p>
    </div>
  );
}

export default NoteFilters;
