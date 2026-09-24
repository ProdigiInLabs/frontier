/**
 * Static site generation.
 *
 *   vite build (client)  →  dist/            (index.html template + hashed assets)
 *   vite build --ssr     →  dist-ssr/        (build-time renderer, never deployed)
 *   node prerender.mjs   →  dist/**\/index.html for every route, 404.html,
 *                           redirect pages, sitemap.xml, robots.txt, llms.txt
 *                           and SPA-fallback/redirect config for common hosts.
 *
 * The output in dist/ is plain static files: no Node server is required.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(join(dist, '.vite', 'manifest.json'), 'utf8'));
const server = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);

const escapeAttr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// ---- Assets referenced by a page chunk (recursively): CSS to inline as <link>, JS to modulepreload.
function collectAssets(key, seen = new Set(), out = { css: new Set(), js: new Set() }) {
  if (seen.has(key)) return out;
  seen.add(key);
  const chunk = manifest[key];
  if (!chunk) return out;
  if (!chunk.isEntry) out.js.add(chunk.file);
  for (const css of chunk.css ?? []) out.css.add(css);
  for (const imported of chunk.imports ?? []) collectAssets(imported, seen, out);
  return out;
}

const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry);
const entryAssets = collectAssets(entryKey);

// The Latin variable font is on the critical path: preload it.
const assetFiles = readdirSync(join(dist, 'assets'));
const fontPreloads = assetFiles
  .filter((file) => /^geist-(mono-)?latin-wght-normal.*\.woff2$/.test(file))
  .map((file) => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin>`);

function pageAssetTags(pageModule) {
  const { css, js } = collectAssets(pageModule);
  const cssTags = [...css].filter((file) => !entryAssets.css.has(file)).map((file) => `<link rel="stylesheet" href="/${file}">`);
  const jsTags = [...js].filter((file) => !entryAssets.js.has(file)).map((file) => `<link rel="modulepreload" href="/${file}">`);
  return [...cssTags, ...jsTags];
}

/**
 * Each route is written twice: /product.html and /product/index.html.
 * Hosts differ in how they map a slash-less URL; with both files present,
 * every host serves /product directly (no 301 to /product/), matching the
 * canonical URLs.
 */
function outputPaths(path) {
  if (path === '/') return [join(dist, 'index.html')];
  if (path === '/404') return [join(dist, '404.html')];
  return [join(dist, `${path.slice(1)}.html`), join(dist, path.slice(1), 'index.html')];
}

function write(file, contents) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

// ---- Routes
let count = 0;
for (const path of server.prerenderPaths) {
  const result = await server.render(path);
  const head = [result.head, ...fontPreloads, ...pageAssetTags(result.pageModule)].join('\n    ');
  let html = template
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', result.html)
    .replace('<!--app-route-->', escapeAttr(result.routePath));
  if (result.shell === 'app') {
    html = html.replace('<html lang="en">', '<html lang="en" data-shell="app">');
  }
  for (const file of outputPaths(path)) write(file, html);
  count += 1;
}

// ---- Redirect aliases: static pages work on every host; host rules below add real 301s where supported.
for (const { from, to } of server.redirects) {
  const target = `${server.siteUrl}${to}`;
  const page =
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title>` +
      `<meta name="robots" content="noindex"><link rel="canonical" href="${target}">` +
      `<meta http-equiv="refresh" content="0; url=${to}"></head>` +
      `<body><p>This page has moved to <a href="${to}">${to}</a>.</p></body></html>`;
  for (const file of outputPaths(from)) write(file, page);
}

// ---- SEO / GEO files
const lastmod = new Date().toISOString().slice(0, 10);
for (const [name, contents] of Object.entries(server.siteFiles(lastmod))) write(join(dist, name), contents);

// ---- Host configuration (generated so redirects stay in sync with the route manifest)
const redirects = server.redirects;

// Netlify + Cloudflare Pages: _redirects. Real routes are files; unknown paths get 404.html with a 404 status.
write(join(dist, '_redirects'), `${redirects.map((r) => `${r.from}  ${r.to}  301`).join('\n')}\n`);

// Azure Static Web Apps.
write(
  join(dist, 'staticwebapp.config.json'),
  `${JSON.stringify(
    {
      trailingSlash: 'never',
      routes: redirects.map((r) => ({ route: r.from, redirect: r.to, statusCode: 301 })),
      responseOverrides: { 404: { rewrite: '/404.html', statusCode: 404 } },
      globalHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), geolocation=(), microphone=(self)',
      },
      mimeTypes: { '.webmanifest': 'application/manifest+json' },
    },
    null,
    2,
  )}\n`,
);

// Apache (.htaccess): clean URLs → /path/index.html, 301 aliases, 404 page, long-lived asset caching.
write(
  join(dist, '.htaccess'),
  [
    'Options -MultiViews',
    'DirectorySlash Off',
    'RewriteEngine On',
    ...redirects.map((r) => `RewriteRule ^${r.from.slice(1).replace(/\//g, '\\/')}/?$ ${r.to} [R=301,L]`),
    '# Remove trailing slashes (canonical URLs have none)',
    'RewriteCond %{REQUEST_FILENAME} -d',
    'RewriteRule ^(.+)/$ /$1 [R=301,L]',
    '# Serve prerendered route files: /product → /product.html',
    'RewriteCond %{REQUEST_FILENAME} !-f',
    'RewriteCond %{DOCUMENT_ROOT}/$1.html -f',
    'RewriteRule ^(.+?)/?$ /$1.html [L]',
    'ErrorDocument 404 /404.html',
    '<IfModule mod_headers.c>',
    '  <If "%{REQUEST_URI} =~ m#^/assets/#">',
    '    Header set Cache-Control "public, max-age=31536000, immutable"',
    '  </If>',
    '</IfModule>',
    '',
  ].join('\n'),
);

// ---- Clean up build-only artefacts
rmSync(join(dist, '.vite'), { recursive: true, force: true });
if (existsSync(ssrDir)) rmSync(ssrDir, { recursive: true, force: true });

console.log(`Prerendered ${count} routes and ${redirects.length} redirects into dist/`);
