import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';
import { format } from 'prettier';

const script = await readFile('public/privacy-policy.js', 'utf8');
const dom = new JSDOM(await readFile('public/privacy-policy.html', 'utf8'), {
  url: 'https://tercan.github.io/tabibe/privacy/',
});
const sandbox = { document: dom.window.document, window: dom.window, URL, URLSearchParams };
runInNewContext(`${script}\nglobalThis.translations = PRIVACY_TRANSLATIONS;`, sandbox);
const html = await format(dom.serialize().replace('<!DOCTYPE html>', '<!doctype html>'), {
  parser: 'html',
  printWidth: 100,
});
await writeFile('public/privacy-policy.html', html);
await mkdir('docs/privacy', { recursive: true });
await writeFile(
  'docs/privacy/index.html',
  html.replace('href="index.html"', 'href="../index.html"'),
);
await copyFile('public/privacy-policy.js', 'docs/privacy/privacy-policy.js');
await copyFile('public/privacy-policy.css', 'docs/privacy/privacy-policy.css');

const languages = { en: 'English', tr: 'Türkçe', fr: 'Français', de: 'Deutsch', it: 'Italiano' };
for (const [locale, name] of Object.entries(languages)) {
  const copy = sandbox.translations[locale];
  const paragraphs = (key) => copy[key].join('\n\n');
  const links = Object.entries(languages).map(([id, label]) =>
    id === locale ? label : `[${label}](privacy-policy${id === 'en' ? '' : `.${id}`}.md)`,
  );
  const sections = [
    `# ${copy.pageTitle}`,
    links.join(' | '),
    `**${copy.effectiveLabel}:** ${copy.effectiveDate}`,
    copy.intro,
    `## ${copy.dataTitle}`,
    paragraphs('dataParagraphs'),
    `## ${copy.permissionsTitle}`,
    copy.permissionsIntro,
    copy.permissionItems.map((item) => `- ${item}`).join('\n'),
    copy.permissionsClosing,
    `## ${copy.networkTitle}`,
    paragraphs('networkParagraphs'),
    `## ${copy.controlTitle}`,
    paragraphs('controlParagraphs'),
    `## ${copy.retentionTitle}`,
    paragraphs('retentionParagraphs'),
    `## ${copy.securityTitle}`,
    paragraphs('securityParagraphs'),
    `## ${copy.limitedTitle}`,
    paragraphs('limitedParagraphs'),
    `## ${copy.changesTitle}`,
    paragraphs('changesParagraphs'),
    `## ${copy.contactTitle}`,
    copy.contactText,
    `[${copy.contactLink}](https://github.com/tercan/tabibe/issues)`,
    `[${name}](https://tercan.github.io/tabibe/privacy/?lang=${locale})`,
  ];
  await writeFile(
    `docs/privacy-policy${locale === 'en' ? '' : `.${locale}`}.md`,
    `${sections.join('\n\n')}\n`,
  );
}
dom.window.close();
console.info(
  'Privacy policy synchronized: 13 languages, static HTML and five public Markdown copies.',
);
