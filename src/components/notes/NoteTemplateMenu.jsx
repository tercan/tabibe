import { useEffect, useRef, useState } from 'react';
import { CalendarDays, FileText, ListChecks, Plus, Users } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation.js';

const templates = [
  { id: 'blank', icon: FileText, labelKey: 'note_template_blank' },
  { id: 'daily', icon: CalendarDays, labelKey: 'note_template_daily' },
  { id: 'meeting', icon: Users, labelKey: 'note_template_meeting' },
  { id: 'checklist', icon: ListChecks, labelKey: 'note_template_checklist' },
];

function NoteTemplateMenu({ buttonRef, onSelect }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const firstItemRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);
    requestAnimationFrame(() => firstItemRef.current?.focus({ preventScroll: true }));
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [buttonRef, isOpen]);

  function handleSelect(templateId) {
    setIsOpen(false);
    onSelect(templateId);
  }

  function handleMenuKeyDown(event) {
    const currentIndex = itemRefs.current.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % templates.length;
    if (event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + templates.length) % templates.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = templates.length - 1;
    if (nextIndex === currentIndex && !['Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    itemRefs.current[nextIndex]?.focus({ preventScroll: true });
  }

  return (
    <div className="note-template-menu" ref={containerRef}>
      <button
        className="note-panel-button"
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('note_add')}
        title={t('note_add')}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        onKeyDown={(event) => {
          if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
          event.preventDefault();
          setIsOpen(true);
        }}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          className="note-template-menu-popover"
          role="menu"
          aria-label={t('note_template_menu')}
          onKeyDown={handleMenuKeyDown}
        >
          {templates.map(({ id, icon: Icon, labelKey }, index) => (
            <button
              className="note-template-menu-item"
              ref={(element) => {
                itemRefs.current[index] = element;
                if (index === 0) firstItemRef.current = element;
              }}
              type="button"
              role="menuitem"
              key={id}
              onClick={() => handleSelect(id)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default NoteTemplateMenu;
