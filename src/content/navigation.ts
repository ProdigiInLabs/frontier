import type { Pillar } from './types';

export interface NavLinkItem {
  label: string;
  to: string;
  description?: string;
  /** Marks interactive product experiences inside menus. */
  interactive?: boolean;
}

export interface NavGroup {
  label: string;
  to: string;
  pillar?: Pillar;
  intro?: { title: string; text: string };
  children?: NavLinkItem[];
  featured?: NavLinkItem;
}

export const primaryNav: NavGroup[] = [
  {
    label: 'Product',
    to: '/product',
    pillar: 'product',
    intro: { title: 'Turn ideas into products.', text: 'Engineering and modernization for web, mobile and SaaS.' },
    children: [
      { label: 'Product overview', to: '/product', description: 'Everything we build, end to end' },
      { label: 'Product engineering', to: '/product/engineering', description: 'Web, mobile, SaaS, APIs and cloud' },
      { label: 'Modernization', to: '/product/modernization', description: 'Move forward without a rewrite' },
    ],
  },
  {
    label: 'Digital',
    to: '/digital',
    pillar: 'digital',
    intro: { title: 'Discoverable, usable, connected.', text: 'Websites, e-commerce and visibility.' },
    children: [
      { label: 'Digital overview', to: '/digital', description: 'Experience and visibility together' },
      { label: 'Websites & e-commerce', to: '/digital/web', description: 'Sites that do a job' },
      { label: 'SEO', to: '/digital/seo', description: 'Be found in search' },
      { label: 'AEO', to: '/digital/aeo', description: 'Become the answer' },
      { label: 'GEO', to: '/digital/geo', description: 'Be understood by generative AI' },
      { label: 'Growth & analytics', to: '/digital/marketing', description: 'Content, marketing and CRO' },
    ],
  },
  {
    label: 'Intelligence',
    to: '/intelligence',
    pillar: 'intelligence',
    intro: { title: 'Where should AI fit?', text: 'Strategy, experiences and integration.' },
    children: [
      { label: 'AI strategy', to: '/intelligence/ai-strategy', description: 'Find where AI belongs' },
      { label: 'AI chat', to: '/intelligence/chat', description: 'Conversational experiences', interactive: true },
      { label: 'AI assistants', to: '/intelligence/assistants', description: 'AI that helps people work' },
      { label: 'AI agents', to: '/intelligence/agents', description: 'AI that performs tasks', interactive: true },
      { label: 'AI voice', to: '/intelligence/voice', description: 'Spoken experiences', interactive: true },
      { label: 'AI search', to: '/intelligence/search', description: 'Answers from your data', interactive: true },
      { label: 'AI automation', to: '/intelligence/automation', description: 'Intelligence in workflows' },
      { label: 'Enterprise integration', to: '/intelligence/integrations', description: 'AI on your systems' },
    ],
    featured: { label: 'Experience Prodigi Intelligence', to: '/intelligence/chat', description: 'Open the AI chat experience' },
  },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'Resources', to: '/resources' },
];

/** Contextual navigation inside the Prodigi Intelligence application shell. */
export const appNav: { title: string; items: NavLinkItem[] }[] = [
  {
    title: 'Experiences',
    items: [
      { label: 'Chat', to: '/intelligence/chat', interactive: true },
      { label: 'Agents', to: '/intelligence/agents', interactive: true },
      { label: 'Search', to: '/intelligence/search', interactive: true },
      { label: 'Voice', to: '/intelligence/voice', interactive: true },
      { label: 'Integration flow', to: '/demo/enterprise-ai', interactive: true },
    ],
  },
  {
    title: 'Learn',
    items: [
      { label: 'Overview', to: '/intelligence' },
      { label: 'Automation', to: '/intelligence/automation' },
      { label: 'Integrations', to: '/intelligence/integrations' },
      { label: 'All demos', to: '/demo' },
    ],
  },
];

export const footerNav: { title: string; links: NavLinkItem[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', to: '/product' },
      { label: 'Product engineering', to: '/product/engineering' },
      { label: 'Modernization', to: '/product/modernization' },
      { label: 'Work', to: '/work' },
    ],
  },
  {
    title: 'Digital',
    links: [
      { label: 'Overview', to: '/digital' },
      { label: 'Websites & e-commerce', to: '/digital/web' },
      { label: 'SEO', to: '/digital/seo' },
      { label: 'AEO', to: '/digital/aeo' },
      { label: 'GEO', to: '/digital/geo' },
      { label: 'Growth & analytics', to: '/digital/marketing' },
    ],
  },
  {
    title: 'Intelligence',
    links: [
      { label: 'Overview', to: '/intelligence' },
      { label: 'AI strategy', to: '/intelligence/ai-strategy' },
      { label: 'AI assistants', to: '/intelligence/assistants' },
      { label: 'AI automation', to: '/intelligence/automation' },
      { label: 'Enterprise integration', to: '/intelligence/integrations' },
      { label: 'Interactive demos', to: '/demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Solutions', to: '/solutions' },
      { label: 'Resources', to: '/resources' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];
