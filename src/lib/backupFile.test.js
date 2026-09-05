import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBackupFilename, downloadBackupFile } from './backupFile.js';

describe('backup file download', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a stable local-time filename', () => {
    const date = new Date(2026, 6, 17, 4, 8);
    expect(createBackupFilename(date)).toBe('tabibe-backup-20260717-0408.json');
  });

  it('downloads JSON and always revokes the object URL', () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const date = new Date(2026, 6, 17, 4, 8);

    downloadBackupFile({ backupVersion: 1 }, date);

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(click.mock.instances[0].download).toBe('tabibe-backup-20260717-0408.json');
    expect(document.body.contains(click.mock.instances[0])).toBe(false);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:backup');
  });
});
