import { capabilityPages } from '@/content/capabilities';
import { faqs } from '@/content/faqs';
import { businessProblems, pillars } from '@/content/home';
import { industries } from '@/content/industries';
import { intelligenceCapabilities } from '@/content/intelligence';
import { site } from '@/content/site';
import { products } from '@/content/work';

/**
 * Demo knowledge base: built entirely from this website's own published
 * content. The demo engine can only say what the site already says.
 */
export interface KnowledgeDoc {
  id: string;
  title: string;
  url: string;
  category: 'Company' | 'Answers' | 'Product' | 'Digital' | 'Intelligence' | 'Industries' | 'Products';
  /** Direct answer used as the lead of a response. */
  answer: string;
  /** Full searchable text. */
  body: string;
  /** Question form, used for follow-up suggestions. */
  question?: string;
}

const pillarCategory = { product: 'Product', digital: 'Digital', intelligence: 'Intelligence' } as const;

export function buildKnowledge(): KnowledgeDoc[] {
  const docs: KnowledgeDoc[] = [
    {
      id: 'entity',
      title: 'What Prodigi is',
      url: '/about',
      category: 'Company',
      answer: site.definition,
      body: [site.definition, site.summary, site.principle, `Audience: ${site.audience}.`, `Capabilities: ${site.capabilities.join(', ')}.`, `Technologies: ${site.technologies.join(', ')}.`].join(' '),
    },
  ];

  for (const faq of faqs) {
    docs.push({
      id: `faq:${faq.id}`,
      title: faq.question,
      url: faq.links?.[0]?.to ?? '/resources',
      category: 'Answers',
      answer: faq.answer,
      body: `${faq.question} ${faq.answer}`,
      question: faq.question,
    });
  }

  for (const page of capabilityPages) {
    docs.push({
      id: `page:${page.path}`,
      title: page.navLabel,
      url: page.path,
      category: pillarCategory[page.pillar],
      answer: `${page.lead} ${page.definition.answer}`,
      body: [
        page.title,
        page.lead,
        page.definition.question,
        page.definition.answer,
        page.offerings.title,
        ...page.offerings.items.map((item) => `${item.title}: ${item.description}`),
        ...(page.process?.steps.map((step) => `${step.title}: ${step.description}`) ?? []),
      ].join(' '),
      question: page.definition.question,
    });
  }

  for (const capability of intelligenceCapabilities) {
    docs.push({
      id: `ai:${capability.id}`,
      title: capability.name,
      url: capability.to,
      category: 'Intelligence',
      answer: `${capability.name}: ${capability.summary} Typical uses include ${capability.examples.join(', ').toLowerCase()}.`,
      body: `${capability.name} ${capability.summary} ${capability.examples.join(' ')}`,
    });
  }

  for (const pillar of pillars) {
    docs.push({
      id: `pillar:${pillar.id}`,
      title: pillar.name,
      url: pillar.to,
      category: pillarCategory[pillar.id],
      answer: `${pillar.name} — ${pillar.verb} ${pillar.description}`,
      body: `${pillar.name} ${pillar.verb} ${pillar.description}`,
    });
  }

  for (const problem of businessProblems) {
    docs.push({
      id: `problem:${problem.to}:${problem.statement}`,
      title: problem.statement,
      url: problem.to,
      category: 'Company',
      answer: `If "${problem.statement.toLowerCase()}" describes you, the place to start is ${problem.answer}.`,
      body: `${problem.statement} ${problem.answer}`,
    });
  }

  for (const industry of industries) {
    docs.push({
      id: `industry:${industry.name}`,
      title: `${industry.name} patterns`,
      url: '/solutions',
      category: 'Industries',
      answer: `Technology patterns Prodigi can apply in ${industry.name.toLowerCase()} include ${industry.patterns.join(', ').toLowerCase()}.`,
      body: `${industry.name} ${industry.patterns.join(' ')}`,
    });
  }

  for (const product of products) {
    docs.push({
      id: `product:${product.name}`,
      title: product.name,
      url: '/work',
      category: 'Products',
      answer: `${product.name} is a Prodigi product — ${product.kind.toLowerCase()}. ${product.description}`,
      body: `${product.name} ${product.kind} ${product.description} ${product.points.join(' ')}`,
    });
  }

  return docs;
}
