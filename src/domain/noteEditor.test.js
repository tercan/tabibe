import { describe, expect, it } from 'vitest';
import {
  applyInlineFormat,
  applyLinePrefix,
  applyLinkFormat,
  getNoteMetrics,
} from './noteEditor.js';

describe('note editor operations', () => {
  it('counts Unicode characters and whitespace-separated words', () => {
    expect(getNoteMetrics('Merhaba dünya 👋')).toEqual({ characters: 15, words: 2 });
    expect(getNoteMetrics('- [ ] First task')).toEqual({ characters: 16, words: 2 });
    expect(getNoteMetrics('  ')).toEqual({ characters: 2, words: 0 });
  });

  it('wraps selected text and selects the formatted content', () => {
    expect(
      applyInlineFormat('important text', 0, 9, {
        prefix: '**',
        suffix: '**',
        placeholder: 'text',
      }),
    ).toEqual({
      value: '**important** text',
      selectionStart: 2,
      selectionEnd: 11,
    });
  });

  it('adds checklist prefixes to every selected line', () => {
    expect(applyLinePrefix('first\nsecond', 0, 12, '- [ ] ')).toEqual({
      value: '- [ ] first\n- [ ] second',
      selectionStart: 0,
      selectionEnd: 24,
    });
  });

  it('inserts a link and selects its URL for immediate replacement', () => {
    expect(applyLinkFormat('Tabibe', 0, 6, 'link text')).toEqual({
      value: '[Tabibe](https://)',
      selectionStart: 9,
      selectionEnd: 17,
    });
  });
});
