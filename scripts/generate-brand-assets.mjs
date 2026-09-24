/* global document */
/**
 * Regenerates raster brand assets (Open Graph image, touch/app icons) from
 * HTML/SVG sources using Chromium. Run manually: `node scripts/generate-brand-assets.mjs`.
 * Output is committed to public/ so builds need no browser.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const font = (pkg, file) => `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', pkg, 'files', file)).toString('base64')}`;
const sans = font('@fontsource-variable/geist', 'geist-latin-wght-normal.woff2');
const mono = font('@fontsource-variable/geist-mono', 'geist-mono-latin-wght-normal.woff2');
const mark = readFileSync(join(root, 'public/brand/prodigi-mark.svg'), 'utf8');

const og = `<!doctype html><html><head><style>
@font-face { font-family: G; src: url(${sans}); font-weight: 100 900; }
@font-face { font-family: M; src: url(${mono}); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #f5f4ef; color: #0e0f12; font-family: G; position: relative; overflow: hidden;
  background-image: linear-gradient(rgba(14,15,18,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14,15,18,.05) 1px, transparent 1px); background-size: 60px 60px; }
.wrap { position: absolute; inset: 72px 72px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 16px; font-size: 40px; font-weight: 600; letter-spacing: -0.04em; }
.brand svg { width: 52px; height: 52px; border-radius: 12px; }
.eyebrow { margin-top: auto; font-family: M; font-size: 20px; letter-spacing: .12em; text-transform: uppercase; color: #5f636c; display: flex; gap: 28px; }
.eyebrow span::before { content: ''; display: inline-block; width: 12px; height: 12px; border-radius: 99px; margin-right: 10px; background: var(--c); }
h1 { margin-top: 28px; font-size: 62px; line-height: 1.02; letter-spacing: -0.045em; font-weight: 600; }
h1 span { display: block; } h1 span:nth-child(2) { color: #33363d; } h1 span:nth-child(3) { color: #5f636c; }
</style></head><body><div class="wrap">
<div class="brand">${mark}<span>prodigi</span></div>
<div class="eyebrow"><span style="--c:#c2410c">Product</span><span style="--c:#0f766e">Digital</span><span style="--c:#4f46e5">Intelligence</span></div>
<h1><span>Build better products.</span><span>Create stronger digital experiences.</span><span>Add intelligence where it matters.</span></h1>
</div></body></html>`;

const icon = (size) => `<!doctype html><html><head><style>*{margin:0} body{width:${size}px;height:${size}px} svg{width:${size}px;height:${size}px;display:block}</style></head><body>${mark}</body></html>`;

const browser = await launch();
const page = await browser.newPage();
const shots = [
  { html: og, w: 1200, h: 630, out: 'public/og/prodigi-og.png' },
  { html: icon(180), w: 180, h: 180, out: 'public/apple-touch-icon.png' },
  { html: icon(512), w: 512, h: 512, out: 'public/brand/prodigi-icon-512.png' },
];
for (const shot of shots) {
  await page.setViewportSize({ width: shot.w, height: shot.h });
  await page.setContent(shot.html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(root, shot.out), type: 'png' });
  console.log(`wrote ${shot.out}`);
}
await browser.close();
