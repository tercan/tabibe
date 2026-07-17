import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import I18nProvider from './I18nProvider.jsx';
import { AppErrorBoundary, AppLoading, AppRecovery } from './AppRecovery.jsx';
import { downloadBackupFile } from '../lib/backupFile.js';
import { exportBackup } from '../lib/storage.js';

vi.mock('../lib/backupFile.js', () => ({ downloadBackupFile: vi.fn() }));
vi.mock('../lib/storage.js', () => ({
  exportBackup: vi.fn(async () => ({ backupVersion: 1, data: {} })),
  resetApplicationData: vi.fn(async () => ({})),
}));

function Crash() {
  throw new Error('render_failed');
}

function renderLocalized(node) {
  return render(<I18nProvider>{node}</I18nProvider>);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('application recovery', () => {
  it('shows a skeleton while the application state is loading', () => {
    renderLocalized(<AppLoading />);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('requires a backup attempt before offering the destructive reset confirmation', async () => {
    renderLocalized(<AppRecovery onRetry={vi.fn()} />);
    const resetButton = screen.getByRole('button', { name: /reset/i });
    expect(resetButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    await waitFor(() => expect(exportBackup).toHaveBeenCalledOnce());
    expect(downloadBackupFile).toHaveBeenCalledOnce();
    expect(resetButton).toBeEnabled();

    fireEvent.click(resetButton);
    expect(screen.getByText(/replace the current local data/i)).toBeInTheDocument();
  });

  it('renders the recovery screen when a child render fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderLocalized(
      <AppErrorBoundary>
        <Crash />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: /could not open safely/i })).toBeInTheDocument();
  });
});
