/**
 * Route manifest — the single source of truth for every URL.
 *
 * Pure data (no React): consumed by the router, the <RouteHead> component,
 * the build-time prerenderer, the sitemap/robots/llms.txt generators, the
 * breadcrumb + structured-data builders and the tests.
 *
 * To add a page: add an entry here and map its `page` key in routes.tsx.
 */
import { capabilityPages } from '@/content/capabilities';

export type Shell = 'marketing' | 'app';

export type PageKey =
  | 'home'
  | 'product'
  | 'digital'
  | 'intelligence'
  | 'capability'
  | 'chat'
  | 'agents'
  | 'search'
  | 'voice'
  | 'enterprise-demo'
  | 'demos'
  | 'solutions'
  | 'work'
  | 'about'
  | 'resources'
  | 'contact'
  | 'not-found';

export interface RouteMeta {
  /** Page title without the brand suffix. */
  title: string;
  description: string;
  noindex?: boolean;
}

export interface RouteEntry {
  path: string;
  page: PageKey;
  shell: Shell;
  /** Breadcrumb label for this segment. */
  label: string;
  meta: RouteMeta;
  /** Emits schema.org Service for this page. */
  serviceType?: string;
  /** FAQ ids rendered on the page; drives FAQPage schema. 'all' = every FAQ (answer hub). */
  faqIds?: string[] | 'all';
  sitemap?: { priority: number; changefreq: 'weekly' | 'monthly' };
}

export interface RedirectEntry {
  from: string;
  to: string;
}

const marketing = (entry: Omit<RouteEntry, 'shell'>): RouteEntry => ({ shell: 'marketing', ...entry });
const app = (entry: Omit<RouteEntry, 'shell'>): RouteEntry => ({ shell: 'app', ...entry });

const staticRoutes: RouteEntry[] = [
  marketing({
    path: '/',
    page: 'home',
    label: 'Home',
    meta: {
      title: 'Prodigi — Product · Digital · Intelligence',
      description:
        'Prodigi helps businesses build digital products, modernize existing systems, strengthen their digital presence and introduce practical intelligence into the way they work.',
    },
    faqIds: ['what-does-prodigi-do', 'how-is-prodigi-different', 'who-is-prodigi-for', 'what-is-prodigi-intelligence'],
    sitemap: { priority: 1, changefreq: 'weekly' },
  }),
  marketing({
    path: '/product',
    page: 'product',
    label: 'Product',
    meta: {
      title: 'Product — Turn Ideas into Products',
      description:
        'Product discovery, UX/UI, web and mobile applications, SaaS, APIs, backend, cloud, microservices, DevOps, security, performance and modernization from Prodigi.',
    },
    serviceType: 'Digital product development',
    faqIds: ['can-prodigi-work-with-existing-systems', 'how-does-an-engagement-start', 'how-much-does-it-cost'],
    sitemap: { priority: 0.9, changefreq: 'monthly' },
  }),
  marketing({
    path: '/digital',
    page: 'digital',
    label: 'Digital',
    meta: {
      title: 'Digital — Discoverable, Usable and Connected',
      description:
        'Websites, e-commerce, UX, digital transformation, SEO, AEO, GEO, content, marketing automation, analytics and conversion optimization from Prodigi.',
    },
    serviceType: 'Digital experience and visibility',
    faqIds: ['what-is-seo', 'what-is-aeo', 'what-is-geo', 'seo-vs-aeo-vs-geo'],
    sitemap: { priority: 0.9, changefreq: 'monthly' },
  }),
  marketing({
    path: '/intelligence',
    page: 'intelligence',
    label: 'Intelligence',
    meta: {
      title: 'Prodigi Intelligence — Where Should AI Fit Your Business?',
      description:
        'Prodigi Intelligence helps businesses discover AI opportunities, design the right architecture, connect AI to existing systems and turn it into useful products and workflows.',
    },
    serviceType: 'Applied AI and AI integration',
    faqIds: [
      'what-is-prodigi-intelligence',
      'where-to-start-with-ai',
      'what-is-an-ai-chatbot',
      'what-is-an-ai-assistant',
      'what-is-an-ai-agent',
      'what-is-ai-voice',
      'what-is-enterprise-ai',
      'does-every-business-need-ai',
    ],
    sitemap: { priority: 0.95, changefreq: 'monthly' },
  }),

  // ---- Interactive experiences (application shell) ----
  app({
    path: '/intelligence/chat',
    page: 'chat',
    label: 'AI Chat',
    meta: {
      title: 'AI Chat — Prodigi Intelligence',
      description:
        'Ask. Explore. Understand. An interactive AI chat experience from Prodigi Intelligence, with sources and suggested follow-ups. Runs in demo mode on Prodigi’s own content.',
    },
    faqIds: ['what-is-an-ai-chatbot', 'are-the-demos-real'],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
  app({
    path: '/intelligence/agents',
    page: 'agents',
    label: 'AI Agents',
    meta: {
      title: 'AI Agents — Watch an Agent Plan, Call Tools and Deliver',
      description:
        'See what an AI agent does: understand a request, plan, call tools, retrieve information, reason and deliver a result. An interactive, simulated agent experience from Prodigi.',
    },
    serviceType: 'AI agent development',
    faqIds: ['what-is-an-ai-agent', 'are-the-demos-real'],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
  app({
    path: '/intelligence/search',
    page: 'search',
    label: 'AI Search',
    meta: {
      title: 'AI Search — Turn Business Knowledge into Answers',
      description:
        'Semantic search and retrieval-augmented answers with sources. Try Prodigi’s AI search experience over a structured demo knowledge base.',
    },
    serviceType: 'AI search and retrieval (RAG)',
    faqIds: ['what-is-ai-search', 'what-is-rag', 'are-the-demos-real'],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
  app({
    path: '/intelligence/voice',
    page: 'voice',
    label: 'AI Voice',
    meta: {
      title: 'AI Voice — Talk to Prodigi Intelligence',
      description:
        'Explore a voice assistant interface — idle, listening, processing and responding — designed for customer support, appointments and lead qualification. Integration-ready demo.',
    },
    serviceType: 'AI voice assistant development',
    faqIds: ['what-is-ai-voice', 'are-the-demos-real'],
    sitemap: { priority: 0.7, changefreq: 'monthly' },
  }),
  app({
    path: '/demo/enterprise-ai',
    page: 'enterprise-demo',
    label: 'Enterprise AI',
    meta: {
      title: 'Enterprise AI Integration Demo — From Request to Action',
      description:
        'Follow a request from a user through Prodigi Intelligence, an AI model, tools, APIs and RAG to business systems and back as a result or action. An interactive simulation.',
    },
    faqIds: ['how-does-ai-integration-work', 'are-the-demos-real'],
    sitemap: { priority: 0.7, changefreq: 'monthly' },
  }),

  // ---- Company ----
  marketing({
    path: '/demo',
    page: 'demos',
    label: 'Demos',
    meta: {
      title: 'Interactive Demos — AI Chat, Agents, Search, Voice & Integration',
      description:
        'Try what Prodigi builds: a conversational AI interface, an agent workflow, AI search over structured knowledge, a voice interaction UI and an enterprise integration flow.',
    },
    faqIds: ['are-the-demos-real'],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
  marketing({
    path: '/solutions',
    page: 'solutions',
    label: 'Solutions',
    meta: {
      title: 'Solutions — Start with What You’re Trying to Solve',
      description:
        'Find the right starting point by business problem: build a product, modernize an application, improve a website, grow visibility, use AI, automate a workflow or connect AI to your systems.',
    },
    faqIds: ['who-is-prodigi-for', 'can-prodigi-work-with-existing-systems'],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
  marketing({
    path: '/work',
    page: 'work',
    label: 'Work',
    meta: {
      title: 'Work — What Prodigi Builds',
      description:
        'Prodigi’s own products, ProdigiOne and G-One, the kinds of systems Prodigi builds and the interactive experiences that show how.',
    },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
  }),
  marketing({
    path: '/about',
    page: 'about',
    label: 'About',
    meta: {
      title: 'About Prodigi — Product, Digital and Intelligence',
      description:
        'Prodigi is a product, digital and intelligence company. It starts with what a business is trying to accomplish, then builds, improves, modernizes, connects and automates.',
    },
    faqIds: ['what-is-prodigi', 'how-is-prodigi-different', 'how-does-an-engagement-start'],
    sitemap: { priority: 0.7, changefreq: 'monthly' },
  }),
  marketing({
    path: '/resources',
    page: 'resources',
    label: 'Resources',
    meta: {
      title: 'Resources — Clear Answers on AI, Products and Digital Visibility',
      description:
        'Direct answers to common questions: what Prodigi does, AI integration, AI agents, assistants, chatbots, voice, RAG, enterprise AI, SEO, AEO and GEO.',
    },
    faqIds: 'all',
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
  marketing({
    path: '/contact',
    page: 'contact',
    label: 'Contact',
    meta: {
      title: 'Start a Conversation — Contact Prodigi',
      description:
        'Tell Prodigi what you are trying to solve — a product, a modernization, a website, visibility, AI integration or automation — and get a considered next step.',
    },
    faqIds: ['how-does-an-engagement-start', 'how-much-does-it-cost'],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
];

const capabilityRoutes: RouteEntry[] = capabilityPages.map((page) =>
  marketing({
    path: page.path,
    page: 'capability',
    label: page.navLabel,
    meta: page.seo,
    serviceType: page.serviceType,
    faqIds: page.faqIds,
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  }),
);

export const notFoundRoute: RouteEntry = marketing({
  path: '/404',
  page: 'not-found',
  label: 'Page not found',
  meta: {
    title: 'Page not found',
    description: 'The page you were looking for does not exist.',
    noindex: true,
  },
});

export const routes: RouteEntry[] = [...staticRoutes, ...capabilityRoutes];

/** Permanent aliases. Emitted as static redirect pages and host redirect rules. */
export const redirects: RedirectEntry[] = [
  { from: '/demo/ai-chat', to: '/intelligence/chat' },
  { from: '/demo/ai-agent', to: '/intelligence/agents' },
  { from: '/demo/ai-search', to: '/intelligence/search' },
  { from: '/demo/ai-voice', to: '/intelligence/voice' },
  { from: '/services', to: '/solutions' },
];

const byPath = new Map(routes.map((route) => [route.path, route]));

export function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] ?? '/';
  if (clean === '' || clean === '/') return '/';
  return clean.replace(/\/+$/, '').toLowerCase() || '/';
}

export function findRoute(pathname: string): RouteEntry | undefined {
  return byPath.get(normalizePath(pathname));
}

export function resolveRoute(pathname: string): RouteEntry {
  return findRoute(pathname) ?? notFoundRoute;
}

export interface Crumb {
  name: string;
  path: string;
}

export function getBreadcrumbs(pathname: string): Crumb[] {
  const path = normalizePath(pathname);
  if (path === '/') return [];
  const crumbs: Crumb[] = [{ name: 'Home', path: '/' }];
  const segments = path.split('/').filter(Boolean);
  segments.forEach((_, index) => {
    const segmentPath = `/${segments.slice(0, index + 1).join('/')}`;
    const route = findRoute(segmentPath);
    if (route) crumbs.push({ name: route.label, path: route.path });
  });
  return crumbs;
}
