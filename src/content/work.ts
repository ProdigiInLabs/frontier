/**
 * Prodigi's own products, carried over from the previous site.
 * Descriptions avoid claims about launch status, customers or scale.
 */
export const products = [
  {
    name: 'ProdigiOne',
    kind: 'Business platform',
    description:
      'An all-in-one platform that brings together the tools small businesses, vendors and entrepreneurs use to manage, engage and grow — with AI-assisted insights.',
    points: ['Business management', 'Customer engagement', 'AI-assisted insights'],
  },
  {
    name: 'G-One',
    kind: 'Automation engine',
    description:
      'An industry-agnostic AI automation engine designed to plug into existing architectures — microservices, monoliths or serverless — through an API layer, and orchestrate workflows with context.',
    points: ['API-first integration', 'Workflow orchestration', 'Architecture-agnostic'],
  },
] as const;

export const buildPatterns = [
  { title: 'SaaS platforms', description: 'Multi-tenant products with roles, billing and analytics.' },
  { title: 'Customer-facing apps', description: 'Web and mobile apps where performance and UX decide adoption.' },
  { title: 'Internal tools', description: 'Dashboards and workflow tools that replace spreadsheets and email.' },
  { title: 'Integration layers', description: 'APIs that connect systems that were never designed to talk.' },
  { title: 'AI experiences', description: 'Chat, search, assistants and agents grounded in business data.' },
  { title: 'Automation pipelines', description: 'Scheduled and event-driven processing with human approval steps.' },
] as const;
