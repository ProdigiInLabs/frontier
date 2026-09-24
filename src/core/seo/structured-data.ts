import { faqs, getFaqs } from '@/content/faqs';
import { site } from '@/content/site';
import type { RouteEntry } from '@/routing/manifest';
import { getBreadcrumbs } from '@/routing/manifest';

type JsonLd = Record<string, unknown>;

export const absoluteUrl = (siteUrl: string, path: string) => (path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`);

export function organizationSchema(siteUrl: string, contactEmail: string): JsonLd {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: site.name,
    legalName: site.legalName,
    alternateName: `${site.name} — ${site.acronym}`,
    url: `${siteUrl}/`,
    logo: `${siteUrl}${site.logoPath}`,
    description: site.definition,
    slogan: 'Build better products. Create stronger digital experiences. Add intelligence where it matters.',
    email: contactEmail,
    knowsAbout: site.capabilities,
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: contactEmail }],
  };
}

export function websiteSchema(siteUrl: string): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: site.name,
    description: site.summary,
    publisher: { '@id': `${siteUrl}/#organization` },
    inLanguage: 'en',
  };
}

export function buildStructuredData(route: RouteEntry, pathname: string, siteUrl: string, contactEmail: string): JsonLd {
  const url = absoluteUrl(siteUrl, route.path);
  const graph: JsonLd[] = [organizationSchema(siteUrl, contactEmail), websiteSchema(siteUrl)];

  graph.push({
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: route.meta.title,
    description: route.meta.description,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#organization` },
    inLanguage: 'en',
  });

  const crumbs = getBreadcrumbs(pathname);
  if (crumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(siteUrl, crumb.path),
      })),
    });
  }

  if (route.serviceType) {
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: route.label,
      serviceType: route.serviceType,
      description: route.meta.description,
      url,
      provider: { '@id': `${siteUrl}/#organization` },
      audience: { '@type': 'BusinessAudience', name: site.audience },
      areaServed: 'Worldwide',
    });
  }

  if (route.faqIds?.length) {
    const list = route.faqIds === 'all' ? faqs : getFaqs(route.faqIds);
    graph.push({
      '@type': 'FAQPage',
      mainEntity: list.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
