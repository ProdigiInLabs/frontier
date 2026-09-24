import type { Item, LinkRef, Pillar } from './types';

export const pillars: { id: Pillar; name: string; verb: string; description: string; to: string }[] = [
  {
    id: 'product',
    name: 'Product',
    verb: 'Build.',
    description: 'Web, mobile and SaaS products — and the modernization of the ones you already have.',
    to: '/product',
  },
  {
    id: 'digital',
    name: 'Digital',
    verb: 'Connect.',
    description: 'Websites, e-commerce and visibility across search, answer engines and generative AI.',
    to: '/digital',
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    verb: 'Understand and automate.',
    description: 'AI chat, assistants, agents, voice, search and automation — connected to your systems.',
    to: '/intelligence',
  },
];

export interface BusinessProblem {
  statement: string;
  answer: string;
  to: string;
}

/** "What are you trying to solve?" — navigation by problem, not by service. */
export const businessProblems: BusinessProblem[] = [
  { statement: 'I have an idea.', answer: 'Product', to: '/product' },
  { statement: 'Our application needs modernization.', answer: 'Product modernization', to: '/product/modernization' },
  { statement: 'Our website needs improvement.', answer: 'Digital', to: '/digital' },
  { statement: 'We need better search visibility.', answer: 'SEO · AEO · GEO', to: '/digital/seo' },
  { statement: 'We want to use AI.', answer: 'Intelligence', to: '/intelligence' },
  { statement: 'We need to automate a workflow.', answer: 'AI automation', to: '/intelligence/automation' },
  { statement: 'We need AI connected to our systems.', answer: 'Enterprise AI integration', to: '/intelligence/integrations' },
  { statement: 'We’re not sure where to start.', answer: 'AI discovery', to: '/intelligence/ai-strategy' },
];

/** Product → … → Business impact. Prodigi can start at any stage. */
export const valueChain: (Item & { to: string })[] = [
  { title: 'Product', description: 'The software your business and customers use.', to: '/product' },
  { title: 'Digital experience', description: 'How people find, understand and use it.', to: '/digital' },
  { title: 'Data', description: 'What every interaction and transaction leaves behind.', to: '/digital/marketing' },
  { title: 'Intelligence', description: 'Understanding that data well enough to answer and decide.', to: '/intelligence' },
  { title: 'Automation', description: 'Acting on those decisions inside real workflows.', to: '/intelligence/automation' },
  { title: 'Business impact', description: 'Less effort, faster answers, better decisions, more growth.', to: '/contact' },
];

export interface Persona {
  role: string;
  question: string;
  answer: string;
  links: LinkRef[];
}

export const personas: Persona[] = [
  {
    role: 'Founder',
    question: 'Can Prodigi help me turn my idea into a product?',
    answer: 'Yes — from discovery and UX to a production web or mobile product, sized to your first release.',
    links: [
      { label: 'Product engineering', to: '/product/engineering' },
      { label: 'Start with your idea', to: '/contact?topic=build-product' },
    ],
  },
  {
    role: 'CTO',
    question: 'Can Prodigi work with our existing technology and systems?',
    answer: 'Yes — modernization, API layers, cloud and AI integration built around what you already run.',
    links: [
      { label: 'Modernization', to: '/product/modernization' },
      { label: 'Enterprise AI integration', to: '/intelligence/integrations' },
    ],
  },
  {
    role: 'Business owner',
    question: 'Can Prodigi improve my digital business?',
    answer: 'Yes — websites, e-commerce, automation and analytics focused on measurable outcomes.',
    links: [
      { label: 'Digital', to: '/digital' },
      { label: 'AI automation', to: '/intelligence/automation' },
    ],
  },
  {
    role: 'Marketing manager',
    question: 'Can Prodigi improve our digital visibility?',
    answer: 'Yes — SEO, AEO and GEO, content, digital marketing and conversion optimization.',
    links: [
      { label: 'SEO · AEO · GEO', to: '/digital/seo' },
      { label: 'Growth & analytics', to: '/digital/marketing' },
    ],
  },
  {
    role: 'AI-curious business',
    question: 'Everyone is talking about AI. Where do I even start?',
    answer: 'With your business, not a model. AI discovery finds the one or two places where AI actually helps.',
    links: [
      { label: 'AI strategy', to: '/intelligence/ai-strategy' },
      { label: 'Explore Intelligence', to: '/intelligence' },
    ],
  },
  {
    role: 'Enterprise team',
    question: 'Can Prodigi connect AI to our applications and business systems?',
    answer: 'Yes — through permissioned APIs, retrieval over your knowledge and server-side controls.',
    links: [
      { label: 'Enterprise AI integration', to: '/intelligence/integrations' },
      { label: 'See it in action', to: '/demo/enterprise-ai' },
    ],
  },
];

export const brandLines = {
  heroEyebrow: 'Product · Digital · Intelligence',
  heroTitle: ['Build better products.', 'Create stronger digital experiences.', 'Add intelligence where it matters.'],
  philosophy: ['Technology should solve the problem.', 'Not become the problem.'],
  aiWhere: ['You don’t need AI everywhere.', 'You need it where it matters.'],
  journey: ['From idea to product.', 'From product to intelligence.'],
  problemFirst: 'The business problem comes first. AI comes second.',
} as const;
