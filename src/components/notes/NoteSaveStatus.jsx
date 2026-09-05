import { useTranslation } from '../../hooks/useTranslation.js';

const VISIBLE_SAVE_STATES = new Set(['saving', 'saved', 'error', 'quota', 'conflict']);

function NoteSaveStatus({
  compact = false,
  onCopy,
  onDiscard,
  onRetry,
  saveErrorCode = null,
  saveStatus,
}) {
  const { t } = useTranslation();
  if (!VISIBLE_SAVE_STATES.has(saveStatus)) return null;

  const messageKeys = {
    conflict: 'note_save_conflict',
    error: 'note_save_error',
    quota: 'note_save_quota',
    saved: 'note_save_saved',
    saving: 'note_save_saving',
  };
  const hasRecoveryActions = saveStatus === 'error' || saveStatus === 'quota';

  return (
    <div
      className={[
        'note-save-status',
        `note-save-status--${saveStatus}`,
        compact ? 'note-save-status--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-error-code={saveErrorCode || undefined}
      role={hasRecoveryActions ? 'alert' : 'status'}
      aria-live={hasRecoveryActions ? 'assertive' : 'polite'}
    >
      <span className="note-save-status-message">
        <span className="note-save-status-indicator" aria-hidden="true" />
        <span>{t(messageKeys[saveStatus])}</span>
      </span>
      {hasRecoveryActions && (onRetry || onCopy || onDiscard) && (
        <span className="notes-recovery-actions">
          {onRetry && (
            <button className="notes-button" type="button" onClick={onRetry}>
              {t('note_save_retry')}
            </button>
          )}
          {onCopy && (
            <button className="notes-button" type="button" onClick={onCopy}>
              {t('note_save_copy')}
            </button>
          )}
          {onDiscard && (
            <button className="notes-button notes-button--danger" type="button" onClick={onDiscard}>
              {t('note_save_discard')}
            </button>
          )}
        </span>
      )}
    </div>
  );
}

export default NoteSaveStatus;
