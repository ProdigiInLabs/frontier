import { config } from '@/core/config/env';
import { site } from '@/content/site';
import type { RouteEntry } from '@/routing/manifest';
import { absoluteUrl, buildStructuredData } from './structured-data';

export const BRAND_SUFFIX = ' | Prodigi';

export interface HeadDescriptor {
  title: string;
  meta: { key: 'name' | 'property'; name: string; content: string }[];
  canonical: string | null;
  jsonLd: string;
}

export function formatTitle(route: RouteEntry): string {
  return route.page === 'home' ? route.meta.title : `${route.meta.title}${BRAND_SUFFIX}`;
}

/** Builds every head tag for a route. Shared by prerender (string) and client (DOM). */
export function buildHead(route: RouteEntry, pathname: string): HeadDescriptor {
  const { siteUrl, contactEmail } = config;
  const title = formatTitle(route);
  const canonical = route.meta.noindex ? null : absoluteUrl(siteUrl, route.path);
  const image = `${siteUrl}${site.ogImagePath}`;
  const description = route.meta.description;

  const meta: HeadDescriptor['meta'] = [
    { key: 'name', name: 'description', content: description },
    { key: 'name', name: 'robots', content: route.meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' },
    { key: 'property', name: 'og:type', content: 'website' },
    { key: 'property', name: 'og:site_name', content: site.name },
    { key: 'property', name: 'og:title', content: title },
    { key: 'property', name: 'og:description', content: description },
    { key: 'property', name: 'og:url', content: canonical ?? absoluteUrl(siteUrl, pathname) },
    { key: 'property', name: 'og:image', content: image },
    { key: 'property', name: 'og:image:width', content: '1200' },
    { key: 'property', name: 'og:image:height', content: '630' },
    { key: 'property', name: 'og:image:alt', content: 'Prodigi — Product · Digital · Intelligence' },
    { key: 'property', name: 'og:locale', content: 'en_US' },
    { key: 'name', name: 'twitter:card', content: 'summary_large_image' },
    { key: 'name', name: 'twitter:title', content: title },
    { key: 'name', name: 'twitter:description', content: description },
    { key: 'name', name: 'twitter:image', content: image },
  ];

  return {
    title,
    meta,
    canonical,
    jsonLd: JSON.stringify(buildStructuredData(route, pathname, siteUrl, contactEmail)),
  };
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Server-side: serialize to HTML. JSON-LD is escaped against </script> injection. */
export function renderHeadToString(head: HeadDescriptor): string {
  const tags = [
    `<title>${escapeHtml(head.title)}</title>`,
    ...head.meta.map((tag) => `<meta ${tag.key}="${tag.name}" content="${escapeHtml(tag.content)}" data-head="route">`),
    head.canonical ? `<link rel="canonical" href="${escapeHtml(head.canonical)}" data-head="route">` : '',
    `<script type="application/ld+json" data-head="route">${head.jsonLd.replace(/</g, '\\u003c')}</script>`,
  ];
  return tags.filter(Boolean).join('\n    ');
}

/** Client-side: replace route-owned head tags after navigation. */
export function applyHeadToDocument(head: HeadDescriptor, doc: Document = document): void {
  doc.title = head.title;
  doc.head.querySelectorAll('[data-head="route"]').forEach((node) => node.remove());
  const fragment = doc.createDocumentFragment();
  for (const tag of head.meta) {
    const el = doc.createElement('meta');
    el.setAttribute(tag.key, tag.name);
    el.setAttribute('content', tag.content);
    el.dataset.head = 'route';
    fragment.appendChild(el);
  }
  if (head.canonical) {
    const link = doc.createElement('link');
    link.rel = 'canonical';
    link.href = head.canonical;
    link.dataset.head = 'route';
    fragment.appendChild(link);
  }
  const script = doc.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.head = 'route';
  script.textContent = head.jsonLd;
  fragment.appendChild(script);
  doc.head.appendChild(fragment);
}
