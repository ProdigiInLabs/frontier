import type { PageKey } from './manifest';

/**
 * Page key → feature module. Used by the router (via import.meta.glob) and by
 * the prerenderer (via Vite's build manifest) to inline each route's CSS and
 * preload its chunk in the static HTML — no flash of unstyled content.
 */
export const pageModules: Record<PageKey, string> = {
  home: '/src/features/home/HomePage.tsx',
  product: '/src/features/product/ProductPage.tsx',
  digital: '/src/features/digital/DigitalPage.tsx',
  intelligence: '/src/features/intelligence/overview/IntelligencePage.tsx',
  capability: '/src/features/capability/CapabilityPage.tsx',
  chat: '/src/features/intelligence/chat/ChatPage.tsx',
  agents: '/src/features/intelligence/agents/AgentsPage.tsx',
  search: '/src/features/intelligence/search/SearchPage.tsx',
  voice: '/src/features/intelligence/voice/VoicePage.tsx',
  'enterprise-demo': '/src/features/intelligence/integrations/EnterpriseDemoPage.tsx',
  demos: '/src/features/demos/DemosPage.tsx',
  solutions: '/src/features/solutions/SolutionsPage.tsx',
  work: '/src/features/work/WorkPage.tsx',
  about: '/src/features/about/AboutPage.tsx',
  resources: '/src/features/resources/ResourcesPage.tsx',
  contact: '/src/features/contact/ContactPage.tsx',
  'not-found': '/src/features/not-found/NotFoundPage.tsx',
};
