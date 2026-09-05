import { describe, expect, it } from 'vitest';
import {
  createNoteNotebook,
  deleteNoteNotebook,
  moveNoteNotebook,
  reorderNoteNotebooks,
  updateNoteNotebook,
} from './noteNotebookOperations.js';

describe('note notebook operations', () => {
  it('creates normalized notebooks and rejects duplicate names', () => {
    const created = createNoteNotebook([], ' Projects ', () => 'projects', '2026-01-01');
    const duplicate = createNoteNotebook(created.notebooks, 'projects');

    expect(created.notebook).toMatchObject({ id: 'projects', name: 'Projects' });
    expect(duplicate.error).toBe('duplicate');
  });

  it('renames and reorders notebooks without mutating the source', () => {
    const notebooks = [
      { id: 'projects', name: 'Projects' },
      { id: 'personal', name: 'Personal' },
      { id: 'ideas', name: 'Ideas' },
    ];
    const renamed = updateNoteNotebook(notebooks, 'personal', 'Home', '2026-02-01');
    const reordered = reorderNoteNotebooks(renamed.notebooks, 'ideas', 'projects');
    const moved = moveNoteNotebook(reordered, 'ideas', 1);

    expect(renamed.notebooks[1]).toMatchObject({ name: 'Home', updatedAt: '2026-02-01' });
    expect(reordered.map((notebook) => notebook.id)).toEqual(['ideas', 'projects', 'personal']);
    expect(moved.map((notebook) => notebook.id)).toEqual(['projects', 'ideas', 'personal']);
    expect(notebooks[1].name).toBe('Personal');
  });

  it('deletes a notebook without deleting its notes', () => {
    const result = deleteNoteNotebook(
      [{ id: 'projects', name: 'Projects' }],
      [
        { id: 'inside', notebookId: 'projects', revision: 1 },
        { id: 'outside', notebookId: null, revision: 1 },
      ],
      'projects',
      '2026-03-01',
    );

    expect(result.notebooks).toEqual([]);
    expect(result.notes).toHaveLength(2);
    expect(result.notes[0]).toMatchObject({ notebookId: null, revision: 2 });
    expect(result.notes[1]).toMatchObject({ notebookId: null, revision: 1 });
  });
});
