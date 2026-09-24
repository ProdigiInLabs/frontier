/**
 * Minimal static server for dist/ that behaves like a correctly configured
 * production host: /path → /path/index.html, unknown paths → 404.html with
 * status 404, long-lived caching for hashed assets. No dependencies.
 *
 *   node scripts/serve-dist.mjs [port]
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
};

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const bare = clean.replace(/\/$/, '');
  const candidates = [join(root, clean), join(root, `${bare}.html`), join(root, bare, 'index.html')];
  return candidates.find((file) => file.startsWith(root) && existsSync(file) && statSync(file).isFile());
}

export function startServer(port = 4173) {
  const server = createServer((req, res) => {
    const file = resolveFile(req.url ?? '/');
    const target = file ?? join(root, '404.html');
    res.statusCode = file ? 200 : 404;
    res.setHeader('Content-Type', types[extname(target)] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', target.includes(`${join(root, 'assets')}`) ? 'public, max-age=31536000, immutable' : 'no-cache');
    createReadStream(target).pipe(res);
  });
  return new Promise((resolvePromise) => server.listen(port, () => resolvePromise(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 4173);
  await startServer(port);
  console.log(`Serving dist/ at http://localhost:${port}`);
}
