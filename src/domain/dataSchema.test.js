import { describe, expect, it } from 'vitest';
import {
  DataValidationError,
  createDefaultSettings,
  normalizeAppState,
  normalizeSiteUrl,
  normalizeSites,
} from './dataSchema.js';

describe('data schema', () => {
  it('normalizes web URLs and rejects executable protocols', () => {
    expect(normalizeSiteUrl('example.com')).toBe('https://example.com/');
    expect(normalizeSiteUrl('chrome://settings')).toBe('chrome://settings');
    expect(() => normalizeSiteUrl('javascript:alert(1)')).toThrow(DataValidationError);
    expect(() => normalizeSiteUrl('data:text/html,test')).toThrow(DataValidationError);
  });

  it('preserves a deliberately empty site list', () => {
    const state = normalizeAppState({
      sites: [],
      notes: [],
      settings: createDefaultSettings('dark'),
    });

    expect(state.sites).toEqual([]);
    expect(state.settings.theme).toBe('dark');
  });

  it('normalizes the notes workspace layout preferences', () => {
    const state = normalizeAppState({
      sites: [],
      notes: [],
      settings: {
        notePanelSide: 'right',
        notePanelMode: 'fullscreen',
      },
    });

    expect(state.settings.notePanelSide).toBe('right');
    expect(state.settings.notePanelMode).toBe('fullscreen');

    const fallbackState = normalizeAppState({
      sites: [],
      notes: [],
      settings: {
        notePanelSide: 'inline-start',
        notePanelMode: 'wide',
      },
    });

    expect(fallbackState.settings.notePanelSide).toBe('left');
    expect(fallbackState.settings.notePanelMode).toBe('panel');
  });

  it('preserves every newly supported European locale in stored settings', () => {
    for (const locale of ['fr', 'de', 'it']) {
      const state = normalizeAppState({ sites: [], notes: [], settings: { locale } });
      expect(state.settings.locale).toBe(locale);
    }
  });

  it('migrates legacy icon slugs and rejects nested folders', () => {
    const [site] = normalizeSites([
      {
        id: 'site-1',
        name: 'Example',
        url: 'https://example.com',
        icon_slug: ' Example ',
      },
    ]);

    expect(site.icon).toEqual({ preference: 'auto', slug: 'example' });
    expect(site).not.toHaveProperty('icon_slug');
    expect(() =>
      normalizeSites([
        {
          id: 'folder-1',
          type: 'folder',
          name: 'Folder',
          children: [{ id: 'folder-2', type: 'folder', name: 'Nested', children: [] }],
        },
      ]),
    ).toThrow('nested_folder');
  });

  it('filters empty notes while preserving meaningful notes', () => {
    const state = normalizeAppState({
      sites: [],
      notes: [
        { id: 'empty', title: ' ', content: '' },
        { id: 'kept', title: '', content: 'Remember this' },
      ],
      settings: {},
    });

    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].id).toBe('kept');
    expect(state.notes[0]).toMatchObject({ tagIds: [], notebookId: null, revision: 1 });
  });

  it('rejects oversized note text instead of silently truncating it', () => {
    const createState = (note) =>
      normalizeAppState({
        sites: [],
        notes: [note],
        settings: {},
      });
    const exactLimitState = createState({
      id: 'exact-limit',
      title: 'T'.repeat(300),
      content: 'C'.repeat(100_000),
    });

    expect(exactLimitState.notes[0].title).toHaveLength(300);
    expect(exactLimitState.notes[0].content).toHaveLength(100_000);
    expect(() =>
      createState({ id: 'long-title', title: 'T'.repeat(301), content: 'Content' }),
    ).toThrow('string_too_long');
    expect(() =>
      createState({ id: 'long-content', title: 'Title', content: 'C'.repeat(100_001) }),
    ).toThrow('string_too_long');
  });

  it('preserves a bounded capture session identifier for idempotent capture', () => {
    const state = normalizeAppState({
      sites: [],
      notes: [
        {
          id: 'captured-note',
          title: '',
          content: 'Captured text',
          captureSessionId: 'capture-session-1',
        },
      ],
      settings: {},
    });

    expect(state.notes[0].captureSessionId).toBe('capture-session-1');
    expect(() =>
      normalizeAppState({
        sites: [],
        notes: [
          {
            id: 'invalid-capture',
            title: '',
            content: 'Captured text',
            captureSessionId: 'x'.repeat(129),
          },
        ],
        settings: {},
      }),
    ).toThrow('string_too_long');
  });

  it('normalizes central note tags and removes broken references', () => {
    const state = normalizeAppState({
      sites: [],
      noteTags: [
        {
          id: 'work',
          name: ' Work ',
          colorToken: 'green',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-02',
        },
      ],
      notes: [
        {
          id: 'note',
          title: 'Plan',
          content: '',
          tagIds: ['work', 'missing', 'work'],
          revision: 3,
        },
      ],
      settings: { noteSort: 'title-asc' },
    });

    expect(state.schemaVersion).toBe(3);
    expect(state.noteTags[0]).toMatchObject({ id: 'work', name: 'Work', colorToken: 'green' });
    expect(state.notes[0]).toMatchObject({ tagIds: ['work'], revision: 3 });
    expect(state.settings.noteSort).toBe('title-asc');
  });

  it('normalizes ordered note notebooks and removes broken note assignments', () => {
    const state = normalizeAppState({
      sites: [],
      noteNotebooks: [
        { id: 'projects', name: ' Projects ' },
        { id: 'personal', name: 'Personal' },
      ],
      notes: [
        { id: 'kept', title: 'Roadmap', content: '', notebookId: 'projects' },
        { id: 'recovered', title: 'Loose', content: '', notebookId: 'missing' },
      ],
      settings: {},
    });

    expect(state.noteNotebooks.map((notebook) => notebook.id)).toEqual(['projects', 'personal']);
    expect(state.noteNotebooks[0].name).toBe('Projects');
    expect(state.notes.map((note) => note.notebookId)).toEqual(['projects', null]);
  });
});
