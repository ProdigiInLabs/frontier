/**
 * The Prodigi entity. Used by copy, structured data (Organization/WebSite),
 * llms.txt and the demo knowledge base — so the entity is described the same
 * way everywhere (GEO).
 */
export const site = {
  name: 'Prodigi',
  legalName: 'Prodigi Innovative Labs',
  acronym: 'Product · Digital · Intelligence',
  category: 'Product, Digital and Intelligence company',
  summary:
    'Prodigi helps businesses build digital products, modernize existing systems, strengthen their digital presence and introduce practical intelligence into the way they work.',
  definition:
    'Prodigi is a product, digital and intelligence company. It designs and engineers digital products, modernizes existing applications, improves how businesses are found and experienced online, and connects AI to the systems a business already uses.',
  principle:
    'Prodigi doesn’t start with technology. Prodigi starts with what the business is trying to accomplish.',
  audience: 'Businesses, startups and enterprises',
  problem: 'Building, modernizing and intelligently improving digital business systems.',
  mission: 'Build smart. Scale faster.',
  capabilities: [
    'Product Engineering',
    'Product Modernization',
    'Digital Transformation',
    'Websites and E-commerce',
    'SEO',
    'AEO',
    'GEO',
    'AI Strategy',
    'AI Integration',
    'AI Automation',
    'AI Agents',
    'AI Chat',
    'AI Assistants',
    'AI Voice',
    'AI Search',
  ],
  technologies: [
    'Angular',
    'React',
    'React Native',
    'TypeScript',
    'Node.js',
    'Python',
    'REST and event-driven APIs',
    'Microservices',
    'Cloud platforms',
    'Retrieval-augmented generation (RAG)',
    'Large language models',
  ],
  logoPath: '/brand/prodigi-mark.svg',
  ogImagePath: '/og/prodigi-og.png',
} as const;
