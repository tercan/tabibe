import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';

function NoteBulkActions({
  allVisibleSelected,
  noteTags,
  onArchive,
  onCancel,
  onDelete,
  onSelectAll,
  onTag,
  selectedCount,
  showArchived,
}) {
  const { t } = useTranslation();
  const [tagId, setTagId] = useState('');
  const hasSelection = selectedCount > 0;

  return (
    <div className="note-bulk-actions" role="toolbar" aria-label={t('note_bulk_toolbar')}>
      <label className="note-bulk-select-all">
        <input type="checkbox" checked={allVisibleSelected} onChange={onSelectAll} />
        <span>{t('note_select_all')}</span>
      </label>
      <span className="note-bulk-count">{t('note_selected_count', { count: selectedCount })}</span>
      <label className="note-bulk-tag-select">
        <span className="visually-hidden">{t('note_bulk_tag_label')}</span>
        <select value={tagId} onChange={(event) => setTagId(event.target.value)}>
          <option value="">{t('note_bulk_tag_placeholder')}</option>
          {noteTags.map((tag) => (
            <option value={tag.id} key={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </label>
      <button
        className="note-bulk-button"
        type="button"
        disabled={!hasSelection || !tagId}
        onClick={() => onTag(tagId, true)}
      >
        {t('note_bulk_tag_add')}
      </button>
      <button
        className="note-bulk-button"
        type="button"
        disabled={!hasSelection || !tagId}
        onClick={() => onTag(tagId, false)}
      >
        {t('note_bulk_tag_remove')}
      </button>
      <button
        className="note-bulk-button"
        type="button"
        disabled={!hasSelection}
        onClick={onArchive}
      >
        {showArchived ? t('note_bulk_restore') : t('note_bulk_archive')}
      </button>
      <button
        className="note-bulk-button note-bulk-button--danger"
        type="button"
        disabled={!hasSelection}
        onClick={onDelete}
      >
        {t('note_bulk_delete')}
      </button>
      <button className="note-bulk-button" type="button" onClick={onCancel}>
        {t('modal_cancel')}
      </button>
    </div>
  );
}

export default NoteBulkActions;
