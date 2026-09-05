import { Ellipsis, Plus, X } from 'lucide-react';
import { useRef } from 'react';
import useDismissibleMenus from '../../hooks/useDismissibleMenus.js';
import { useTranslation } from '../../hooks/useTranslation.js';

function NoteLibraryHeader({ moreContent = null, onClose, onCreate }) {
  const { t } = useTranslation();
  const headerRef = useRef(null);
  useDismissibleMenus(headerRef);

  return (
    <header className="notes-library-header" ref={headerRef}>
      <div className="notes-library-title-group">
        <h2 className="notes-library-title" id="note-library-title">
          {t('note_library_entry')}
        </h2>
      </div>
      {/* /.notes-library-title-group */}

      <div className="notes-library-actions">
        <button
          className="notes-button notes-button--primary"
          type="button"
          onClick={onCreate}
          aria-label={t('note_add')}
          title={t('note_add')}
        >
          <Plus aria-hidden="true" />
          <span>{t('note_add')}</span>
        </button>

        <details className="notes-menu-anchor" data-dismissible-menu>
          <summary
            className="notes-button notes-button--icon"
            role="button"
            aria-label={t('note_more_actions')}
            title={t('note_more_actions')}
          >
            <Ellipsis aria-hidden="true" />
          </summary>
          {moreContent}
        </details>

        <button
          className="notes-button notes-button--icon"
          type="button"
          onClick={onClose}
          aria-label={t('note_library_close')}
          title={t('note_library_close')}
        >
          <X aria-hidden="true" />
        </button>
      </div>
      {/* /.notes-library-actions */}
    </header>
  );
}

export default NoteLibraryHeader;
