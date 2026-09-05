import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const output = resolve('docs/assets');
const extensionPath = resolve('dist');
const profile = await mkdtemp(join(tmpdir(), 'tabibe-hero-'));
const context = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  timezoneId: 'Europe/Istanbul',
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
});
const results = [];
try {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-09-06T11:32:45+03:00'));
  await page.goto('chrome://newtab/');
  await page.locator('.new-tab').waitFor();
  const url = await page.evaluate(() => chrome.runtime.getURL('index.html'));
  const initial = await page.evaluate(
    async () => (await chrome.storage.local.get('tabibe-state'))['tabibe-state'],
  );
  for (const locale of ['en', 'tr']) {
    await mkdir(join(output, locale), { recursive: true });
    for (const theme of ['dark', 'light']) {
      const state = structuredClone(initial);
      state.settings = {
        ...state.settings,
        locale,
        theme,
        iconStyle: 'simple',
        backgroundColor: '',
        backgroundImage: '',
        searchEngine: 'browser',
        searchEngineChoiceVersion: 1,
        showMemory: false,
      };
      state.sites = state.sites.filter((site) =>
        ['Wikipedia', 'YouTube', 'Notion', 'Spotify', 'Gmail', 'Google Maps', 'Pinterest'].includes(
          site.name,
        ),
      );
      state.sites.splice(4, 0, {
        id: 'hero-folder',
        type: 'folder',
        name: locale === 'tr' ? 'Oku ve öğren' : 'Read & learn',
        children: [
          {
            id: 'hero-github',
            name: 'GitHub',
            url: 'https://github.com/',
            icon: { preference: 'brand', slug: 'github' },
          },
          {
            id: 'hero-mdn',
            name: 'MDN',
            url: 'https://developer.mozilla.org/',
            icon: { preference: 'brand', slug: 'mdnwebdocs' },
          },
          {
            id: 'hero-ted',
            name: 'TED',
            url: 'https://www.ted.com/',
            icon: { preference: 'brand', slug: 'ted' },
          },
        ],
      });
      await page.evaluate(
        async (value) => chrome.storage.local.set({ 'tabibe-state': value }),
        state,
      );
      await page.goto(url);
      await page.locator('.speed-dial-item').first().waitFor();
      await page.waitForFunction(
        (expected) => document.documentElement.dataset.theme === expected,
        theme,
      );
      await page.evaluate(() => document.fonts.ready);
      const filename = join(output, locale, `hero-${theme}.png`);
      await page.screenshot({ path: filename, animations: 'disabled' });
      for (const [suffix, width, height] of [
        ['', 1280, 800],
        ['-640', 640, 400],
      ]) {
        execFileSync('cwebp', [
          '-quiet',
          '-q',
          '90',
          '-m',
          '6',
          '-resize',
          String(width),
          String(height),
          filename,
          '-o',
          filename.replace('.png', `${suffix}.webp`),
        ]);
      }
      const bytes = await readFile(filename);
      results.push({
        locale,
        theme,
        iconStyle: 'simple',
        file: filename,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        width: bytes.readUInt32BE(16),
        height: bytes.readUInt32BE(20),
      });
    }
  }
  await mkdir('documents/pages-faithful-20260906', { recursive: true });
  await writeFile(
    'documents/pages-faithful-20260906/hero-screenshots.json',
    JSON.stringify(
      {
        profile,
        version: JSON.parse(await readFile('dist/manifest.json', 'utf8')).version,
        fixedClock: '2026-09-06T11:32:45+03:00',
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.info(JSON.stringify(results));
} finally {
  await context.close();
}
