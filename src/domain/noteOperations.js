function getSafeString(value) {
  return typeof value === 'string' ? value : '';
}

function createNote(
  overrides = {},
  idFactory = () => crypto.randomUUID(),
  now = new Date().toISOString(),
) {
  return {
    id: idFactory(),
    title: '',
    content: '',
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function isNoteEmpty(note) {
  if (!note) return true;
  return !getSafeString(note.title).trim() && !getSafeString(note.content).trim();
}

function filterNotes(notes, searchQuery, showArchived) {
  const query = searchQuery.trim().toLowerCase();

  return notes
    .filter((note) => !isNoteEmpty(note) && note.isArchived === showArchived)
    .filter((note) => {
      if (!query) return true;
      return `${note.title} ${note.content}`.toLowerCase().includes(query);
    })
    .sort((firstNote, secondNote) => {
      if (firstNote.isPinned !== secondNote.isPinned) return firstNote.isPinned ? -1 : 1;
      return new Date(secondNote.updatedAt).getTime() - new Date(firstNote.updatedAt).getTime();
    });
}

function updateNote(notes, noteId, patch, now = new Date().toISOString()) {
  return notes.map((note) => (note.id === noteId ? { ...note, ...patch, updatedAt: now } : note));
}

function restoreNote(notes, note, index) {
  const nextNotes = [...notes];
  nextNotes.splice(Math.min(index, nextNotes.length), 0, note);
  return nextNotes;
}

export { createNote, filterNotes, getSafeString, isNoteEmpty, restoreNote, updateNote };
