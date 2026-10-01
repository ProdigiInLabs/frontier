/**
 * Regenerates src/knowledge/prodigi-knowledge.json from the frontend's own
 * content (src/content/*.ts), so the backend's grounding data can never
 * drift from what the site says. The generated file is committed to git
 * (like a lockfile) — the server's build never needs the frontend's source
 * tree, only this one JSON file.
 *
 *   npm run sync-knowledge          # regenerate after editing src/content/*.ts
 *   npm run check:knowledge         # CI: fail if the committed file is stale
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(serverRoot, '..');
const outPath = join(serverRoot, 'src/knowledge/prodigi-knowledge.json');
const checkOnly = process.argv.includes('--check');

const { site } = await import(join(repoRoot, 'src/content/site.ts'));
const { faqs } = await import(join(repoRoot, 'src/content/faqs.ts'));
const { capabilityPages } = await import(join(repoRoot, 'src/content/capabilities.ts'));
const { pillars } = await import(join(repoRoot, 'src/content/home.ts'));
const { intelligenceCapabilities } = await import(join(repoRoot, 'src/content/intelligence.ts'));

const knowledge = {
  generatedAt: new Date().toISOString(),
  entity: {
    name: site.name,
    legalName: site.legalName,
    acronym: site.acronym,
    category: site.category,
    summary: site.summary,
    definition: site.definition,
    principle: site.principle,
    audience: site.audience,
    problem: site.problem,
    capabilities: site.capabilities,
  },
  pillars: pillars.map((p) => ({ name: p.name, verb: p.verb, description: p.description, path: p.to })),
  intelligenceCapabilities: intelligenceCapabilities.map((c) => ({ name: c.name, summary: c.summary, examples: c.examples, path: c.to })),
  pages: capabilityPages.map((p) => ({
    title: p.navLabel,
    path: p.path,
    lead: p.lead,
    definition: p.definition,
    offerings: p.offerings.items.map((i) => `${i.title}: ${i.description}`),
  })),
  faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
};

const withoutTimestamp = ({ generatedAt: _generatedAt, ...rest }) => rest;

if (checkOnly) {
  const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : null;
  const upToDate = existing && JSON.stringify(withoutTimestamp(existing)) === JSON.stringify(withoutTimestamp(knowledge));
  if (!upToDate) {
    console.error(
      'server/src/knowledge/prodigi-knowledge.json is out of date with src/content/*.ts.\n' + 'Run `npm run sync-knowledge` in server/ and commit the result.',
    );
    process.exit(1);
  }
  console.log('prodigi-knowledge.json is up to date.');
} else {
  writeFileSync(outPath, `${JSON.stringify(knowledge, null, 2)}\n`);
  console.log(`Wrote ${knowledge.faqs.length} FAQs, ${knowledge.pages.length} pages → ${outPath}`);
}
