const MAX_NOTEBOOKS = 100;
const MAX_NOTEBOOK_NAME_LENGTH = 40;

function normalizeNotebookName(name) {
  return typeof name === 'string' ? name.trim() : '';
}

function createNoteNotebook(
  notebooks,
  name,
  idFactory = () => crypto.randomUUID(),
  now = new Date().toISOString(),
) {
  const normalizedName = normalizeNotebookName(name);
  if (!normalizedName) return { error: 'required', notebooks };
  if (normalizedName.length > MAX_NOTEBOOK_NAME_LENGTH) {
    return { error: 'too_long', notebooks };
  }
  if (
    notebooks.some(
      (notebook) => notebook.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
    )
  ) {
    return { error: 'duplicate', notebooks };
  }
  if (notebooks.length >= MAX_NOTEBOOKS) return { error: 'limit', notebooks };

  const notebook = {
    id: idFactory(),
    name: normalizedName,
    createdAt: now,
    updatedAt: now,
  };
  return { error: null, notebook, notebooks: [...notebooks, notebook] };
}

function updateNoteNotebook(notebooks, notebookId, name, now = new Date().toISOString()) {
  const notebook = notebooks.find((item) => item.id === notebookId);
  if (!notebook) return { error: 'missing', notebooks };

  const normalizedName = normalizeNotebookName(name);
  if (!normalizedName) return { error: 'required', notebooks };
  if (normalizedName.length > MAX_NOTEBOOK_NAME_LENGTH) {
    return { error: 'too_long', notebooks };
  }
  if (
    notebooks.some(
      (item) =>
        item.id !== notebookId &&
        item.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
    )
  ) {
    return { error: 'duplicate', notebooks };
  }

  return {
    error: null,
    notebooks: notebooks.map((item) =>
      item.id === notebookId ? { ...item, name: normalizedName, updatedAt: now } : item,
    ),
  };
}

function deleteNoteNotebook(notebooks, notes, notebookId, now = new Date().toISOString()) {
  return {
    notebooks: notebooks.filter((notebook) => notebook.id !== notebookId),
    notes: notes.map((note) =>
      note.notebookId === notebookId
        ? {
            ...note,
            notebookId: null,
            updatedAt: now,
            revision: Math.max(1, note.revision || 1) + 1,
          }
        : note,
    ),
  };
}

function reorderNoteNotebooks(notebooks, sourceId, targetId) {
  const sourceIndex = notebooks.findIndex((notebook) => notebook.id === sourceId);
  const targetIndex = notebooks.findIndex((notebook) => notebook.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return notebooks;

  const reordered = [...notebooks];
  const [movedNotebook] = reordered.splice(sourceIndex, 1);
  reordered.splice(targetIndex, 0, movedNotebook);
  return reordered;
}

function moveNoteNotebook(notebooks, notebookId, direction) {
  const currentIndex = notebooks.findIndex((notebook) => notebook.id === notebookId);
  const targetIndex = currentIndex + direction;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= notebooks.length) return notebooks;
  return reorderNoteNotebooks(notebooks, notebookId, notebooks[targetIndex].id);
}

export {
  MAX_NOTEBOOKS,
  MAX_NOTEBOOK_NAME_LENGTH,
  createNoteNotebook,
  deleteNoteNotebook,
  moveNoteNotebook,
  reorderNoteNotebooks,
  updateNoteNotebook,
};
