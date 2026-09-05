import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const EXPECTED_LOCALES = [
  'ar',
  'bn',
  'de',
  'en',
  'es',
  'fr',
  'hi',
  'it',
  'ja',
  'pt',
  'ru',
  'tr',
  'zh',
];
const REQUIRED_PERMISSIONS = ['search', 'storage'];
const OPTIONAL_PERMISSIONS = ['favicon', 'system.memory'];
const FORBIDDEN_RUNTIME_PATTERNS = [
  /google\.com\/s2\/favicons/iu,
  /api\.iconify\.design/iu,
  /cdn\.simpleicons\.org/iu,
  /simpleicons\.org\/icons/iu,
];
const FORBIDDEN_ARCHIVE_PATTERNS = [
  /(^|\/)\.DS_Store$/u,
  /(^|\/)\.env(?:\.|$)/u,
  /(^|\/)(?:documents|node_modules|src|tests)(?:\/|$)/u,
  /\.(?:crx|key|map|p12|pem|pfx|zip)$/iu,
];
const REQUIRED_CSP_PARTS = [
  "default-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
  "connect-src 'self'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function sorted(values) {
  return [...values].sort();
}

const packageJson = await readJson(resolve('package.json'));
const packageLock = await readJson(resolve('package-lock.json'));
const sourceManifest = await readJson(resolve('public/manifest.json'));
const distManifest = await readJson(resolve('dist/manifest.json'));
const version = packageJson.version;
assert(sourceManifest.manifest_version === 3, 'Manifest V3 is required.');
assert(JSON.stringify(sourceManifest) === JSON.stringify(distManifest), 'Built manifest is stale.');
assert(!sourceManifest.host_permissions?.length, 'Unexpected host permissions.');
assert(!sourceManifest.optional_host_permissions?.length, 'Unexpected optional host permissions.');
assert(!sourceManifest.content_scripts?.length, 'Unexpected content scripts.');
for (const name of ['privacy-policy.html', 'privacy-policy.css', 'privacy-policy.js']) {
  assert(
    (await readFile(resolve('public', name), 'utf8')) ===
      (await readFile(resolve('dist', name), 'utf8')),
    `Built ${name} is stale.`,
  );
}

assert(packageLock.version === version, 'package-lock.json version does not match package.json.');
assert(
  packageLock.packages?.['']?.version === version,
  'package-lock.json root package version does not match package.json.',
);
assert(sourceManifest.version === version, 'Source manifest version does not match package.json.');
assert(distManifest.version === version, 'Built manifest version does not match package.json.');
assert(
  JSON.stringify(sorted(sourceManifest.permissions || [])) === JSON.stringify(REQUIRED_PERMISSIONS),
  'Required permissions must contain only search and storage.',
);
assert(
  JSON.stringify(sorted(sourceManifest.optional_permissions || [])) ===
    JSON.stringify(OPTIONAL_PERMISSIONS),
  'Optional permissions must contain only favicon and system.memory.',
);

const csp = sourceManifest.content_security_policy?.extension_pages || '';
for (const directive of REQUIRED_CSP_PARTS) {
  assert(csp.includes(directive), `Manifest CSP is missing: ${directive}`);
}

const sourceLocales = sorted(
  (await readdir(resolve('public/_locales'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);
assert(
  JSON.stringify(sourceLocales) === JSON.stringify(EXPECTED_LOCALES),
  `Manifest locale coverage must contain exactly the supported ${EXPECTED_LOCALES.length} locales.`,
);

for (const locale of EXPECTED_LOCALES) {
  const messages = await readJson(resolve('public/_locales', locale, 'messages.json'));
  assert(messages.extension_name?.message === 'Tabibe', `${locale} extension name is invalid.`);
  assert(
    typeof messages.extension_description?.message === 'string' &&
      messages.extension_description.message.length >= 20 &&
      messages.extension_description.message.length <= 132,
    `${locale} extension description must be between 20 and 132 characters.`,
  );
}

const storageSource = await readFile(resolve('src/lib/storage.js'), 'utf8');
assert(
  storageSource.includes(`import.meta.env.VITE_APP_VERSION || '${version}'`),
  'Storage export version fallback does not match package.json.',
);

const documentationChecks = [
  ['README.md', `**Current version:** \`${version}\``],
  ['docs/tr/README.md', `**Güncel sürüm:** \`${version}\``],
  ['CHANGELOG.md', `## [${version}]`],
  ['docs/tr/CHANGELOG.md', `## [${version}]`],
  ['docs/privacy-policy.md', 'Chrome’s built-in favicon provider'],
  ['docs/privacy-policy.tr.md', 'Chrome’un yerleşik favicon sağlayıcısı'],
  ['docs/privacy-policy.fr.md', 'fournisseur de favicons intégré de Chrome'],
  ['docs/privacy-policy.de.md', 'integrierten Favicon-Anbieter von Chrome'],
  ['docs/privacy-policy.it.md', 'provider di favicon integrato di Chrome'],
  ['docs/store-listing.md', 'Required permission: `storage`'],
  ['docs/tr/store-listing.md', 'Zorunlu izin: `storage`'],
  ['docs/fr/store-listing.md', 'Autorisation obligatoire : `storage`'],
  ['docs/de/store-listing.md', 'Erforderliche Berechtigung: `storage`'],
  ['docs/it/store-listing.md', 'Autorizzazione obbligatoria: `storage`'],
];

for (const [path, marker] of documentationChecks) {
  const contents = await readFile(resolve(path), 'utf8');
  assert(contents.includes(marker), `${path} is missing release marker: ${marker}`);
}

const storeListingDescriptions = [
  ['docs/store-listing.md', 'Short Description', '13 languages'],
  ['docs/tr/store-listing.md', 'Kısa Açıklama', '13 dilde'],
  ['docs/fr/store-listing.md', 'Description courte', '13 langues'],
  ['docs/de/store-listing.md', 'Kurzbeschreibung', '13 Sprachen'],
  ['docs/it/store-listing.md', 'Descrizione breve', '13 lingue'],
];

for (const [path, heading, localeMarker] of storeListingDescriptions) {
  const contents = await readFile(resolve(path), 'utf8');
  const shortDescription = contents.match(new RegExp(`## ${heading}\\n\\n([^\\n]+)`, 'u'))?.[1];
  assert(
    shortDescription?.length >= 20 && shortDescription.length <= 132,
    `${path} short description must be between 20 and 132 characters.`,
  );
  assert(contents.includes(localeMarker), `${path} is missing locale marker: ${localeMarker}`);
}

const assetFiles = (await readdir(resolve('dist/assets'))).filter(
  (file) => extname(file) === '.js',
);
const runtimeSource =
  (
    await Promise.all(assetFiles.map((file) => readFile(resolve('dist/assets', file), 'utf8')))
  ).join('\n') + (await readFile(resolve('dist/privacy-policy.js'), 'utf8'));
for (const pattern of FORBIDDEN_RUNTIME_PATTERNS) {
  assert(!pattern.test(runtimeSource), `Built runtime contains forbidden icon service: ${pattern}`);
}
assert(!/\beval\s*\(/u.test(runtimeSource), 'Built runtime contains eval().');
assert(!/\bnew\s+Function\s*\(/u.test(runtimeSource), 'Built runtime contains new Function().');

const trackedFiles = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);
assert(
  !trackedFiles.some((file) => /(^|\/)\.DS_Store$/u.test(file)),
  'A .DS_Store file is tracked.',
);
assert(
  !trackedFiles.some((file) => /(^|\/)documents(?:\/|$)/u.test(file)),
  'Internal documents must not be tracked.',
);

const trackedText = (
  await Promise.all(
    trackedFiles
      .filter((file) => !/\.(?:avif|gif|ico|jpe?g|png|webp|woff2?)$/iu.test(file))
      .map(async (file) => {
        try {
          return await readFile(resolve(file), 'utf8');
        } catch {
          return '';
        }
      }),
  )
).join('\n');
assert(
  !/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u.test(trackedText),
  'Private key found.',
);
assert(!/\bAKIA[0-9A-Z]{16}\b/u.test(trackedText), 'AWS access key found.');
assert(!/\bgh[opsu]_[A-Za-z0-9_]{30,}\b/u.test(trackedText), 'GitHub token found.');

const archivePath = resolve('release', `tabibe-v${version}.zip`);
assert((await stat(archivePath)).size <= 10 * 1024 * 1024, 'Release archive exceeds 10 MB.');
const archiveEntries = execFileSync('unzip', ['-Z1', archivePath], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
assert(archiveEntries.includes('manifest.json'), 'Release archive manifest is not at the root.');
assert(archiveEntries.includes('LICENSE'), 'Release archive is missing the project license.');
execFileSync('python3', ['scripts/verify-extension-archive.py'], { stdio: 'inherit' });
for (const entry of archiveEntries) {
  assert(
    !FORBIDDEN_ARCHIVE_PATTERNS.some((pattern) => pattern.test(entry)),
    `Release archive contains forbidden entry: ${entry}`,
  );
}

console.info(
  `Release readiness passed for v${version}: ${EXPECTED_LOCALES.length} locales, ${assetFiles.length} runtime chunks, ${archiveEntries.length} archive entries.`,
);
