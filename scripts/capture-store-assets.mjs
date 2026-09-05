import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createDefaultSettings, normalizeAppState } from '../src/domain/dataSchema.js';
import en from '../src/locales/en.js';
import tr from '../src/locales/tr.js';

const output = resolve(process.argv[2] || 'documents/chrome-store-20260905/assets');
const extensionPath = resolve('dist');
const manifest = JSON.parse(await readFile(join(extensionPath, 'manifest.json'), 'utf8'));
const browserProfile = await mkdtemp(join(tmpdir(), 'tabibe-store-'));
const context = await chromium.launchPersistentContext(browserProfile, {
  headless: false,
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
});
const artifacts = [];
const failures = [];
const networkRequests = [];
const samples = {
  en: {
    folder: 'Read & learn',
    notebook: 'Everyday',
    tag: 'Focus',
    titles: [
      'A little room for a big idea',
      'Today’s focus',
      'Weekend plans',
      'Reading list',
      'Things to explore',
      'A place for the small things',
    ],
    content:
      '## Make space for what matters\n\nA quiet place to collect ideas, find your favorite sites and plan the next step.\n\n### This week\n\n- [x] Gather ideas in one place\n- [ ] Make time for a new book\n- [ ] Turn one idea into a small project\n\n> Start small. Keep going.\n\n### Remember\n\nLeave a little room for something unexpected.',
    quick:
      'An idea for later\n\nA weekend reading corner: a good book, fresh coffee and a little time away from the screen.',
  },
  tr: {
    folder: 'Oku ve öğren',
    notebook: 'Günlük',
    tag: 'Odak',
    titles: [
      'Büyük bir fikir için küçük bir alan',
      'Bugünün odağı',
      'Hafta sonu planları',
      'Okuma listesi',
      'Keşfedilecek şeyler',
      'Küçük hatırlatmalar',
    ],
    content:
      '## Önemli olana yer aç\n\nFikirlerini toplamak, sevdiğin siteleri bulmak ve sonraki adımı planlamak için sakin bir alan.\n\n### Bu hafta\n\n- [x] Fikirleri tek yerde topla\n- [ ] Yeni bir kitaba zaman ayır\n- [ ] Bir fikri küçük bir projeye dönüştür\n\n> Küçük başla. Devam et.\n\n### Hatırla\n\nBeklenmedik güzel bir şeye de yer bırak.',
    quick:
      'Sonrası için bir fikir\n\nHafta sonu okuma köşesi: iyi bir kitap, taze kahve ve ekrandan uzakta biraz zaman.',
  },
};
function createSampleState(locale) {
  const copy = samples[locale];
  const site = (id, name, url, slug) => ({ id, name, url, icon: { preference: 'brand', slug } });
  return normalizeAppState({
    settings: { ...createDefaultSettings('light'), locale },
    sites: [
      site('s1', 'Wikipedia', 'https://wikipedia.org', 'wikipedia'),
      site('s2', 'YouTube', 'https://www.youtube.com', 'youtube'),
      site('s3', 'Notion', 'https://www.notion.so', 'notion'),
      site('s4', 'Spotify', 'https://open.spotify.com', 'spotify'),
      {
        id: 'f1',
        type: 'folder',
        name: copy.folder,
        children: [
          site('s5', 'MDN', 'https://developer.mozilla.org', 'mdnwebdocs'),
          site('s6', 'GitHub', 'https://github.com', 'github'),
          site('s7', 'TED', 'https://www.ted.com', 'ted'),
        ],
      },
      site('s8', 'Gmail', 'https://mail.google.com', 'gmail'),
      site('s9', 'Google Maps', 'https://maps.google.com', 'googlemaps'),
      site('s10', 'Pinterest', 'https://www.pinterest.com', 'pinterest'),
    ],
    noteNotebooks: [{ id: 'book', name: copy.notebook }],
    noteTags: [{ id: 'tag', name: copy.tag, colorToken: 'blue' }],
    notes: copy.titles.map((title, index) => ({
      id: `sample-${index}`,
      title,
      content: index === 0 ? copy.content : `${title}\n\n${copy.quick}`,
      notebookId: 'book',
      tagIds: index < 2 ? ['tag'] : [],
      isPinned: index === 0,
      isArchived: false,
      createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
      revision: 1,
    })),
  });
}
async function capture(page, path) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, animations: 'disabled' });
  const bytes = await readFile(path);
  artifacts.push({
    file: path.slice(output.length + 1),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}
try {
  await mkdir(output, { recursive: true });
  const page = await context.newPage();
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('request', (request) => {
    if (/^https?:/u.test(request.url())) networkRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('chrome://newtab/');
  await page.locator('.new-tab').waitFor();
  const extensionUrl = await page.evaluate(() => chrome.runtime.getURL('index.html'));
  for (const locale of ['en', 'tr']) {
    await mkdir(join(output, locale), { recursive: true });
    const copy = samples[locale];
    const labels = locale === 'en' ? en : tr;
    const state = createSampleState(locale);
    await page.evaluate(async (value) => {
      await chrome.storage.local.clear();
      await chrome.storage.local.set({ 'tabibe-state': value });
    }, state);
    await page.goto(extensionUrl);
    await page.locator('.speed-dial-item').first().waitFor();
    await capture(page, join(output, locale, '01-new-tab.png'));
    await page.getByRole('button', { name: copy.folder, exact: true }).click();
    await page.locator('.folder-modal').waitFor();
    await capture(page, join(output, locale, '02-folders.png'));
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: labels.note_library_entry, exact: true }).click();
    await page.getByRole('button', { name: labels.note_preview_show, exact: true }).click();
    await page.locator('.note-composer-preview').waitFor();
    await capture(page, join(output, locale, '03-notes.png'));
    await page.getByRole('button', { name: labels.note_library_close, exact: true }).click();
    await page.getByRole('button', { name: labels.note_capture_entry, exact: true }).click();
    await page.locator('textarea').fill(copy.quick);
    await page.locator('.note-save-status--saved').waitFor();
    await capture(page, join(output, locale, '04-quick-note.png'));
    await page.getByRole('button', { name: labels.note_capture_close, exact: true }).click();
    await page.evaluate(async () => {
      const values = await chrome.storage.local.get('tabibe-state');
      values['tabibe-state'].settings.theme = 'dark';
      values['tabibe-state'].settings.backgroundColor = '#1b5e20';
      await chrome.storage.local.set(values);
    });
    await page.goto(extensionUrl);
    await page.getByRole('button', { name: labels.footer_settings, exact: true }).click();
    await page.locator('.settings-panel').waitFor();
    await capture(page, join(output, locale, '05-settings-dark.png'));
  }
  const designPage = await context.newPage();
  const icon = `data:image/png;base64,${(await readFile('public/icons/icon-128.png')).toString('base64')}`;
  for (const [name, width, height] of [
    ['promo-small.png', 440, 280],
    ['promo-marquee.png', 1400, 560],
  ]) {
    await designPage.setViewportSize({ width, height });
    await designPage.setContent(
      `<html lang="en"><head><meta charset="utf-8"><title>Tabibe</title></head><body style="margin:0;background:#0b57d0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280" width="100%" height="100%" role="img" aria-label="Tabibe"><rect width="440" height="280" fill="#0b57d0"/><rect x="56" y="54" width="106" height="106" rx="2" fill="#fff"/><image href="${icon}" x="71" y="69" width="76" height="76"/><text x="56" y="211" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#fff">Tabibe</text><g fill="none" stroke="#a6c8ff" stroke-width="3"><rect x="248" y="57" width="140" height="95" rx="2"/><path d="M248 78h140M267 96h27m12 0h27m12 0h24M267 115h55M267 132h95"/><rect x="284" y="169" width="104" height="62" rx="2"/><path d="M298 187h13m8 0h50M298 204h13m8 0h50M298 220h13m8 0h30"/></g></svg></body></html>`,
    );
    await capture(designPage, join(output, name));
  }
  await copyFile('public/icons/icon-128.png', join(output, 'icon-128.png'));
  if (failures.length || networkRequests.length)
    throw new Error(JSON.stringify({ failures, networkRequests }));
  await writeFile(
    join(output, 'manifest.json'),
    JSON.stringify(
      {
        version: manifest.version,
        capturedAt: new Date().toISOString(),
        source:
          'Unpacked production extension, isolated synthetic-data profile; screenshot pixels are unmodified.',
        browser: context.browser().version(),
        browserProfile,
        failures,
        networkRequests,
        artifacts,
      },
      null,
      2,
    ),
  );
  console.info(`Captured ${artifacts.length} assets to ${output}`);
} finally {
  await context.close();
}
