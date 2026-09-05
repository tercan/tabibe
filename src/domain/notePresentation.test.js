import { describe, expect, it } from 'vitest';
import {
  formatNoteRelativeTime,
  getNoteDisplayTitle,
  groupNotesForLibrary,
  stripMarkdownForDisplay,
} from './notePresentation.js';

/**
 * 1. Note text presentation
 */

describe('note presentation text helpers', () => {
  it('prefers an explicit title and derives a title from the first meaningful body line', () => {
    expect(
      getNoteDisplayTitle({ title: '  Explicit title  ', content: '# Ignored' }, 'Untitled'),
    ).toBe('Explicit title');
    expect(
      getNoteDisplayTitle(
        { title: '', content: '\n\n# **Project** [roadmap](https://example.com)\nNext step' },
        'Untitled',
      ),
    ).toBe('Project roadmap');
    expect(getNoteDisplayTitle({ title: '', content: '   ' }, 'Untitled')).toBe('Untitled');
  });

  it('removes common Markdown decoration without damaging readable text', () => {
    expect(stripMarkdownForDisplay('- [x] **Read** [the brief](https://example.com)')).toBe(
      'Read the brief',
    );
    expect(stripMarkdownForDisplay('> `const value` and snake_case')).toBe(
      'const value and snake_case',
    );
    expect(stripMarkdownForDisplay('<strong>Safe</strong> text')).toBe('Safe text');
  });
});

/**
 * 2. Relative dates and grouping
 */

describe('note presentation time helpers', () => {
  const now = new Date('2026-09-04T12:00:00.000Z');

  it('formats safe locale-aware relative times', () => {
    expect(
      formatNoteRelativeTime('2026-09-04T11:55:00.000Z', {
        locale: 'en',
        now,
        style: 'long',
      }),
    ).toBe('5 minutes ago');
    expect(
      formatNoteRelativeTime('2026-09-04T14:00:00.000Z', {
        locale: 'en',
        now,
        style: 'long',
      }),
    ).toBe('in 2 hours');
    expect(
      formatNoteRelativeTime('2026-09-01T12:00:00.000Z', {
        locale: 'en',
        now,
        style: 'long',
      }),
    ).toBe('3 days ago');
  });

  it('handles invalid dates and locales without throwing', () => {
    expect(formatNoteRelativeTime('not-a-date', { locale: 'en', now })).toBe('');
    expect(formatNoteRelativeTime(now, { locale: 'invalid_locale', now })).toBeTruthy();
  });
});

describe('note presentation grouping', () => {
  it('groups pinned and recent notes by update time without mutating the input', () => {
    const notes = [
      { id: 'recent-old', isPinned: false, updatedAt: '2026-09-01T12:00:00.000Z' },
      { id: 'pinned-old', isPinned: true, updatedAt: '2026-08-01T12:00:00.000Z' },
      { id: 'recent-new', isPinned: false, updatedAt: '2026-09-03T12:00:00.000Z' },
      { id: 'pinned-new', isPinned: true, updatedAt: '2026-09-02T12:00:00.000Z' },
    ];
    const originalOrder = notes.map((note) => note.id);

    const groups = groupNotesForLibrary(notes);

    expect(groups.pinnedNotes.map((note) => note.id)).toEqual(['pinned-new', 'pinned-old']);
    expect(groups.recentNotes.map((note) => note.id)).toEqual(['recent-new', 'recent-old']);
    expect(notes.map((note) => note.id)).toEqual(originalOrder);
  });

  it('ignores invalid collection entries and keeps a stable fallback order', () => {
    const groups = groupNotesForLibrary([
      null,
      { id: 'first', isPinned: false, updatedAt: 'invalid' },
      { id: 'second', isPinned: false, updatedAt: 'invalid' },
    ]);

    expect(groups.recentNotes.map((note) => note.id)).toEqual(['first', 'second']);
  });

  it('preserves an upstream search or sort order when requested', () => {
    const groups = groupNotesForLibrary(
      [
        { id: 'zebra', isPinned: false, updatedAt: '2026-09-04T12:00:00.000Z' },
        { id: 'alpha', isPinned: false, updatedAt: '2026-09-01T12:00:00.000Z' },
      ],
      { preserveOrder: true },
    );

    expect(groups.recentNotes.map((note) => note.id)).toEqual(['zebra', 'alpha']);
  });
});
