import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import stylelint from 'stylelint';
import stylelintConfig from '../stylelint.config.js';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const pages = ['docs/index.html', 'docs/tr/index.html'];
function assert(value, message) {
  if (!value) throw new Error(message);
}
for (const filename of pages) {
  const dom = new JSDOM(await readFile(filename, 'utf8'));
  const document = dom.window.document;
  assert(document.querySelectorAll('h1').length === 1, `${filename}: expected one h1`);
  assert(document.querySelectorAll('main').length === 1, `${filename}: expected one main`);
  assert(
    document.querySelector('title').textContent.includes(version),
    `${filename}: stale version`,
  );
  const description = document.querySelector('meta[name="description"]').content;
  assert(
    description.length >= 120 && description.length <= 160,
    `${filename}: description length ${description.length}`,
  );
  assert(
    document.querySelectorAll('link[hreflang]').length === 3,
    `${filename}: locale links missing`,
  );
  assert(
    document
      .querySelector('link[rel="canonical"]')
      .href.startsWith('https://tercan.github.io/tabibe/'),
    `${filename}: canonical URL`,
  );
  for (const element of document.querySelectorAll(
    'img,script[src],link[rel="stylesheet"],source,use',
  )) {
    const path =
      element.getAttribute('src') || element.getAttribute('href') || element.getAttribute('srcset');
    assert(!/^https?:/u.test(path), `${filename}: remote asset ${path}`);
    for (const candidate of path.split(',')) {
      await stat(resolve(filename, '..', candidate.trim().split(/\s+/u)[0].split('#')[0]));
    }
  }
  assert(
    document.querySelectorAll('.languages li').length === 13,
    `${filename}: languages missing`,
  );
  for (const element of document.querySelectorAll('a[href^="#"]'))
    assert(
      document.getElementById(element.getAttribute('href').slice(1)),
      `${filename}: broken anchor`,
    );
  for (const section of document.querySelectorAll('section,article'))
    assert(section.querySelector('h1,h2,h3,h4,h5,h6'), `${filename}: section without heading`);
  assert(document.querySelectorAll('.hero-slide').length === 2, `${filename}: hero slides missing`);
  assert(
    document.querySelectorAll('#features .card').length === 9,
    `${filename}: original feature grid missing`,
  );
  assert(
    document.querySelector('#philosophy') && document.querySelector('#tech'),
    `${filename}: original sections missing`,
  );
  assert(
    document.querySelector('.hero-stats')?.closest('.hero-content'),
    `${filename}: hero stats moved`,
  );
  assert(
    document.querySelector('.logo-icon svg') && document.querySelector('.github-link'),
    `${filename}: original header missing`,
  );
  const data = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
  assert(data.softwareVersion === version, `${filename}: stale structured data`);
  dom.window.close();
}
const stylesheet = await readFile('docs/styles.css', 'utf8');
assert(!/gradient\(/u.test(stylesheet), 'Website gradients are not allowed');
assert(stylesheet.includes('prefers-reduced-motion'), 'Website reduced-motion handling missing');
assert(stylesheet.includes(':focus-visible'), 'Website keyboard focus missing');
assert((await stat('docs/script.js')).size <= 4096, 'Website script exceeds 4 KB budget');
const styles = await stylelint.lint({
  files: 'docs/styles.css',
  config: { ...stylelintConfig, ignoreFiles: [] },
  formatter: 'string',
});
assert(!styles.errored, styles.report);
console.info(
  'Site checks passed: versions, content, metadata, local assets, anchors, structure and script budget.',
);
