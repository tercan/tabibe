import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rename, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

const packageJson = JSON.parse(await readFile(resolve('package.json'), 'utf8'));
const distDirectory = resolve('dist');
const releaseDirectory = resolve('release');
const archivePath = join(releaseDirectory, `tabibe-v${packageJson.version}.zip`);
const stagingDirectory = await mkdtemp(join(tmpdir(), 'tabibe-package-'));
const contentDirectory = join(stagingDirectory, 'content');
const candidatePath = join(stagingDirectory, basename(archivePath));
const metadataNames = new Set(['.DS_Store', 'Thumbs.db']);
const forbiddenDirectories = new Set([
  '.git',
  '.github',
  'documents',
  'node_modules',
  'src',
  'test-results',
  'tests',
]);
const forbiddenExtensions = /\.(?:crx|key|map|p12|pem|pfx|zip)$/iu;

async function copyPackageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (metadataNames.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (
      entry.isSymbolicLink() ||
      entry.name.startsWith('.env') ||
      (entry.isDirectory() && forbiddenDirectories.has(entry.name)) ||
      forbiddenExtensions.test(entry.name)
    ) {
      throw new Error(`Forbidden package file: ${relative(distDirectory, path)}`);
    }
    const target = join(contentDirectory, relative(distDirectory, path));
    if (entry.isDirectory()) {
      await mkdir(target, { recursive: true });
      await copyPackageFiles(path);
    } else await copyFile(path, target);
  }
}

const manifest = JSON.parse(await readFile(join(distDirectory, 'manifest.json'), 'utf8'));
if (manifest.version !== packageJson.version)
  throw new Error('Build version does not match package.json.');
await mkdir(contentDirectory, { recursive: true });
await copyPackageFiles(distDirectory);
await copyFile('LICENSE', join(contentDirectory, 'LICENSE'));
execFileSync('zip', ['-q', '-r', candidatePath, '.'], { cwd: contentDirectory });
const archiveSize = (await stat(candidatePath)).size;
if (archiveSize > 10 * 1024 * 1024)
  throw new Error(`Internal 10 MB budget exceeded: ${candidatePath}`);
await mkdir(releaseDirectory, { recursive: true });
try {
  await stat(archivePath);
  const previousDirectory = join(releaseDirectory, 'previous');
  await mkdir(previousDirectory, { recursive: true });
  await rename(
    archivePath,
    join(previousDirectory, `tabibe-v${packageJson.version}-${Date.now()}.zip`),
  );
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await rename(candidatePath, archivePath);
console.info(
  `${basename(archivePath)}: ${archiveSize} bytes; existing archives retained in release/previous.`,
);
