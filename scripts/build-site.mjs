import { readFile, writeFile } from 'node:fs/promises';
import { format } from 'prettier';
import { transformWithEsbuild } from 'vite';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const websiteUrl = 'https://tercan.github.io/tabibe/';
const repositoryUrl = 'https://github.com/tercan/tabibe';
const releaseUrl = `${repositoryUrl}/releases/tag/v${version}`;
const downloadUrl = `${repositoryUrl}/releases/download/v${version}/tabibe-v${version}.zip`;
const checksumUrl = `${repositoryUrl}/releases/download/v${version}/SHA256SUMS.txt`;
const languages = [
  'Türkçe',
  'English',
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
  brand: '<rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M9 9v12"/>',
  github:
    '<path fill="currentColor" stroke="none" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  zap: '<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
  notes: '<path d="M4 4h12v16H4Z"/><path d="m11 13 8-8 2 2-8 8-3 1Z"/>',
  move: '<path d="M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4M18 8l4 4-4 4"/>',
  moon: '<path d="M20 14A9 9 0 0 1 10 4a9 9 0 1 0 10 10Z"/>',
  image:
    '<rect x="3" y="3" width="18" height="18"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
  database:
    '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10v10M3 7l9 5 9-5"/>',
  pen: '<path d="m4 16 12-12 4 4-12 12-5 1Zm10-10 4 4"/>',
  package: '<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10v10M3 7l9 5 9-5M7 4l9 5v4"/>',
  previous: '<path d="m14 6-6 6 6 6"/>',
  next: '<path d="m10 6 6 6-6 6"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',

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
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
}
function renderPicture(prefix, locale, name, alt, priority = false) {
  const base = `${prefix}assets/${locale}/${name}`;
  const sizes =
    '(max-width: 36rem) calc(100vw - 2rem), (max-width: 40rem) calc(100vw - 3rem), (max-width: 64rem) 37.5rem, 34rem';
  return `<picture><source srcset="${base}-640.webp 640w, ${base}.webp 1280w" sizes="${sizes}" type="image/webp"><img src="${base}.png" width="1280" height="800" alt="${escapeHtml(alt)}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}
function renderCard(copy) {
  return `<article class="card"><span class="card-icon">${renderIcon(copy.icon)}</span><h3>${escapeHtml(copy.title)}</h3><p>${escapeHtml(copy.description)}</p></article><!-- /.card -->`;
}
function renderSlide(copy, prefix, locale, theme, index) {
  const label = theme === 'dark' ? copy.darkLabel : copy.lightLabel;
  const alt = theme === 'dark' ? copy.darkAlt : copy.lightAlt;
  return `<div class="hero-slide${index === 0 ? ' is-active' : ''}" role="group" aria-roledescription="${escapeHtml(copy.slideRole)}" aria-label="${escapeHtml(label)} (${index + 1}/2)" aria-hidden="${index !== 0}" ${index ? 'inert' : ''} data-slide-label="${escapeHtml(label)}"><a href="${prefix}assets/${locale}/hero-${theme}.png">${renderPicture(prefix, locale, `hero-${theme}`, alt, index === 0)}</a><p class="slide-loading" hidden>${escapeHtml(copy.slideLoading)}</p><p class="slide-error" hidden>${escapeHtml(copy.slideError)}</p></div><!-- /.hero-slide -->`;
}
const languageIds = ['tr', 'en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'ar', 'hi', 'bn', 'zh', 'ja'];
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
  const navigation = `<a href="#features">${escapeHtml(copy.featuresLink)}</a><a href="#philosophy">${escapeHtml(copy.designLink)}</a><a href="#tech">${escapeHtml(copy.technologyLink)}</a><a href="#languages">${escapeHtml(copy.languagesLink)}</a>`;
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
    screenshot: `${websiteUrl}assets/${locale}/hero-dark.png`,
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
<link rel="preload" href="${prefix}assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="${prefix}assets/icon-128.png" type="image/png"><link rel="stylesheet" href="${prefix}styles.css">
<script src="${prefix}script.js" defer></script><script type="application/ld+json">${structuredData}</script>
</head>
<body>
<a class="skip-link" href="#main">${escapeHtml(copy.skip)}</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="#hero"><span class="logo-icon">${renderIcon('brand')}</span><span>Tabibe</span></a>
    <nav id="primary-navigation" aria-label="${escapeHtml(copy.navigation)}">${navigation}</nav><!-- /#primary-navigation -->
    <div class="header-actions">
      <button class="button button--secondary menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="${escapeHtml(copy.menuOpen)}" data-menu-open="${escapeHtml(copy.menuOpen)}" data-menu-close="${escapeHtml(copy.menuClose)}" hidden>${renderIcon('menu')}</button>
      <a class="button button--secondary github-link" href="${repositoryUrl}" target="_blank" rel="noopener noreferrer">${renderIcon('github')}GitHub</a>
      <a class="button button--secondary language-link" href="${locale === 'en' ? 'tr/' : '../'}" hreflang="${locale === 'en' ? 'tr' : 'en'}" aria-label="${escapeHtml(copy.languageLabel)}">${escapeHtml(copy.languageLink)}</a>
    </div><!-- /.header-actions -->
  </div><!-- /.header-inner -->
</header><!-- /.site-header -->
<main id="main">
<section class="hero" id="hero" aria-labelledby="hero-title">
  <svg class="hero-glow" viewBox="0 0 800 800" aria-hidden="true"><circle cx="400" cy="400" r="400"/></svg>
  <div class="container hero-layout">
    <div class="hero-content">
      <p class="hero-badge"><svg viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="4"/></svg>${escapeHtml(copy.badge)}</p>
      <h1 id="hero-title">${escapeHtml(copy.heroTitlePrefix)}${copy.heroTitleBreak ? '<br>' : ' '}<span>${escapeHtml(copy.heroTitleAccent)}</span></h1>
      <p class="hero-description">${escapeHtml(copy.heroDescription)}</p>
      <div class="hero-actions"><a class="button button--primary" href="${downloadUrl}">${renderIcon('download')}${escapeHtml(copy.download)}</a><a class="button button--secondary" href="#features">${escapeHtml(copy.heroSecondary)}</a></div><!-- /.hero-actions -->
      <dl class="hero-stats">${copy.statValues.map((value, index) => `<div><dt>${escapeHtml(copy.statLabels[index])}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl><!-- /.hero-stats -->
    </div><!-- /.hero-content -->
    <figure class="hero-preview">
      <div class="preview-window" data-carousel role="group" aria-roledescription="${escapeHtml(copy.carouselRole)}" aria-label="${escapeHtml(copy.carouselLabel)}" data-play-label="${escapeHtml(copy.playSlides)}" data-pause-label="${escapeHtml(copy.pauseSlides)}" data-reduced-label="${escapeHtml(copy.reducedSlides)}">
        <div class="preview-toolbar">
          <svg class="window-dots" viewBox="0 0 48 12" aria-hidden="true"><circle cx="6" cy="6" r="6"/><circle cx="24" cy="6" r="6"/><circle cx="42" cy="6" r="6"/></svg>
          <span class="preview-label" aria-hidden="true">${escapeHtml(copy.darkLabel)}</span>
          <div class="preview-controls" hidden>
            <button type="button" class="preview-control preview-play" data-play aria-label="${escapeHtml(copy.playSlides)}"><span class="play-icon">${renderIcon('play')}</span><span class="pause-icon" hidden>${renderIcon('pause')}</span></button>
            <button type="button" class="preview-control" data-previous aria-label="${escapeHtml(copy.previousSlide)}">${renderIcon('previous')}</button>
            <button type="button" class="preview-control" data-next aria-label="${escapeHtml(copy.nextSlide)}">${renderIcon('next')}</button>
          </div><!-- /.preview-controls -->
        </div><!-- /.preview-toolbar -->
        <div class="hero-stage" aria-live="polite" aria-atomic="false">${renderSlide(copy, prefix, locale, 'dark', 0)}${renderSlide(copy, prefix, locale, 'light', 1)}</div><!-- /.hero-stage -->
      </div><!-- /.preview-window -->
      <figcaption>${escapeHtml(copy.heroCaption)}</figcaption>
      <noscript><p class="preview-fallback"><a href="${prefix}assets/${locale}/hero-dark.png">${escapeHtml(copy.darkLabel)}</a> · <a href="${prefix}assets/${locale}/hero-light.png">${escapeHtml(copy.lightLabel)}</a></p></noscript>
    </figure><!-- /.hero-preview -->
  </div><!-- /.hero-layout -->
</section><!-- /#hero -->
<section class="section section--surface" id="features" aria-labelledby="features-title"><div class="container"><div class="section-intro"><h2 id="features-title">${escapeHtml(copy.featuresTitle)}</h2><p>${escapeHtml(copy.featuresDescription)}</p></div><!-- /.section-intro --><div class="card-grid">${copy.features.map(renderCard).join('')}</div><!-- /.card-grid --></div><!-- /.container --></section><!-- /#features -->
<section class="section" id="philosophy" aria-labelledby="philosophy-title"><div class="container"><div class="section-intro"><h2 id="philosophy-title">${escapeHtml(copy.designTitle)}</h2><p>${escapeHtml(copy.designDescription)}</p></div><!-- /.section-intro --><div class="card-grid card-grid--philosophy">${copy.designItems.map((item, index) => `<article class="card card--center"><span class="card-number" aria-hidden="true">0${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article><!-- /.card -->`).join('')}</div><!-- /.card-grid --></div><!-- /.container --></section><!-- /#philosophy -->
<section class="section section--surface" id="tech" aria-labelledby="tech-title"><div class="container"><div class="section-intro"><h2 id="tech-title">${escapeHtml(copy.technologyTitle)}</h2><p>${escapeHtml(copy.technologyDescription)}</p></div><!-- /.section-intro --><div class="card-grid card-grid--technology">${copy.technologyItems.map(renderCard).join('')}</div><!-- /.card-grid --></div><!-- /.container --></section><!-- /#tech -->
<section class="section" id="languages" aria-labelledby="languages-title"><div class="container"><div class="section-intro"><h2 id="languages-title">${escapeHtml(copy.languagesTitle)}</h2><p>${escapeHtml(copy.languagesDescription)}</p></div><!-- /.section-intro --><ul class="languages">${languages.map((item, index) => `<li><svg class="language-flag" viewBox="0 0 24 16" aria-hidden="true"><use href="${prefix}assets/flags.svg#${languageIds[index]}"/></svg><span lang="${languageIds[index]}">${item}</span></li>`).join('')}</ul></div><!-- /.container --></section><!-- /#languages -->
<section class="section section--surface install-section" id="install" aria-labelledby="install-title"><div class="container"><div class="section-intro"><h2 id="install-title">${escapeHtml(copy.installTitle)}</h2><p>${escapeHtml(copy.installDescription)}</p></div><!-- /.section-intro --><div class="actions"><a class="button button--primary" href="${downloadUrl}">${renderIcon('download')}${escapeHtml(copy.download)}</a><a class="button button--secondary" href="${releaseUrl}">${renderIcon('github')}${escapeHtml(copy.releaseNotes)}</a></div><!-- /.actions --><p class="download-note">${escapeHtml(copy.downloadNote)}</p><details class="install-details"><summary>${escapeHtml(copy.installDetails)}</summary><ol class="install-steps">${copy.installSteps.map((item, index) => `<li><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>${index === 1 ? `<div class="copy-control"><code id="extension-address">chrome://extensions</code><button class="button button--secondary" type="button" hidden data-copy-target="extension-address" data-success="${escapeHtml(copy.copied)}" data-error="${escapeHtml(copy.copyError)}">${escapeHtml(copy.copyAddress)}</button></div><!-- /.copy-control --><p class="copy-status" id="copy-status" role="status" aria-live="polite"></p>` : ''}</li>`).join('')}</ol><p class="update-note">${escapeHtml(copy.updateNote)}</p><a class="text-link" href="${checksumUrl}">${escapeHtml(copy.checksums)}</a><p class="privacy-link"><a class="text-link" href="${privacyUrl}">${escapeHtml(copy.privacyLink)}</a></p></details></div><!-- /.container --></section><!-- /#install -->
</main><!-- /#main -->
<footer class="site-footer"><div class="container footer-inner"><p>${renderIcon('terminal')}<a href="https://tercan.net/">Tercan Keskin</a></p><nav aria-label="${escapeHtml(copy.source)}"><a href="${repositoryUrl}">GitHub</a><a href="${repositoryUrl}/issues">${escapeHtml(copy.support)}</a><a href="${privacyUrl}">${escapeHtml(copy.privacyLink)}</a><a href="${repositoryUrl}/blob/v${version}/LICENSE">${escapeHtml(copy.license)}</a></nav></div><!-- /.footer-inner --></footer><!-- /.site-footer -->
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

const interactions = await readFile('scripts/site-interactions.js', 'utf8');
const compiled = await transformWithEsbuild(interactions, 'site-interactions.js', {
  minify: true,
  target: 'es2020',
});
await writeFile('docs/script.js', compiled.code);
