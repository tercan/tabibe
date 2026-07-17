import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

async function getCssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await getCssFiles(path)));
    else if (extname(entry.name) === '.css') files.push(path);
  }

  return files;
}

const violations = [];
const sourceDirectory = resolve('src');
const cssFiles = await getCssFiles(sourceDirectory);

for (const file of cssFiles) {
  const contents = await readFile(file, 'utf8');
  const lines = contents.split('\n');

  lines.forEach((line, index) => {
    const value = line.split(':').slice(1).join(':').trim().replace(/;$/, '');
    const property = line.split(':')[0].trim();
    const location = `${relative(process.cwd(), file)}:${index + 1}`;

    if (/\b(?:linear|radial|conic)-gradient\s*\(/i.test(line)) {
      violations.push(`${location} gradients are not allowed`);
    }
    if (property === 'letter-spacing' && value !== '0') {
      violations.push(`${location} letter-spacing must be 0`);
    }
    if (property === 'border-radius' && value !== 'var(--border-radius)') {
      violations.push(`${location} border-radius must use --border-radius`);
    }
    if (
      !property.startsWith('--') &&
      /^(?:color|background|background-color|border(?:-[a-z-]+)?-color)$/.test(property) &&
      /^(?:#|rgba?\(|hsla?\()/i.test(value)
    ) {
      violations.push(`${location} raw colors must be design tokens`);
    }
    if (property === 'box-shadow' && value !== 'none' && !value.includes('var(--shadow-')) {
      violations.push(`${location} box-shadow must use a shadow token`);
    }
    if (
      /^(?:margin|margin-[a-z-]+|padding|padding-[a-z-]+|gap)$/.test(property) &&
      /-?\d*\.?\d+(?:rem|em)\b/.test(value) &&
      !value.includes('var(')
    ) {
      violations.push(`${location} spacing must use a spacing token`);
    }
  });

  const radiusMatch = contents.match(/--border-radius:\s*([\d.]+)rem/);
  if (radiusMatch && Number(radiusMatch[1]) > 0.25) {
    violations.push(`${relative(process.cwd(), file)} --border-radius exceeds 0.25rem`);
  }
}

if (violations.length > 0) {
  throw new Error(`CSS standards check failed:\n${violations.join('\n')}`);
}

console.info(`CSS standards passed for ${cssFiles.length} file(s).`);
