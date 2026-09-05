import { describe, expect, it } from 'vitest';
import { normalizeAppState } from '../domain/dataSchema.js';
import { createDemoNoteWorkspace, mergeDemoNoteWorkspace } from './demoNotes.js';

describe('demo note workspace', () => {
  it('creates a varied and schema-safe starter library', () => {
    const referenceDate = new Date('2026-09-04T12:00:00.000Z');
    const workspace = createDemoNoteWorkspace(referenceDate);
    const noteIds = workspace.notes.map((note) => note.id);
    const tagIds = new Set(workspace.noteTags.map((tag) => tag.id));
    const notebookIds = new Set(workspace.noteNotebooks.map((notebook) => notebook.id));

    expect(workspace.notes).toHaveLength(12);
    expect(workspace.notes.filter((note) => !note.isArchived)).toHaveLength(11);
    expect(workspace.notes.filter((note) => note.isArchived)).toHaveLength(1);
    expect(workspace.notes.filter((note) => note.isPinned)).toHaveLength(2);
    expect(new Set(noteIds).size).toBe(noteIds.length);
    expect(workspace.noteTags).toHaveLength(4);
    expect(workspace.noteNotebooks).toHaveLength(3);

    workspace.notes.forEach((note) => {
      expect(note.revision).toBe(1);
      expect(note.captureSessionId).toBeNull();
      expect(Date.parse(note.createdAt)).toBeLessThanOrEqual(Date.parse(note.updatedAt));
      expect(Date.parse(note.updatedAt)).toBeLessThanOrEqual(referenceDate.getTime());
      expect(note.tagIds.every((tagId) => tagIds.has(tagId))).toBe(true);
      expect(note.notebookId === null || notebookIds.has(note.notebookId)).toBe(true);
    });

    const normalized = normalizeAppState({
      revision: 0,
      sites: [],
      ...workspace,
      settings: {},
    });
    expect(normalized.notes.map((note) => note.id)).toEqual(noteIds);
    expect(normalized.noteTags.map((tag) => tag.id)).toEqual([...tagIds]);
    expect(normalized.noteNotebooks.map((notebook) => notebook.id)).toEqual([...notebookIds]);
  });

  it('returns independent records for each fresh workspace', () => {
    const firstWorkspace = createDemoNoteWorkspace('2026-09-04T12:00:00.000Z');
    const secondWorkspace = createDemoNoteWorkspace('2026-09-04T12:00:00.000Z');

    firstWorkspace.notes[0].content = 'Changed locally';
    firstWorkspace.notes[0].tagIds.push('changed-locally');
    firstWorkspace.noteTags[0].name = 'Changed locally';

    expect(secondWorkspace.notes[0].content).not.toBe('Changed locally');
    expect(secondWorkspace.notes[0].tagIds).not.toContain('changed-locally');
    expect(secondWorkspace.noteTags[0].name).toBe('Önemli');
  });

  it('merges missing demos without replacing user data or duplicating matching names', () => {
    const referenceDate = '2026-09-04T12:00:00.000Z';
    const userNote = { id: 'user-note', title: 'Kullanıcı notu', content: 'Korunmalı.' };
    const currentWorkspace = {
      notes: [userNote],
      noteTags: [{ id: 'user-work-tag', name: 'İş', colorToken: 'green' }],
      noteNotebooks: [{ id: 'user-work-notebook', name: 'İş' }],
    };

    const firstMerge = mergeDemoNoteWorkspace(currentWorkspace, referenceDate);
    const dailyFocus = firstMerge.workspace.notes.find(
      (note) => note.id === 'demo-note-daily-focus',
    );

    expect(firstMerge.didChange).toBe(true);
    expect(firstMerge.addedNotes).toBe(12);
    expect(firstMerge.addedTags).toBe(3);
    expect(firstMerge.addedNotebooks).toBe(2);
    expect(firstMerge.workspace.notes[0]).toBe(userNote);
    expect(dailyFocus.tagIds).toContain('user-work-tag');
    expect(dailyFocus.notebookId).toBe('user-work-notebook');

    const secondMerge = mergeDemoNoteWorkspace(firstMerge.workspace, referenceDate);
    expect(secondMerge.didChange).toBe(false);
    expect(secondMerge.workspace.notes).toHaveLength(13);
    expect(secondMerge.workspace.noteTags).toHaveLength(4);
    expect(secondMerge.workspace.noteNotebooks).toHaveLength(3);
  });
});
