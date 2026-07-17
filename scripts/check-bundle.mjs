import { gzipSync } from 'node:zlib';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const INITIAL_JS_BUDGET = 170 * 1024;
const LAZY_CHUNK_BUDGET = 80 * 1024;
const DIST_BUDGET = 12 * 1024 * 1024;
const distDirectory = resolve('dist');
const assetsDirectory = join(distDirectory, 'assets');

async function getDirectorySize(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  let total = 0;

  for (const entry of entries) {
    const path = join(directory, entry.name);
    total += entry.isDirectory() ? await getDirectorySize(path) : (await stat(path)).size;
  }

  return total;
}

const assetFiles = await readdir(assetsDirectory);
const jsFiles = assetFiles.filter((file) => extname(file) === '.js');

if (jsFiles.length === 0) {
  throw new Error('No JavaScript bundle found in dist/assets. Run npm run build first.');
}

const sizes = [];
for (const file of jsFiles) {
  const contents = await readFile(join(assetsDirectory, file));
  sizes.push({ file, gzipSize: gzipSync(contents).length });
}

const indexHtml = await readFile(join(distDirectory, 'index.html'), 'utf8');
const initialFile = indexHtml.match(/<script[^>]+src=["']\.\/assets\/([^"']+\.js)["']/i)?.[1];
const initialChunk = sizes.find((chunk) => chunk.file === initialFile);
if (!initialChunk) {
  throw new Error('Unable to identify the initial JavaScript chunk from dist/index.html.');
}

const lazyChunks = sizes.filter((chunk) => chunk.file !== initialFile);

if (initialChunk.gzipSize > INITIAL_JS_BUDGET) {
  throw new Error(`Initial JS ${initialChunk.gzipSize} exceeds ${INITIAL_JS_BUDGET} bytes.`);
}

for (const chunk of lazyChunks) {
  if (chunk.gzipSize > LAZY_CHUNK_BUDGET) {
    throw new Error(`Lazy chunk ${chunk.file} exceeds ${LAZY_CHUNK_BUDGET} bytes.`);
  }
}

const distSize = await getDirectorySize(distDirectory);
if (distSize > DIST_BUDGET) {
  throw new Error(`Distribution size ${distSize} exceeds ${DIST_BUDGET} bytes.`);
}

for (const chunk of [initialChunk, ...lazyChunks].sort(
  (first, second) => second.gzipSize - first.gzipSize,
)) {
  console.info(
    `${relative(process.cwd(), join(assetsDirectory, chunk.file))}: ${chunk.gzipSize} gzip bytes`,
  );
}
console.info(`dist total: ${distSize} bytes`);
