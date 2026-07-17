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
    expect(state.notes[0]).toMatchObject({ tagIds: [], revision: 1 });
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

    expect(state.schemaVersion).toBe(2);
    expect(state.noteTags[0]).toMatchObject({ id: 'work', name: 'Work', colorToken: 'green' });
    expect(state.notes[0]).toMatchObject({ tagIds: ['work'], revision: 3 });
    expect(state.settings.noteSort).toBe('title-asc');
  });
});
