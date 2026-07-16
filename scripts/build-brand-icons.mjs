import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const packageDirectory = dirname(require.resolve('simple-icons'));
const packageJson = JSON.parse(await readFile(join(packageDirectory, 'package.json'), 'utf8'));
const iconData = JSON.parse(
  await readFile(join(packageDirectory, 'data/simple-icons.json'), 'utf8'),
);
const outputDirectory = resolve('public/brand-icons');
const iconDirectory = join(outputDirectory, 'icons');

if (packageJson.version !== '16.26.0') {
  throw new Error(`Expected simple-icons 16.26.0, received ${packageJson.version}.`);
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(iconDirectory, { recursive: true });

const catalog = {
  version: packageJson.version,
  icons: iconData.map((icon) => ({
    slug: icon.slug,
    title: icon.title,
    hex: icon.hex,
    aliases: Array.isArray(icon.aliases?.aka) ? icon.aliases.aka : [],
  })),
};

for (const icon of iconData) {
  const sourcePath = join(packageDirectory, 'icons', `${icon.slug}.svg`);
  const targetPath = join(iconDirectory, `${icon.slug}.svg`);
  const source = await readFile(sourcePath, 'utf8');
  const optimized = source
    .replace(/<title>.*?<\/title>/u, '')
    .replace('<path ', `<path fill="#${icon.hex}" `);

  await writeFile(targetPath, optimized);
}

await writeFile(join(outputDirectory, 'catalog.json'), JSON.stringify(catalog));
await copyFile(join(packageDirectory, 'LICENSE.md'), join(outputDirectory, 'LICENSE.md'));
await copyFile(join(packageDirectory, 'DISCLAIMER.md'), join(outputDirectory, 'DISCLAIMER.md'));

console.info(`Prepared ${catalog.icons.length} Simple Icons assets from v${catalog.version}.`);
