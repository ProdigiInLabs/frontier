import { describe, expect, it } from 'vitest';
import { notFoundRoute, resolveRoute } from '@/routing/manifest';
import { buildHead, renderHeadToString } from './head';
import { buildLlmsTxt, buildRobots, buildSitemap } from './site-files';

type Node = { '@type': string; [key: string]: unknown };
const graph = (path: string) => (JSON.parse(buildHead(resolveRoute(path), path).jsonLd)['@graph'] as Node[]).map((n) => n['@type']);

describe('head', () => {
  it('emits canonical, Open Graph and Twitter tags', () => {
    const head = buildHead(resolveRoute('/intelligence'), '/intelligence');
    expect(head.canonical).toBe('https://prodiginl.com/intelligence');
    const names = head.meta.map((m) => m.name);
    for (const name of ['description', 'og:title', 'og:description', 'og:image', 'og:url', 'twitter:card', 'twitter:title']) expect(names).toContain(name);
    expect(head.title.endsWith('| Prodigi')).toBe(true);
  });

  it('uses the bare title on the homepage', () => {
    expect(buildHead(resolveRoute('/'), '/').title).toBe('Prodigi — Product · Digital · Intelligence');
  });

  it('includes Organization, WebSite, Service, Breadcrumb and FAQ schema where relevant', () => {
    expect(graph('/')).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'WebPage', 'FAQPage']));
    expect(graph('/intelligence/integrations')).toEqual(expect.arrayContaining(['Service', 'BreadcrumbList', 'FAQPage']));
    expect(graph('/about')).not.toContain('Service');
  });

  it('marks the 404 page noindex without a canonical', () => {
    const head = buildHead(notFoundRoute, '/missing');
    expect(head.canonical).toBeNull();
    expect(head.meta.find((m) => m.name === 'robots')?.content).toContain('noindex');
  });

  it('escapes JSON-LD against script injection', () => {
    const html = renderHeadToString({ title: 'x', meta: [], canonical: null, jsonLd: '{"a":"</script><script>alert(1)</script>"}' });
    expect(html).not.toContain('</script><script>');
  });
});

describe('site files', () => {
  it('lists indexable routes in the sitemap only', () => {
    const xml = buildSitemap('https://prodiginl.com', '2026-01-01');
    expect(xml).toContain('<loc>https://prodiginl.com/</loc>');
    expect(xml).toContain('<loc>https://prodiginl.com/intelligence/chat</loc>');
    expect(xml).not.toContain('/404');
  });

  it('references the sitemap from robots.txt', () => {
    expect(buildRobots('https://prodiginl.com')).toContain('Sitemap: https://prodiginl.com/sitemap.xml');
  });

  it('describes the entity in llms.txt', () => {
    const text = buildLlmsTxt('https://prodiginl.com');
    expect(text).toContain('Category: Product, Digital and Intelligence company');
    expect(text).toContain('What is GEO');
  });
});
