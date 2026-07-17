function createBackupFilename(date = new Date()) {
  const timestamp = [
    date.getFullYear().toString(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
    '-',
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join('');

  return `tabibe-backup-${timestamp}.json`;
}

function downloadBackupFile(data, date = new Date()) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  try {
    link.href = url;
    link.download = createBackupFilename(date);
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
}

export { createBackupFilename, downloadBackupFile };
