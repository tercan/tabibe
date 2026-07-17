const NOTE_TEMPLATE_IDS = ['blank', 'daily', 'meeting', 'checklist'];

function getNoteTemplate(templateId, t, now = new Date()) {
  const date = now.toISOString().slice(0, 10);

  if (templateId === 'daily') {
    return {
      title: `${t('note_template_daily_title')} - ${date}`,
      content: `## ${t('note_template_daily_priorities')}\n- [ ] \n\n## ${t('note_template_daily_notes')}\n`,
    };
  }

  if (templateId === 'meeting') {
    return {
      title: `${t('note_template_meeting_title')} - ${date}`,
      content: [
        `## ${t('note_template_meeting_attendees')}`,
        '',
        `## ${t('note_template_meeting_agenda')}`,
        '- ',
        '',
        `## ${t('note_template_meeting_decisions')}`,
        '- ',
        '',
        `## ${t('note_template_meeting_actions')}`,
        '- [ ] ',
      ].join('\n'),
    };
  }

  if (templateId === 'checklist') {
    return {
      title: t('note_template_checklist_title'),
      content: '- [ ] ',
    };
  }

  return { title: '', content: '' };
}

export { NOTE_TEMPLATE_IDS, getNoteTemplate };
