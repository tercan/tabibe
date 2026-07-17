import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bold, Eye, Italic, Link, List, ListChecks, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../../hooks/useTranslation.js';
import {
  applyInlineFormat,
  applyLinePrefix,
  applyLinkFormat,
  getNoteMetrics,
  transformPreviewUrl,
} from '../../domain/noteEditor.js';
import NoteTagPicker from './NoteTagPicker.jsx';

const PREVIEW_ELEMENTS = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'hr',
  'input',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
];

function NoteEditor({
  activeNote,
  formatDate,
  noteTags,
  onBack,
  onManageTags,
  onRetrySave,
  onToggleTag,
  onUpdate,
  saveStatus,
  titleInputRef,
}) {
  const { t } = useTranslation();
  const [isPreview, setIsPreview] = useState(false);
  const contentInputRef = useRef(null);
  const metrics = useMemo(() => getNoteMetrics(activeNote.content), [activeNote.content]);

  useEffect(() => {
    setIsPreview(false);
  }, [activeNote.id]);

  function applyFormat(format) {
    const input = contentInputRef.current;
    if (!input || isPreview) return;

    const { selectionStart, selectionEnd } = input;
    let result;
    if (format === 'bold') {
      result = applyInlineFormat(activeNote.content, selectionStart, selectionEnd, {
        prefix: '**',
        suffix: '**',
        placeholder: t('note_format_text_placeholder'),
      });
    } else if (format === 'italic') {
      result = applyInlineFormat(activeNote.content, selectionStart, selectionEnd, {
        prefix: '_',
        suffix: '_',
        placeholder: t('note_format_text_placeholder'),
      });
    } else if (format === 'list') {
      result = applyLinePrefix(activeNote.content, selectionStart, selectionEnd, '- ');
    } else if (format === 'checklist') {
      result = applyLinePrefix(activeNote.content, selectionStart, selectionEnd, '- [ ] ');
    } else {
      result = applyLinkFormat(
        activeNote.content,
        selectionStart,
        selectionEnd,
        t('note_format_link_placeholder'),
      );
    }

    onUpdate('content', result.value);
    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    <div className="note-editor" role="region" aria-label={t('note_editor_label')}>
      <div className="note-editor-header">
        <button
          className="note-panel-button"
          type="button"
          onClick={onBack}
          aria-label={t('note_back_to_list')}
          title={t('note_back_to_list')}
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
      </div>
      <label className="visually-hidden" htmlFor="note-title">
        {t('note_title_label')}
      </label>
      <input
        id="note-title"
        ref={titleInputRef}
        className="note-title-input"
        type="text"
        value={activeNote.title}
        onChange={(event) => onUpdate('title', event.target.value)}
        placeholder={t('note_title_placeholder')}
      />
      <NoteTagPicker
        activeNote={activeNote}
        noteTags={noteTags}
        onManageTags={onManageTags}
        onToggleTag={onToggleTag}
      />
      <div className="note-editor-toolbar" role="toolbar" aria-label={t('note_format_toolbar')}>
        <button
          className="note-editor-tool"
          type="button"
          disabled={isPreview}
          onClick={() => applyFormat('bold')}
          aria-label={t('note_format_bold')}
          title={t('note_format_bold')}
        >
          <Bold size={16} aria-hidden="true" />
        </button>
        <button
          className="note-editor-tool"
          type="button"
          disabled={isPreview}
          onClick={() => applyFormat('italic')}
          aria-label={t('note_format_italic')}
          title={t('note_format_italic')}
        >
          <Italic size={16} aria-hidden="true" />
        </button>
        <button
          className="note-editor-tool"
          type="button"
          disabled={isPreview}
          onClick={() => applyFormat('list')}
          aria-label={t('note_format_list')}
          title={t('note_format_list')}
        >
          <List size={16} aria-hidden="true" />
        </button>
        <button
          className="note-editor-tool"
          type="button"
          disabled={isPreview}
          onClick={() => applyFormat('checklist')}
          aria-label={t('note_format_checklist')}
          title={t('note_format_checklist')}
        >
          <ListChecks size={16} aria-hidden="true" />
        </button>
        <button
          className="note-editor-tool"
          type="button"
          disabled={isPreview}
          onClick={() => applyFormat('link')}
          aria-label={t('note_format_link')}
          title={t('note_format_link')}
        >
          <Link size={16} aria-hidden="true" />
        </button>
        <button
          className={`note-editor-tool note-editor-tool--preview ${isPreview ? 'note-editor-tool--active' : ''}`}
          type="button"
          aria-pressed={isPreview}
          onClick={() => setIsPreview((currentValue) => !currentValue)}
          aria-label={isPreview ? t('note_preview_hide') : t('note_preview_show')}
          title={isPreview ? t('note_preview_hide') : t('note_preview_show')}
        >
          {isPreview ? (
            <Pencil size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>
      {isPreview ? (
        <div className="note-markdown-preview" aria-label={t('note_preview_show')}>
          {activeNote.content.trim() ? (
            <ReactMarkdown
              allowedElements={PREVIEW_ELEMENTS}
              remarkPlugins={[remarkGfm]}
              skipHtml
              urlTransform={transformPreviewUrl}
              components={{
                a: ({ children, href }) =>
                  href ? (
                    <a href={href} target="_blank" rel="noreferrer noopener">
                      {children}
                    </a>
                  ) : (
                    <span>{children}</span>
                  ),
                input: ({ checked, type }) => (
                  <input type={type} checked={checked} disabled readOnly />
                ),
              }}
            >
              {activeNote.content}
            </ReactMarkdown>
          ) : (
            <p className="note-markdown-preview-empty">{t('note_preview_empty')}</p>
          )}
        </div>
      ) : (
        <>
          <label className="visually-hidden" htmlFor="note-content">
            {t('note_content_label')}
          </label>
          <textarea
            id="note-content"
            ref={contentInputRef}
            className="note-panel-textarea"
            value={activeNote.content}
            onChange={(event) => onUpdate('content', event.target.value)}
            placeholder={t('note_placeholder')}
            aria-label={t('note_content_label')}
          />
        </>
      )}
      <div className="note-editor-footer">
        <p className="note-editor-metrics">
          <span>{t('note_word_count', { count: metrics.words })}</span>
          <span>{t('note_character_count', { count: metrics.characters })}</span>
        </p>
        <p className="note-editor-meta">
          {t('note_updated_at', { date: formatDate(activeNote.updatedAt) })}
        </p>
      </div>
      <p
        className={`note-save-status note-save-status--${saveStatus}`}
        role="status"
        aria-live="polite"
      >
        {saveStatus === 'saving' && t('note_save_saving')}
        {saveStatus === 'saved' && t('note_save_saved')}
        {saveStatus === 'error' && t('note_save_error')}
        {saveStatus === 'conflict' && t('note_save_conflict')}
      </p>
      {saveStatus === 'error' && (
        <button className="note-save-retry" type="button" onClick={onRetrySave}>
          {t('note_save_retry')}
        </button>
      )}
    </div>
  );
}

export default NoteEditor;
