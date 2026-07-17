import { describe, expect, it } from 'vitest';
import { createNoteTag, deleteNoteTag, updateNoteTag } from './noteTagOperations.js';

describe('note tag operations', () => {
  it('creates normalized tags and rejects duplicate names', () => {
    const created = createNoteTag([], ' Work ', 'green', () => 'tag-work', '2026-01-01');
    const duplicate = createNoteTag(created.tags, 'work', 'blue');

    expect(created.tag).toMatchObject({ id: 'tag-work', name: 'Work', colorToken: 'green' });
    expect(duplicate.error).toBe('duplicate');
  });

  it('renames tags while preserving case-insensitive uniqueness', () => {
    const tags = [
      { id: 'one', name: 'Work', colorToken: 'blue' },
      { id: 'two', name: 'Personal', colorToken: 'green' },
    ];

    expect(updateNoteTag(tags, 'two', { name: 'work' }).error).toBe('duplicate');
    expect(
      updateNoteTag(tags, 'two', { name: 'Home', colorToken: 'yellow' }).tags[1],
    ).toMatchObject({ name: 'Home', colorToken: 'yellow' });
  });

  it('deletes a tag without deleting its notes', () => {
    const result = deleteNoteTag(
      [{ id: 'work', name: 'Work', colorToken: 'blue' }],
      [{ id: 'note', tagIds: ['work'], revision: 1 }],
      'work',
    );

    expect(result.tags).toEqual([]);
    expect(result.notes).toHaveLength(1);
    expect(result.notes[0]).toMatchObject({ id: 'note', tagIds: [], revision: 2 });
  });
});
