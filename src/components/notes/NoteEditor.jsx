import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../../hooks/useTranslation.js';
import { transformPreviewUrl } from '../../domain/noteEditor.js';
import NoteActions from './NoteActions.jsx';
import NoteDetails from './NoteDetails.jsx';
import NoteSaveStatus from './NoteSaveStatus.jsx';

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
  contentInputRef,
  noteNotebooks,
  noteTags,
  onBack,
  onCommitAndClose,
  onCopy,
  onDiscard,
  onManageTags,
  onOpenLibrary,
  onRequestClose,
  onRequestDelete,
  onRetrySave,
  onToggleArchive,
  onTogglePin,
  onToggleTag,
  onUpdate,
  presentation,
  saveErrorCode,
  saveStatus,
}) {
  const { t } = useTranslation();
  const [isPreview, setIsPreview] = useState(false);
  const isCapture = presentation === 'capture';

  useEffect(() => {
    setIsPreview(false);
  }, [activeNote.id]);

  function handleContentKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void onCommitAndClose();
    }
  }

  return (
    <article
      className={`note-composer note-composer--${presentation}`}
      aria-label={t('note_editor_label')}
    >
      <header className="note-composer-header">
        {isCapture ? (
          <h2 className="note-composer-title" id="note-capture-title">
            {t('note_capture_entry')}
          </h2>
        ) : (
          <button className="notes-button notes-button--back" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            <span>{t('note_back_to_list')}</span>
          </button>
        )}

        <div className="note-composer-header-actions">
          {!isCapture && (
            <NoteSaveStatus
              compact
              onCopy={onCopy}
              onDiscard={undefined}
              onRetry={onRetrySave}
              saveErrorCode={saveErrorCode}
              saveStatus={saveStatus}
            />
          )}
          {!isCapture && (
            <NoteActions
              activeNote={activeNote}
              onCopy={onCopy}
              onRequestDelete={onRequestDelete}
              onToggleArchive={onToggleArchive}
              onTogglePin={onTogglePin}
            />
          )}
          {isCapture && (
            <button
              className="notes-button notes-button--icon"
              type="button"
              onClick={onRequestClose}
              aria-label={t('note_capture_close')}
              title={t('note_capture_close')}
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>
        {/* /.note-composer-header */}
      </header>

      <div className="note-composer-body">
        <label className="note-composer-title-field">
          <span className="visually-hidden">{t('note_title_label')}</span>
          <input
            className="note-composer-title-input"
            type="text"
            maxLength={300}
            value={activeNote.title}
            onChange={(event) => onUpdate('title', event.target.value)}
            placeholder={t('note_title_placeholder')}
          />
        </label>
        <div className="note-composer-textarea-wrap">
          <label className="visually-hidden" htmlFor="note-content">
            {t('note_content_label')}
          </label>
          <textarea
            id="note-content"
            ref={contentInputRef}
            className="note-composer-textarea"
            maxLength={100000}
            value={activeNote.content}
            onChange={(event) => onUpdate('content', event.target.value)}
            onKeyDown={handleContentKeyDown}
            placeholder={isCapture ? t('note_capture_placeholder') : t('note_placeholder')}
            hidden={isPreview}
          />
          <div
            className="note-composer-preview"
            aria-label={t('note_preview_show')}
            hidden={!isPreview}
          >
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
              <p>{t('note_preview_empty')}</p>
            )}
          </div>
        </div>
        <NoteDetails
          activeNote={activeNote}
          isPreview={isPreview}
          noteNotebooks={noteNotebooks}
          noteTags={noteTags}
          onManageTags={onManageTags}
          onTogglePreview={() => setIsPreview((currentValue) => !currentValue)}
          onToggleTag={onToggleTag}
          onUpdate={onUpdate}
        />
        {/* /.note-composer-body */}
      </div>

      {isCapture && (
        <footer className="note-composer-footer">
          <button
            className="notes-button note-capture-expand"
            type="button"
            onClick={onOpenLibrary}
          >
            <ExternalLink aria-hidden="true" />
            {t('note_open_library')}
          </button>
          <div className="note-composer-save">
            <NoteSaveStatus
              onCopy={onCopy}
              onDiscard={onDiscard}
              onRetry={onRetrySave}
              saveErrorCode={saveErrorCode}
              saveStatus={saveStatus}
            />
            <kbd>Ctrl/⌘ + Enter</kbd>
          </div>
          {/* /.note-composer-footer */}
        </footer>
      )}
      {/* /.note-composer */}
    </article>
  );
}

export default NoteEditor;
