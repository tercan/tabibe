import { readFile, writeFile } from 'node:fs/promises';
import { format } from 'prettier';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const websiteUrl = 'https://tercan.github.io/tabibe/';
const repositoryUrl = 'https://github.com/tercan/tabibe';
const releaseUrl = `${repositoryUrl}/releases/tag/v${version}`;
const downloadUrl = `${repositoryUrl}/releases/download/v${version}/tabibe-v${version}.zip`;
const checksumUrl = `${repositoryUrl}/releases/download/v${version}/SHA256SUMS.txt`;
const languages = [
  'English',
  'Türkçe',
  'Français',
  'Deutsch',
  'Italiano',
  'Español',
  'Português',
  'Русский',
  'العربية',
  'हिन्दी',
  'বাংলা',
  '中文',
  '日本語',
];
const iconPaths = {
  folder: '<path d="M3 7V4h6l3 3h9v13H3Z"/><path d="M3 11h18"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  palette:
    '<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h5a3 3 0 0 0 3-3c0-4-4-7-9-7Z"/><path d="M7 8h.01M12 6h.01M6 13h.01M17 8h.01"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  shield: '<path d="m12 3 8 4v6c0 4-8 8-8 8s-8-4-8-8V7Z"/><path d="m8 12 3 3 5-6"/>',
  language: '<path d="M3 5h12M9 2v3M5 5c0 5 3 9 8 11M13 5c0 5-4 10-10 12m12 4 4-11 4 11m-6-4h5"/>',
  terminal: '<path d="m4 5 6 7-6 7m9 0h7"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
};

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/gu,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}
function renderIcon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
}
function renderPicture(prefix, locale, name, alt, priority = false) {
  const base = `${prefix}assets/${locale}/${name}`;
  const sizes =
    name === '03-notes'
      ? '(max-width: 50rem) calc(100vw - 3rem), 50rem'
      : priority
        ? '(max-width: 62rem) calc(100vw - 3rem), 38rem'
        : '(max-width: 36rem) calc(100vw - 2rem), (max-width: 62rem) 45vw, 24rem';
  return `<picture><source srcset="${base}-640.webp 640w, ${base}.webp 1280w" sizes="${sizes}" type="image/webp"><img src="${base}.png" width="1280" height="800" alt="${escapeHtml(alt)}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}
function renderCard(copy, prefix, locale, screenshot = false) {
  const media = screenshot
    ? `<a class="card-image-link" href="${prefix}assets/${locale}/${copy.file}.png">${renderPicture(prefix, locale, copy.file, copy.alt)}</a>`
    : `<span class="card-icon">${renderIcon(copy.icon)}</span>`;
  return `<article class="card${screenshot ? ' card--screen' : ''}">${media}<div class="card-body"><h3>${escapeHtml(copy.title)}</h3><p>${escapeHtml(copy.description)}</p></div><!-- /.card-body --></article><!-- /.card -->`;
}
const copies = {};
for (const locale of ['en', 'tr']) {
  const raw = await readFile(`docs/locales/${locale}.json`, 'utf8');
  copies[locale] = JSON.parse(raw.replaceAll('{version}', version));
}
if (JSON.stringify(Object.keys(copies.en).sort()) !== JSON.stringify(Object.keys(copies.tr).sort()))
  throw new Error('Website locale keys differ.');

for (const locale of ['en', 'tr']) {
  const copy = copies[locale];
  const prefix = locale === 'en' ? '' : '../';
  const canonical = `${websiteUrl}${locale === 'tr' ? 'tr/' : ''}`;
  const privacyUrl = `${prefix}privacy/${locale === 'tr' ? '?lang=tr' : ''}`;
  const navigation = `<a href="#features">${escapeHtml(copy.featuresLink)}</a><a href="#screenshots">${escapeHtml(copy.previewLink)}</a><a href="#install">${escapeHtml(copy.installLink)}</a>`;
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tabibe',
    softwareVersion: version,
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Windows, macOS, Linux',
    description: copy.description,
    url: canonical,
    downloadUrl,
    screenshot: `${websiteUrl}assets/${locale}/03-notes.png`,
    license: 'https://www.gnu.org/licenses/gpl-3.0.html',
    author: { '@type': 'Person', name: 'Tercan Keskin', url: 'https://tercan.net/' },
  }).replaceAll('<', '\\u003c');
  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(copy.title)}</title><meta name="description" content="${escapeHtml(copy.description)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'">
<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="en" href="${websiteUrl}"><link rel="alternate" hreflang="tr" href="${websiteUrl}tr/"><link rel="alternate" hreflang="x-default" href="${websiteUrl}">
<meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(copy.title)}"><meta property="og:description" content="${escapeHtml(copy.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${websiteUrl}assets/social-cover.png"><meta property="og:image:width" content="1400"><meta property="og:image:height" content="560">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(copy.title)}"><meta name="twitter:description" content="${escapeHtml(copy.description)}"><meta name="twitter:image" content="${websiteUrl}assets/social-cover.png">
<link rel="icon" href="${prefix}assets/icon-128.png" type="image/png"><link rel="stylesheet" href="${prefix}styles.css">
<script src="${prefix}script.js" defer></script><script type="application/ld+json">${structuredData}</script>
</head>
<body>
<a class="skip-link" href="#main">${escapeHtml(copy.skip)}</a>
<header class="site-header"><div class="container header-inner"><a class="brand" href="${prefix || './'}"><img src="${prefix}assets/icon-128.png" width="128" height="128" alt="" aria-hidden="true"><span>Tabibe</span></a><nav aria-label="${escapeHtml(copy.navigation)}">${navigation}</nav><a class="language-link" href="${locale === 'en' ? 'tr/' : '../'}" hreflang="${locale === 'en' ? 'tr' : 'en'}" aria-label="${escapeHtml(copy.languageLabel)}">${escapeHtml(copy.languageLink)}</a></div><!-- /.header-inner --></header><!-- /.site-header -->
<main id="main">
<section class="hero" aria-labelledby="hero-title"><div class="container"><div class="hero-layout"><div class="hero-content"><p class="eyebrow">${escapeHtml(copy.badge)}</p><h1 id="hero-title">${escapeHtml(copy.heroTitle).replaceAll('\n', '<br>')}</h1><p class="lead">${escapeHtml(copy.heroDescription)}</p><div class="actions"><a class="button button--primary" href="${downloadUrl}">${renderIcon('download')}${escapeHtml(copy.download)}</a><a class="button button--secondary" href="${releaseUrl}">${escapeHtml(copy.releaseNotes)}${renderIcon('arrow')}</a></div><!-- /.actions --><p class="download-note">${escapeHtml(copy.downloadNote)}</p></div><!-- /.hero-content --><figure class="hero-preview"><a href="${prefix}assets/${locale}/01-new-tab.png">${renderPicture(prefix, locale, '01-new-tab', copy.heroAlt, true)}</a><figcaption>${escapeHtml(copy.heroCaption)}</figcaption></figure><!-- /.hero-preview --></div><!-- /.hero-layout --><dl class="facts">${copy.statValues.map((value, index) => `<div><dt>${escapeHtml(copy.statLabels[index])}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl><!-- /.facts --></div><!-- /.container --></section><!-- /.hero -->
<section class="section section--surface" id="notes" aria-labelledby="notes-title"><div class="container"><div class="section-intro"><p class="eyebrow">${escapeHtml(copy.newEyebrow)}</p><h2 id="notes-title">${escapeHtml(copy.newTitle)}</h2><p>${escapeHtml(copy.newDescription)}</p></div><!-- /.section-intro --><figure class="notes-preview"><a href="${prefix}assets/${locale}/03-notes.png">${renderPicture(prefix, locale, '03-notes', copy.notesAlt)}</a><figcaption>${escapeHtml(copy.notesCaption)}</figcaption></figure><!-- /.notes-preview --><ul class="release-highlights">${copy.newItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><!-- /.container --></section><!-- /#notes -->
<section class="section" id="features" aria-labelledby="features-title"><div class="container"><div class="section-intro"><h2 id="features-title">${escapeHtml(copy.featuresTitle)}</h2><p>${escapeHtml(copy.featuresDescription)}</p></div><!-- /.section-intro --><div class="card-grid">${copy.features.map((item) => renderCard(item, prefix, locale)).join('')}</div><!-- /.card-grid --></div><!-- /.container --></section><!-- /#features -->
<section class="section section--surface" id="screenshots" aria-labelledby="screenshots-title"><div class="container"><div class="section-intro"><h2 id="screenshots-title">${escapeHtml(copy.screenshotsTitle)}</h2><p>${escapeHtml(copy.screenshotsDescription)}</p></div><!-- /.section-intro --><div class="card-grid card-grid--screens">${copy.screenshots.map((item) => renderCard(item, prefix, locale, true)).join('')}</div><!-- /.card-grid --></div><!-- /.container --></section><!-- /#screenshots -->
<section class="section" aria-labelledby="languages-title"><div class="container"><div class="section-intro"><h2 id="languages-title">${escapeHtml(copy.languagesTitle)}</h2><p>${escapeHtml(copy.languagesDescription)}</p></div><!-- /.section-intro --><ul class="languages">${languages.map((item) => `<li>${item}</li>`).join('')}</ul></div><!-- /.container --></section><!-- /.section -->
<section class="section section--surface" id="install" aria-labelledby="install-title"><div class="container"><div class="section-intro"><h2 id="install-title">${escapeHtml(copy.installTitle)}</h2><p>${escapeHtml(copy.installDescription)}</p></div><!-- /.section-intro --><ol class="install-steps">${copy.installSteps.map((item, index) => `<li><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>${index === 1 ? `<div class="copy-control"><code id="extension-address">chrome://extensions</code><button class="button button--secondary" type="button" data-copy-target="extension-address" data-success="${escapeHtml(copy.copied)}" data-error="${escapeHtml(copy.copyError)}">${escapeHtml(copy.copyAddress)}</button></div><!-- /.copy-control --><p class="copy-status" id="copy-status" role="status" aria-live="polite"></p>` : ''}</li>`).join('')}</ol><p class="update-note">${escapeHtml(copy.updateNote)}</p><div class="actions"><a class="button button--primary" href="${downloadUrl}">${renderIcon('download')}${escapeHtml(copy.download)}</a><a class="text-link" href="${checksumUrl}">${escapeHtml(copy.checksums)}</a></div><!-- /.actions --></div><!-- /.container --></section><!-- /#install -->
<section class="section" aria-labelledby="faq-title"><div class="container container--reading"><div class="section-intro"><h2 id="faq-title">${escapeHtml(copy.faqTitle)}</h2></div><!-- /.section-intro --><div class="faq-list">${copy.faq.map((item) => `<details class="faq-item"><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</div><!-- /.faq-list --><p class="privacy-link"><a class="text-link" href="${privacyUrl}">${escapeHtml(copy.privacyLink)}${renderIcon('arrow')}</a></p></div><!-- /.container --></section><!-- /.section -->
</main><!-- /#main -->
<footer class="site-footer"><div class="container footer-inner"><p>${renderIcon('terminal')}${escapeHtml(copy.footerText)} <a href="https://tercan.net/">Tercan Keskin</a></p><nav aria-label="${escapeHtml(copy.source)}"><a href="${repositoryUrl}">${escapeHtml(copy.source)}</a><a href="${repositoryUrl}/issues">${escapeHtml(copy.support)}</a><a href="${privacyUrl}">${escapeHtml(copy.privacyLink)}</a><a href="${repositoryUrl}/blob/v${version}/LICENSE">${escapeHtml(copy.license)}</a></nav></div><!-- /.footer-inner --></footer><!-- /.site-footer -->
</body></html>`;
  await writeFile(
    locale === 'en' ? 'docs/index.html' : 'docs/tr/index.html',
    await format(html, { parser: 'html', printWidth: 100 }),
  );
}
await writeFile('docs/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${websiteUrl}sitemap.xml\n`);
await writeFile(
  'docs/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${websiteUrl}</loc></url><url><loc>${websiteUrl}tr/</loc></url><url><loc>${websiteUrl}privacy/</loc></url></urlset>\n`,
);
await writeFile('docs/.nojekyll', '');
console.info(`Built English and Turkish GitHub Pages for ${version}.`);
