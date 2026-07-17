import { Component, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import { downloadBackupFile } from '../lib/backupFile.js';
import { exportBackup, resetApplicationData } from '../lib/storage.js';

function AppLoading() {
  const { t } = useTranslation();

  return (
    <main className="app-loading" aria-busy="true" aria-label={t('app_loading')}>
      <span className="visually-hidden">{t('app_loading')}</span>
      <div className="app-loading-clock" aria-hidden="true" />
      <div className="app-loading-search" aria-hidden="true" />
      <div className="app-loading-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </main>
  );
}

function AppRecovery({ onRetry = () => window.location.reload() }) {
  const { t } = useTranslation();
  const [backupAttempted, setBackupAttempted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [status, setStatus] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleExport() {
    setIsBusy(true);
    try {
      downloadBackupFile(await exportBackup());
      setStatus({ type: 'success', message: t('settings_export_success') });
    } catch {
      setStatus({ type: 'error', message: t('settings_export_error') });
    } finally {
      setBackupAttempted(true);
      setIsBusy(false);
    }
  }

  async function handleReset() {
    setIsBusy(true);
    try {
      await resetApplicationData();
      window.location.reload();
    } catch {
      setStatus({ type: 'error', message: t('app_recovery_reset_error') });
      setIsBusy(false);
    }
  }

  return (
    <main className="app-recovery" role="alert">
      <section className="app-recovery-content" aria-labelledby="app-recovery-title">
        <h1 id="app-recovery-title">{t('app_recovery_title')}</h1>
        <p>{t('app_recovery_description')}</p>

        {status && (
          <p className={`settings-status settings-status--${status.type}`} role="status">
            {status.message}
          </p>
        )}

        {confirmReset ? (
          <div className="app-recovery-confirm">
            <p>{t('app_recovery_reset_confirm')}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-button modal-button--cancel"
                onClick={() => setConfirmReset(false)}
                disabled={isBusy}
              >
                {t('modal_cancel')}
              </button>
              <button
                type="button"
                className="modal-button modal-button--danger"
                onClick={handleReset}
                disabled={isBusy}
              >
                {t('settings_bg_reset')}
              </button>
            </div>
          </div>
        ) : (
          <div className="app-recovery-actions">
            <button
              type="button"
              className="modal-button modal-button--primary"
              onClick={onRetry}
              disabled={isBusy}
            >
              {t('common_retry')}
            </button>
            <button
              type="button"
              className="modal-button modal-button--cancel"
              onClick={handleExport}
              disabled={isBusy}
            >
              {t('settings_export')}
            </button>
            <button
              type="button"
              className="modal-button modal-button--danger"
              onClick={() => setConfirmReset(true)}
              disabled={!backupAttempted || isBusy}
            >
              {t('settings_bg_reset')}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <AppRecovery />;
    return this.props.children;
  }
}

export { AppErrorBoundary, AppLoading, AppRecovery };
