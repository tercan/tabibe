const NOTE_TAG_COLORS = ['blue', 'green', 'yellow', 'red', 'gray'];

function normalizeTagName(name) {
  return typeof name === 'string' ? name.trim() : '';
}

function createNoteTag(
  tags,
  name,
  colorToken = 'blue',
  idFactory = () => crypto.randomUUID(),
  now = new Date().toISOString(),
) {
  const normalizedName = normalizeTagName(name);
  if (!normalizedName) return { error: 'required', tags };
  if (normalizedName.length > 40) return { error: 'too_long', tags };
  if (tags.some((tag) => tag.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
    return { error: 'duplicate', tags };
  }
  if (tags.length >= 100) return { error: 'limit', tags };

  const tag = {
    id: idFactory(),
    name: normalizedName,
    colorToken: NOTE_TAG_COLORS.includes(colorToken) ? colorToken : 'blue',
    createdAt: now,
    updatedAt: now,
  };
  return { error: null, tag, tags: [...tags, tag] };
}

function updateNoteTag(tags, tagId, patch, now = new Date().toISOString()) {
  const tag = tags.find((item) => item.id === tagId);
  if (!tag) return { error: 'missing', tags };
  const name = normalizeTagName(patch.name ?? tag.name);
  if (!name) return { error: 'required', tags };
  if (name.length > 40) return { error: 'too_long', tags };
  if (
    tags.some(
      (item) => item.id !== tagId && item.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
  ) {
    return { error: 'duplicate', tags };
  }

  const colorToken = NOTE_TAG_COLORS.includes(patch.colorToken) ? patch.colorToken : tag.colorToken;
  return {
    error: null,
    tags: tags.map((item) =>
      item.id === tagId ? { ...item, name, colorToken, updatedAt: now } : item,
    ),
  };
}

function deleteNoteTag(tags, notes, tagId) {
  return {
    tags: tags.filter((tag) => tag.id !== tagId),
    notes: notes.map((note) =>
      note.tagIds.includes(tagId)
        ? {
            ...note,
            tagIds: note.tagIds.filter((id) => id !== tagId),
            revision: Math.max(1, note.revision || 1) + 1,
            updatedAt: new Date().toISOString(),
          }
        : note,
    ),
  };
}

export { NOTE_TAG_COLORS, createNoteTag, deleteNoteTag, updateNoteTag };
