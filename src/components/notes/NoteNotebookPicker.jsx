import { BookOpen } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';

function NoteNotebookPicker({ activeNote, noteNotebooks, onChange }) {
  const { t } = useTranslation();

  return (
    <label className="note-notebook-picker">
      <BookOpen aria-hidden="true" />
      <span className="visually-hidden">{t('note_notebook_assignment')}</span>
      <select
        value={activeNote.notebookId || ''}
        aria-label={t('note_notebook_assignment')}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">{t('note_notebook_none')}</option>
        {noteNotebooks.map((notebook) => (
          <option value={notebook.id} key={notebook.id}>
            {notebook.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default NoteNotebookPicker;
