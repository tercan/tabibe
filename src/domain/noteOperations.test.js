import { describe, expect, it } from 'vitest';
import { createNote, filterNotes, isNoteEmpty, restoreNote, updateNote } from './noteOperations.js';

function makeNote(overrides = {}) {
  return createNote(overrides, () => overrides.id || 'note', overrides.updatedAt || '2026-01-01');
}

describe('note operations', () => {
  it('creates complete note records and detects empty content', () => {
    const note = makeNote({ id: 'one' });
    expect(note).toMatchObject({
      id: 'one',
      title: '',
      content: '',
      tagIds: [],
      isArchived: false,
      revision: 1,
    });
    expect(isNoteEmpty(note)).toBe(true);
    expect(isNoteEmpty({ ...note, content: '  text  ' })).toBe(false);
  });

  it('filters, searches, and sorts notes without mutating the source', () => {
    const notes = [
      makeNote({ id: 'older', title: 'Alpha', updatedAt: '2026-01-01' }),
      makeNote({ id: 'newer', content: 'Beta', updatedAt: '2026-02-01' }),
      makeNote({ id: 'pinned', title: 'Alpha pinned', isPinned: true, updatedAt: '2025-01-01' }),
      makeNote({ id: 'archived', title: 'Alpha archived', isArchived: true }),
    ];

    expect(
      filterNotes(notes, { searchQuery: 'alpha', showArchived: false }).map((note) => note.id),
    ).toEqual(['pinned', 'older']);
    expect(filterNotes(notes, { showArchived: true }).map((note) => note.id)).toEqual(['archived']);
    expect(notes[0].id).toBe('older');
  });

  it('filters by tags, pin state, date, and sort selection', () => {
    const notes = [
      makeNote({
        id: 'project',
        title: 'Project plan',
        tagIds: ['work'],
        updatedAt: '2026-07-16T12:00:00.000Z',
        createdAt: '2026-01-01T12:00:00.000Z',
      }),
      makeNote({
        id: 'personal',
        title: 'Alpha personal',
        tagIds: ['personal'],
        isPinned: true,
        updatedAt: '2026-06-01T12:00:00.000Z',
        createdAt: '2026-06-01T12:00:00.000Z',
      }),
    ];
    const noteTags = [
      { id: 'work', name: 'Work' },
      { id: 'personal', name: 'Personal' },
    ];

    expect(
      filterNotes(notes, { noteTags, searchQuery: 'work', selectedTagIds: ['work'] }).map(
        (note) => note.id,
      ),
    ).toEqual(['project']);
    expect(filterNotes(notes, { pinnedOnly: true }).map((note) => note.id)).toEqual(['personal']);
    expect(
      filterNotes(notes, {
        dateRange: '7-days',
        now: new Date('2026-07-17T12:00:00.000Z'),
      }).map((note) => note.id),
    ).toEqual(['project']);
    expect(filterNotes(notes, { sortBy: 'title-asc' }).map((note) => note.id)).toEqual([
      'personal',
      'project',
    ]);
  });

  it('updates and restores notes immutably', () => {
    const notes = [makeNote({ id: 'one', title: 'One' }), makeNote({ id: 'two', title: 'Two' })];
    const updated = updateNote(notes, 'one', { title: 'Updated' }, '2026-03-01');
    const restored = restoreNote([updated[1]], updated[0], 0);

    expect(updated[0]).toMatchObject({ title: 'Updated', updatedAt: '2026-03-01', revision: 2 });
    expect(restored.map((note) => note.id)).toEqual(['one', 'two']);
    expect(notes[0].title).toBe('One');
  });
});
