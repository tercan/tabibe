import { formatNoteRelativeTime, getNoteDisplayTitle } from '../../domain/notePresentation.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import NoteListItem from './NoteListItem.jsx';

function NoteGroup({
  groupId,
  heading,
  locale,
  noteNotebooks,
  notes,
  onOpenNote,
  selectedNoteId,
  t,
}) {
  if (notes.length === 0) return null;

  return (
    <section className="notes-list-section" aria-labelledby={groupId}>
      <h4 className="notes-list-section-title" id={groupId}>
        {heading}
      </h4>
      <ul className="notes-list-section-items" role="list">
        {notes.map((note) => (
          <NoteListItem
            key={note.id}
            displayTitle={getNoteDisplayTitle(note, t('note_untitled'))}
            isActive={selectedNoteId === note.id}
            notebookName={
              noteNotebooks.find((notebook) => notebook.id === note.notebookId)?.name ||
              t('note_notebook_none')
            }
            noteId={note.id}
            onOpen={onOpenNote}
            relativeTime={formatNoteRelativeTime(note.updatedAt, { locale })}
            updatedAt={note.updatedAt}
          />
        ))}
      </ul>
    </section>
  );
}

function NoteListPane({
  activeNoteId,
  emptyActionLabel,
  emptyMessage,
  groups,
  noteNotebooks = [],
  onCreate,
  onOpenNote,
  toolbar = null,
}) {
  const { locale, t } = useTranslation();
  const pinnedNotes = groups?.pinnedNotes || groups?.pinned || [];
  const recentNotes = groups?.recentNotes || groups?.recent || [];
  const resultCount = pinnedNotes.length + recentNotes.length;
  const headingId = 'note-list-pane-heading';
  const isEmpty = resultCount === 0;

  return (
    <section className="notes-list-pane" aria-labelledby={headingId}>
      <h3 className="visually-hidden" id={headingId}>
        {groups?.heading || t('note_list_label')}
      </h3>

      {toolbar}

      {isEmpty ? (
        <div className="notes-empty" role="status">
          <p>{emptyMessage}</p>
          {emptyActionLabel && onCreate && (
            <button className="notes-button notes-button--primary" type="button" onClick={onCreate}>
              {emptyActionLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="notes-list" aria-labelledby={headingId}>
          <NoteGroup
            groupId={`${headingId}-pinned`}
            heading={groups?.pinnedHeading || t('note_filter_pinned')}
            locale={locale}
            noteNotebooks={noteNotebooks}
            notes={pinnedNotes}
            onOpenNote={onOpenNote}
            selectedNoteId={activeNoteId}
            t={t}
          />
          <NoteGroup
            groupId={`${headingId}-recent`}
            heading={groups?.recentHeading || t('note_sort_updated')}
            locale={locale}
            noteNotebooks={noteNotebooks}
            notes={recentNotes}
            onOpenNote={onOpenNote}
            selectedNoteId={activeNoteId}
            t={t}
          />
        </div>
      )}
    </section>
  );
}

export default NoteListPane;
