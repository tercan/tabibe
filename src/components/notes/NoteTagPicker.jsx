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
      <button className="note-tag-manage-button" type="button" onClick={onManageTags}>
        {t('note_manage_tags')}
      </button>
    </div>
  );
}

export default NoteTagPicker;
