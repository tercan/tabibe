import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';

const packageJson = JSON.parse(await readFile(resolve('package.json'), 'utf8'));
const distDirectory = resolve('dist');
const releaseDirectory = resolve('release');
const archivePath = join(releaseDirectory, `tabibe-v${packageJson.version}.zip`);
const forbiddenNames = new Set(['.DS_Store', '.env', 'Thumbs.db']);
const forbiddenDirectories = new Set([
  '.git',
  '.github',
  'documents',
  'node_modules',
  'src',
  'test-results',
  'tests',
]);
const forbiddenExtensions = new Set(['.crx', '.key', '.map', '.p12', '.pem', '.pfx', '.zip']);

async function validateDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(
        `Symbolic links are not allowed in the package: ${relative(distDirectory, path)}`,
      );
    }
    if (
      forbiddenNames.has(entry.name) ||
      (entry.isDirectory() && forbiddenDirectories.has(entry.name)) ||
      forbiddenExtensions.has(entry.name.slice(entry.name.lastIndexOf('.')))
    ) {
      throw new Error(`Forbidden package file: ${relative(distDirectory, path)}`);
    }
    if (entry.isDirectory()) await validateDirectory(path);
  }
}

await validateDirectory(distDirectory);
const manifest = JSON.parse(await readFile(join(distDirectory, 'manifest.json'), 'utf8'));
if (manifest.version !== packageJson.version) {
  throw new Error(`Manifest ${manifest.version} does not match package ${packageJson.version}.`);
}

await mkdir(releaseDirectory, { recursive: true });
await rm(archivePath, { force: true });
execFileSync('zip', ['-q', '-r', archivePath, '.'], { cwd: distDirectory });

const archiveSize = (await stat(archivePath)).size;
if (archiveSize > 10 * 1024 * 1024) {
  await rm(archivePath, { force: true });
  throw new Error(`Extension archive exceeds 10 MB: ${archiveSize} bytes.`);
}

console.info(`${basename(archivePath)}: ${archiveSize} bytes`);
