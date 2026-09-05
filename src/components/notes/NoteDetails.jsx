import { Eye, Pencil } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';
import NoteNotebookPicker from './NoteNotebookPicker.jsx';
import NoteTagPicker from './NoteTagPicker.jsx';

function NoteDetails({
  activeNote,
  isPreview,
  noteNotebooks,
  noteTags,
  onManageTags,
  onTogglePreview,
  onToggleTag,
  onUpdate,
}) {
  const { t } = useTranslation();
  const previewLabel = isPreview ? t('note_preview_hide') : t('note_preview_show');

  return (
    <div className="note-composer-details" role="group" aria-label={t('note_details')}>
      <div className="note-composer-details-row">
        <div className="note-composer-details-group note-composer-details-group--metadata">
          <NoteNotebookPicker
            activeNote={activeNote}
            noteNotebooks={noteNotebooks}
            onChange={(notebookId) => onUpdate('notebookId', notebookId)}
          />
          <NoteTagPicker
            activeNote={activeNote}
            noteTags={noteTags}
            onManageTags={onManageTags}
            onToggleTag={onToggleTag}
          />
        </div>
        <div className="note-composer-details-group note-composer-details-group--view">
          <button
            className="notes-button notes-button--icon note-composer-preview-toggle"
            type="button"
            aria-label={previewLabel}
            aria-pressed={isPreview}
            title={previewLabel}
            onClick={onTogglePreview}
          >
            {isPreview ? <Pencil aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
      </div>
      {/* /.note-composer-details */}
    </div>
  );
}

export default NoteDetails;
