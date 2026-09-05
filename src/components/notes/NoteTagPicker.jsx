import { Tags } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';

function NoteTagPicker({ activeNote, noteTags, onManageTags, onToggleTag }) {
  const { t } = useTranslation();

  return (
    <div className="note-tag-picker" aria-label={t('note_tags_label')}>
      <div className="note-tag-picker-list">
        {noteTags.map((tag) => (
          <button
            className={`note-tag-chip note-tag-chip--${tag.colorToken}`}
            type="button"
            key={tag.id}
            aria-pressed={activeNote.tagIds.includes(tag.id)}
            onClick={() => onToggleTag(activeNote.id, tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
      <button
        className="notes-button notes-button--icon note-tag-manage-button"
        type="button"
        onClick={onManageTags}
        aria-label={t('note_manage_tags')}
        title={t('note_manage_tags')}
      >
        <Tags aria-hidden="true" />
      </button>
    </div>
  );
}

export default NoteTagPicker;
