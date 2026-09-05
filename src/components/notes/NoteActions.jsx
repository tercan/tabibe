import { Archive, Copy, Pin, PinOff, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';

function NoteActions({ activeNote, onCopy, onRequestDelete, onToggleArchive, onTogglePin }) {
  const { t } = useTranslation();
  const pinLabel = activeNote.isPinned ? t('note_unpin_item') : t('note_pin_item');
  const archiveLabel = activeNote.isArchived ? t('note_restore_item') : t('note_archive_item');

  return (
    <div className="note-composer-actions" role="group" aria-label={t('note_actions_label')}>
      <button
        className="notes-button notes-button--icon"
        type="button"
        aria-label={pinLabel}
        aria-pressed={activeNote.isPinned}
        title={pinLabel}
        onClick={onTogglePin}
      >
        {activeNote.isPinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
      </button>
      <button
        className="notes-button notes-button--icon"
        type="button"
        aria-label={archiveLabel}
        title={archiveLabel}
        onClick={onToggleArchive}
      >
        {activeNote.isArchived ? <RotateCcw aria-hidden="true" /> : <Archive aria-hidden="true" />}
      </button>
      <button
        className="notes-button notes-button--icon"
        type="button"
        aria-label={t('note_copy_content')}
        title={t('note_copy_content')}
        onClick={() => void onCopy()}
      >
        <Copy aria-hidden="true" />
      </button>
      <button
        className="notes-button notes-button--icon notes-button--danger"
        type="button"
        aria-label={t('note_delete_item')}
        title={t('note_delete_item')}
        onClick={onRequestDelete}
      >
        <Trash2 aria-hidden="true" />
      </button>
      {/* /.note-composer-actions */}
    </div>
  );
}

export default NoteActions;
