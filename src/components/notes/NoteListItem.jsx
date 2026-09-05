function NoteListItem({
  displayTitle,
  isActive = false,
  notebookName,
  noteId,
  onOpen,
  relativeTime,
  updatedAt,
}) {
  return (
    <li className="notes-list-item">
      <button
        className="notes-list-item-button"
        type="button"
        onClick={() => onOpen(noteId)}
        aria-current={isActive ? 'true' : undefined}
      >
        <span className="notes-list-item-title">{displayTitle}</span>
        <span className="notes-list-item-meta">
          <span className="notes-list-item-notebook">{notebookName}</span>
          {relativeTime && <time dateTime={updatedAt}>{relativeTime}</time>}
        </span>
      </button>
    </li>
  );
}

export default NoteListItem;
