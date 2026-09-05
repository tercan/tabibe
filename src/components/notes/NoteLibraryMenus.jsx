import { Archive, Check, List, NotebookPen, Pin, Tags } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';

function closeMenu(event) {
  const menu = event.currentTarget.closest('details');
  if (!menu) return;
  menu.removeAttribute('open');
  menu.querySelector(':scope > summary')?.focus({ preventScroll: true });
}

function NoteFilterContent({
  hasFilters,
  noteScope,
  noteNotebooks,
  onClear,
  onSelectNotebook,
  onSelectScope,
  selectedNotebookId,
}) {
  const { t } = useTranslation();
  const scopeOptions = [
    { icon: List, label: t('note_all_notes'), value: 'all' },
    { icon: Pin, label: t('note_filter_pinned'), value: 'pinned' },
    { icon: Archive, label: t('note_filter_archived'), value: 'archived' },
  ];

  return (
    <div className="notes-filter-popover" role="group" aria-label={t('note_filter_label')}>
      <div className="notes-filter-scopes">
        {scopeOptions.map(({ icon: ScopeIcon, label, value }) => (
          <button
            className="notes-button"
            type="button"
            key={value}
            aria-pressed={noteScope === value}
            onClick={(event) => {
              onSelectScope(value);
              closeMenu(event);
            }}
          >
            <ScopeIcon aria-hidden="true" />
            <span>{label}</span>
            {noteScope === value && <Check aria-hidden="true" />}
          </button>
        ))}
      </div>

      {noteNotebooks.length > 0 && (
        <label className="notes-filter-field">
          <span>{t('note_notebooks_section')}</span>
          <select
            value={selectedNotebookId || ''}
            onChange={(event) => {
              onSelectNotebook(event.target.value || null);
              closeMenu(event);
            }}
          >
            <option value="">{t('note_all_notebooks')}</option>
            {noteNotebooks.map((notebook) => (
              <option key={notebook.id} value={notebook.id}>
                {notebook.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {hasFilters && (
        <button
          className="notes-button notes-filter-clear"
          type="button"
          onClick={(event) => {
            onClear();
            closeMenu(event);
          }}
        >
          {t('note_clear_filters')}
        </button>
      )}
    </div>
  );
}

function NoteSortContent({ onChangeSort, sortBy }) {
  const { t } = useTranslation();
  const options = [
    { value: 'updated-desc', label: t('note_sort_updated') },
    { value: 'created-desc', label: t('note_sort_created') },
    { value: 'title-asc', label: t('note_sort_title') },
  ];

  return (
    <div
      className="notes-overflow-menu notes-sort-popover"
      role="group"
      aria-label={t('note_sort_label')}
    >
      <p className="notes-menu-heading">{t('note_sort_label')}</p>
      {options.map((option) => (
        <button
          className="notes-button"
          type="button"
          key={option.value}
          aria-pressed={sortBy === option.value}
          onClick={(event) => {
            onChangeSort(option.value);
            closeMenu(event);
          }}
        >
          <span>{option.label}</span>
          {sortBy === option.value && <Check aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}

function NoteMoreContent({ onManageNotebooks, onManageTags }) {
  const { t } = useTranslation();

  return (
    <div className="notes-overflow-menu" role="group" aria-label={t('note_more_actions')}>
      <button
        className="notes-button"
        type="button"
        onClick={(event) => {
          onManageNotebooks();
          closeMenu(event);
        }}
      >
        <NotebookPen aria-hidden="true" />
        <span>{t('note_manage_notebooks')}</span>
      </button>
      <button
        className="notes-button"
        type="button"
        onClick={(event) => {
          onManageTags();
          closeMenu(event);
        }}
      >
        <Tags aria-hidden="true" />
        <span>{t('note_manage_tags')}</span>
      </button>
    </div>
  );
}

export { NoteFilterContent, NoteMoreContent, NoteSortContent };
