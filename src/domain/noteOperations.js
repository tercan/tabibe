import { getNoteDisplayTitle } from './notePresentation.js';

function getSafeString(value) {
  return typeof value === 'string' ? value : '';
}

function getNoteSearchScore(note, query, tagNames, notebookNames) {
  if (!query) return 0;
  const displayTitle = getNoteDisplayTitle(note).toLocaleLowerCase();
  const content = getSafeString(note.content).toLocaleLowerCase();
  const relatedNames = [
    ...(note.tagIds || []).map((tagId) => tagNames.get(tagId) || ''),
    notebookNames.get(note.notebookId) || '',
  ]
    .join(' ')
    .toLocaleLowerCase();

  if (displayTitle === query) return 0;
  if (displayTitle.startsWith(query)) return 1;
  if (displayTitle.includes(query)) return 2;
  if (content.includes(query)) return 3;
  if (relatedNames.includes(query)) return 4;
  return 5;
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
    tagIds: [],
    notebookId: null,
    captureSessionId: null,
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    revision: 1,
    ...overrides,
  };
}

function isNoteEmpty(note) {
  if (!note) return true;
  return !getSafeString(note.title).trim() && !getSafeString(note.content).trim();
}

function getDateThreshold(dateRange, now) {
  if (dateRange === 'today') {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.getTime();
  }
  if (dateRange === '7-days') return new Date(now).getTime() - 7 * 24 * 60 * 60 * 1000;
  if (dateRange === '30-days') return new Date(now).getTime() - 30 * 24 * 60 * 60 * 1000;
  return null;
}

function filterNotes(notes, options = {}) {
  const {
    dateRange = 'all',
    noteTags = [],
    pinnedOnly = false,
    searchQuery = '',
    selectedTagIds = [],
    selectedNotebookId = null,
    showArchived = false,
    sortBy = 'updated-desc',
    now = new Date(),
  } = options;
  const query = searchQuery.trim().toLocaleLowerCase();
  const tagNames = new Map(noteTags.map((tag) => [tag.id, tag.name]));
  const notebookNames = new Map(
    (options.noteNotebooks || []).map((notebook) => [notebook.id, notebook.name]),
  );
  const dateThreshold = getDateThreshold(dateRange, now);

  return notes
    .filter((note) => !isNoteEmpty(note) && note.isArchived === showArchived)
    .filter((note) => !pinnedOnly || note.isPinned)
    .filter((note) => selectedNotebookId === null || note.notebookId === selectedNotebookId)
    .filter(
      (note) =>
        selectedTagIds.length === 0 || selectedTagIds.every((tagId) => note.tagIds.includes(tagId)),
    )
    .filter((note) => dateThreshold === null || new Date(note.updatedAt).getTime() >= dateThreshold)
    .filter((note) => {
      if (!query) return true;
      const noteTagNames = note.tagIds.map((tagId) => tagNames.get(tagId) || '').join(' ');
      const notebookName = notebookNames.get(note.notebookId) || '';
      return `${note.title} ${note.content} ${noteTagNames} ${notebookName}`
        .toLocaleLowerCase()
        .includes(query);
    })
    .sort((firstNote, secondNote) => {
      if (firstNote.isPinned !== secondNote.isPinned) return firstNote.isPinned ? -1 : 1;
      if (query) {
        const scoreDifference =
          getNoteSearchScore(firstNote, query, tagNames, notebookNames) -
          getNoteSearchScore(secondNote, query, tagNames, notebookNames);
        if (scoreDifference !== 0) return scoreDifference;
      }
      if (sortBy === 'title-asc') {
        return getNoteDisplayTitle(firstNote).localeCompare(
          getNoteDisplayTitle(secondNote),
          undefined,
          {
            sensitivity: 'base',
          },
        );
      }
      if (sortBy === 'created-desc') {
        return new Date(secondNote.createdAt).getTime() - new Date(firstNote.createdAt).getTime();
      }
      return new Date(secondNote.updatedAt).getTime() - new Date(firstNote.updatedAt).getTime();
    });
}

function updateNote(notes, noteId, patch, now = new Date().toISOString()) {
  return notes.map((note) =>
    note.id === noteId
      ? {
          ...note,
          ...patch,
          updatedAt: now,
          revision: Math.max(1, note.revision || 1) + 1,
        }
      : note,
  );
}

function updateNotes(notes, noteIds, patchFactory, now = new Date().toISOString()) {
  const selectedIds = new Set(noteIds);
  return notes.map((note) => {
    if (!selectedIds.has(note.id)) return note;
    const patch = typeof patchFactory === 'function' ? patchFactory(note) : patchFactory;
    return {
      ...note,
      ...patch,
      updatedAt: now,
      revision: Math.max(1, note.revision || 1) + 1,
    };
  });
}

function restoreNote(notes, note, index) {
  const nextNotes = [...notes];
  nextNotes.splice(Math.min(index, nextNotes.length), 0, note);
  return nextNotes;
}

function restoreNotes(notes, deletedItems) {
  return [...deletedItems]
    .sort((firstItem, secondItem) => firstItem.index - secondItem.index)
    .reduce((currentNotes, item) => restoreNote(currentNotes, item.note, item.index), notes);
}

export {
  createNote,
  filterNotes,
  getSafeString,
  isNoteEmpty,
  restoreNote,
  restoreNotes,
  updateNote,
  updateNotes,
};
