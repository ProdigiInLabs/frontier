import { capabilityPages } from '@/content/capabilities';
import { faqs } from '@/content/faqs';
import { intelligenceCapabilities } from '@/content/intelligence';
import { site } from '@/content/site';
import { routes } from '@/routing/manifest';
import { absoluteUrl } from './structured-data';

/** sitemap.xml — every indexable route. */
export function buildSitemap(siteUrl: string, lastmod: string): string {
  const urls = routes
    .filter((route) => !route.meta.noindex && route.sitemap)
    .map(
      (route) =>
        `  <url>\n    <loc>${absoluteUrl(siteUrl, route.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${route.sitemap!.changefreq}</changefreq>\n    <priority>${route.sitemap!.priority.toFixed(1)}</priority>\n  </url>`,
    );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function buildRobots(siteUrl: string): string {
  return `User-agent: *\nAllow: /\nDisallow: /app/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

/** llms.txt — a plain-language entity summary for generative engines (GEO). */
export function buildLlmsTxt(siteUrl: string): string {
  const link = (path: string, label: string, note: string) => `- [${label}](${absoluteUrl(siteUrl, path)}): ${note}`;
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.definition}`,
    '',
    `- Entity: ${site.name} (${site.legalName})`,
    `- Category: ${site.category}`,
    `- Name meaning: ${site.acronym}`,
    `- Audience: ${site.audience}`,
    `- Problem solved: ${site.problem}`,
    `- Principle: ${site.principle}`,
    `- Capabilities: ${site.capabilities.join(', ')}`,
    '',
    '## Pillars',
    link('/product', 'Product', 'Product discovery, UX/UI, web, mobile, SaaS, APIs, backend, cloud, DevOps, security, performance, modernization.'),
    link('/digital', 'Digital', 'Websites, e-commerce, digital transformation, SEO, AEO, GEO, content, marketing, analytics, conversion.'),
    link('/intelligence', 'Intelligence', 'AI strategy, chat, assistants, agents, voice, search, automation and enterprise AI integration.'),
    '',
    '## Capability pages',
    ...capabilityPages.map((page) => link(page.path, page.navLabel, page.seo.description)),
    '',
    '## Interactive experiences (demo mode — no AI model or business system is connected)',
    ...intelligenceCapabilities.filter((c) => c.interactive).map((c) => link(c.to, c.name, c.summary)),
    link('/demo/enterprise-ai', 'Enterprise integration flow', 'Simulated request flow from user to AI to business systems.'),
    '',
    '## Answers',
    ...faqs.map((faq) => `### ${faq.question}\n${faq.answer}\n`),
    '## Contact',
    link('/contact', 'Start a conversation', 'Describe what you are trying to solve.'),
  ];
  return `${lines.join('\n')}\n`;
}
