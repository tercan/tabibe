import { describe, expect, it } from 'vitest';
import { getNoteTemplate, NOTE_TEMPLATE_IDS } from './noteTemplates.js';

const translate = (key) => key;

describe('note templates', () => {
  it('exposes the supported template order', () => {
    expect(NOTE_TEMPLATE_IDS).toEqual(['blank', 'daily', 'meeting', 'checklist']);
  });

  it('creates a dated daily template with a checklist', () => {
    expect(getNoteTemplate('daily', translate, new Date('2026-07-18T08:00:00Z'))).toEqual({
      title: 'note_template_daily_title - 2026-07-18',
      content: '## note_template_daily_priorities\n- [ ] \n\n## note_template_daily_notes\n',
    });
  });

  it('falls back to an empty note for an unknown template', () => {
    expect(getNoteTemplate('unknown', translate)).toEqual({ title: '', content: '' });
  });
});
