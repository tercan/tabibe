import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('docs');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1:4178');
    if (url.pathname === '/') {
      response.writeHead(302, { Location: '/tabibe/' });
      response.end();
      return;
    }
    if (!url.pathname.startsWith('/tabibe/')) {
      response.writeHead(404);
      response.end();
      return;
    }
    let filename = resolve(root, decodeURIComponent(url.pathname.slice('/tabibe/'.length)) || '.');
    if (filename !== root && !filename.startsWith(`${root}${sep}`)) {
      response.writeHead(403);
      response.end();
      return;
    }
    if ((await stat(filename)).isDirectory()) filename = resolve(filename, 'index.html');
    const bytes = await readFile(filename);
    response.writeHead(200, {
      'Content-Type': types[extname(filename)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    response.end(bytes);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 400);
    response.end('Not found');
  }
});
server.listen(4178, '127.0.0.1', () =>
  console.info('Pages preview: http://127.0.0.1:4178/tabibe/'),
);
