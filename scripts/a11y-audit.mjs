/**
 * Accessibility + runtime audit over the production build.
 * For every route: runs axe-core (WCAG 2.1 A/AA), fails on serious/critical
 * violations, and fails on any console error or uncaught page error.
 *
 *   npm run build && npm run test:a11y          (desktop + mobile viewports)
 *   SCREENSHOTS=1 npm run test:a11y             (also writes test-results/*.png)
 */
import { mkdirSync } from 'node:fs';
import { AxeBuilder } from '@axe-core/playwright';
import { launch } from './browser.mjs';
import { startServer } from './serve-dist.mjs';

const port = 4199;
const base = `http://localhost:${port}`;
const server = await startServer(port);
const { prerenderPaths } = await fetch(`${base}/sitemap.xml`)
  .then((r) => r.text())
  .then((xml) => ({ prerenderPaths: [...xml.matchAll(/<loc>[^<]*?(\/[^<]*)<\/loc>/g)].map((m) => new URL(m[1], base).pathname) }));
const paths = [...new Set([...prerenderPaths, '/this-page-does-not-exist'])];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];
const shots = process.env.SCREENSHOTS === '1';
if (shots) mkdirSync('test-results', { recursive: true });

const browser = await launch();
let failures = 0;

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, isMobile: viewport.isMobile ?? false, reducedMotion: 'reduce' });
  for (const path of paths) {
    const page = await context.newPage();
    const errors = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const expected404 = (msg) => path === '/this-page-does-not-exist' && /404/.test(msg);
    const realErrors = errors.filter((msg) => !expected404(msg));
    if (serious.length || realErrors.length) {
      failures += 1;
      console.log(`✗ [${viewport.name}] ${path}`);
      for (const v of serious) console.log(`   ${v.impact}: ${v.id} — ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target}`);
      for (const e of realErrors) console.log(`   console: ${e}`);
    } else {
      console.log(`✓ [${viewport.name}] ${path}`);
    }
    if (shots) await page.screenshot({ path: `test-results/${viewport.name}${path.replace(/\//g, '_') || '_home'}.png`, fullPage: true });
    await page.close();
  }
  await context.close();
}

await browser.close();
server.close();
if (failures) {
  console.log(`\n${failures} page(s) failed.`);
  process.exit(1);
}
console.log('\nAll pages passed.');
