import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { capabilityPages } from '@/content/capabilities';
import { contactTopics } from '@/content/contact';
import { demos } from '@/content/demos';
import { faqs } from '@/content/faqs';
import { businessProblems, personas, valueChain } from '@/content/home';
import { intelligenceCapabilities } from '@/content/intelligence';
import { appNav, footerNav, primaryNav } from '@/content/navigation';
import { findRoute, getBreadcrumbs, normalizePath, redirects, routes } from './manifest';
import { pageModules } from './page-modules';

const root = join(import.meta.dirname, '..', '..');

const isInternalTarget = (to: string) => {
  const path = normalizePath(to);
  return Boolean(findRoute(path)) || redirects.some((r) => r.from === path);
};

describe('route manifest', () => {
  it('has unique paths and titles', () => {
    const paths = routes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    const titles = routes.map((r) => r.meta.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('includes every required URL', () => {
    const required = [
      '/', '/product', '/product/engineering', '/product/modernization', '/digital', '/digital/web', '/digital/seo', '/digital/aeo',
      '/digital/geo', '/intelligence', '/intelligence/ai-strategy', '/intelligence/chat', '/intelligence/assistants', '/intelligence/agents',
      '/intelligence/voice', '/intelligence/search', '/intelligence/automation', '/intelligence/integrations', '/demo', '/demo/enterprise-ai',
      '/contact', '/about', '/work', '/resources', '/solutions',
    ];
    for (const path of required) expect(findRoute(path), path).toBeDefined();
    for (const alias of ['/demo/ai-chat', '/demo/ai-agent']) expect(redirects.some((r) => r.from === alias)).toBe(true);
  });

  it('has search-friendly metadata on every route', () => {
    for (const route of routes) {
      expect(route.meta.title.length, route.path).toBeLessThanOrEqual(70);
      expect(route.meta.description.length, route.path).toBeGreaterThanOrEqual(70);
      expect(route.meta.description.length, route.path).toBeLessThanOrEqual(200);
    }
  });

  it('maps every page key to an existing feature module', () => {
    for (const [key, module] of Object.entries(pageModules)) {
      expect(existsSync(join(root, module)), `${key} → ${module}`).toBe(true);
    }
  });

  it('references only known FAQ ids', () => {
    const ids = new Set(faqs.map((f) => f.id));
    for (const route of routes) for (const id of Array.isArray(route.faqIds) ? route.faqIds : []) expect(ids.has(id), `${route.path}: ${id}`).toBe(true);
  });

  it('points redirects at real routes', () => {
    for (const r of redirects) expect(findRoute(r.to), r.to).toBeDefined();
  });

  it('builds breadcrumbs from the hierarchy', () => {
    expect(getBreadcrumbs('/intelligence/chat').map((c) => c.path)).toEqual(['/', '/intelligence', '/intelligence/chat']);
    expect(getBreadcrumbs('/')).toEqual([]);
  });

  it('normalizes trailing slashes, case and query strings', () => {
    expect(normalizePath('/Product/')).toBe('/product');
    expect(normalizePath('/contact?topic=modernize')).toBe('/contact');
  });
});

describe('internal links', () => {
  const links: string[] = [
    ...primaryNav.flatMap((g) => [g.to, ...(g.children ?? []).map((c) => c.to), ...(g.featured ? [g.featured.to] : [])]),
    ...appNav.flatMap((s) => s.items.map((i) => i.to)),
    ...footerNav.flatMap((c) => c.links.map((l) => l.to)),
    ...faqs.flatMap((f) => (f.links ?? []).map((l) => l.to)),
    ...businessProblems.map((p) => p.to),
    ...personas.flatMap((p) => p.links.map((l) => l.to)),
    ...valueChain.map((v) => v.to),
    ...intelligenceCapabilities.map((c) => c.to),
    ...demos.map((d) => d.to),
    ...capabilityPages.flatMap((p) => [...p.related, ...(p.secondaryAction ? [p.secondaryAction.to] : [])]),
  ];

  it.each([...new Set(links)])('%s resolves', (to) => {
    expect(isInternalTarget(to)).toBe(true);
  });

  it('uses known contact topics in capability CTAs', () => {
    const topics = new Set(contactTopics.map((t) => t.id));
    for (const page of capabilityPages) expect(topics.has(page.cta.topic)).toBe(true);
  });
});

describe('host configuration', () => {
  it('keeps vercel.json and deploy/nginx.conf redirects in sync with the manifest', async () => {
    const { readFileSync } = await import('node:fs');
    const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as { redirects: { source: string; destination: string }[] };
    const nginx = readFileSync(join(root, 'deploy/nginx.conf'), 'utf8');
    for (const r of redirects) {
      expect(vercel.redirects).toContainEqual(expect.objectContaining({ source: r.from, destination: r.to }));
      expect(nginx).toMatch(new RegExp(`location = ${r.from}\\s+\\{ return 301 ${r.to}; \\}`));
    }
  });
});
