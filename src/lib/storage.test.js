import { describe, expect, it } from 'vitest';
import {
  exportBackup,
  loadSettings,
  loadSites,
  restoreBackup,
  saveSettings,
  saveSites,
  undoLastRestore,
} from './storage.js';

describe('storage repository', () => {
  it('preserves an empty legacy dashboard instead of reseeding defaults', async () => {
    localStorage.setItem('tabibe-sites', JSON.stringify([]));
    expect(await loadSites()).toEqual([]);
  });

  it('migrates legacy settings into the versioned state', async () => {
    localStorage.setItem('tabibe-theme', 'dark');
    localStorage.setItem('tabibe-show-clock', 'false');

    const settings = await loadSettings();
    expect(settings.theme).toBe('dark');
    expect(settings.showClock).toBe(false);
  });

  it('exports and restores a versioned backup envelope', async () => {
    await saveSites([{ id: 'site-1', name: 'Example', url: 'https://example.com' }]);
    await saveSettings({ theme: 'dark' });
    const backup = await exportBackup();

    expect(backup.backupVersion).toBe(1);
    expect(backup.data.sites[0].url).toBe('https://example.com/');

    await saveSites([]);
    await restoreBackup(backup);
    expect(await loadSites()).toHaveLength(1);
  });

  it('rejects unsafe URLs from legacy backups before writing', async () => {
    await expect(
      restoreBackup({
        'tabibe-sites': JSON.stringify([
          { id: 'unsafe', name: 'Unsafe', url: 'javascript:alert(1)' },
        ]),
      }),
    ).rejects.toThrow('unsafe_url_protocol');
  });

  it('can undo the last successful restore', async () => {
    await saveSites([{ id: 'before', name: 'Before', url: 'https://before.example' }]);
    await restoreBackup({
      backupVersion: 1,
      appVersion: '0.3.1',
      exportedAt: new Date().toISOString(),
      data: {
        sites: [{ id: 'after', name: 'After', url: 'https://after.example' }],
        notes: [],
        settings: {},
      },
    });

    expect((await loadSites())[0].name).toBe('After');
    expect(await undoLastRestore()).toBe(true);
    expect((await loadSites())[0].name).toBe('Before');
  });
});
