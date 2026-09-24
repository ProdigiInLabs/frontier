import type { Item } from './types';

export type IntelligenceCapabilityId =
  | 'chat'
  | 'assistants'
  | 'agents'
  | 'voice'
  | 'search'
  | 'automation'
  | 'integrations';

export interface IntelligenceCapability {
  id: IntelligenceCapabilityId;
  name: string;
  summary: string;
  examples: string[];
  /** Explanation page or product experience. */
  to: string;
  cta: string;
  /** True when `to` is an interactive experience in the application shell. */
  interactive: boolean;
}

export const intelligenceCapabilities: IntelligenceCapability[] = [
  {
    id: 'chat',
    name: 'AI Chat',
    summary: 'Conversational customer and employee experiences.',
    examples: ['Customer support', 'Product discovery', 'FAQ', 'Knowledge assistants'],
    to: '/intelligence/chat',
    cta: 'Try AI Chat',
    interactive: true,
  },
  {
    id: 'assistants',
    name: 'AI Assistants',
    summary: 'AI that helps people work.',
    examples: ['Research', 'Documents', 'Reporting', 'Knowledge', 'Business insights'],
    to: '/intelligence/assistants',
    cta: 'Explore assistants',
    interactive: false,
  },
  {
    id: 'agents',
    name: 'AI Agents',
    summary: 'AI that can reason and perform tasks.',
    examples: ['Lead qualification', 'Research', 'Workflow execution', 'Data processing', 'Business automation'],
    to: '/intelligence/agents',
    cta: 'Run an agent',
    interactive: true,
  },
  {
    id: 'voice',
    name: 'AI Voice',
    summary: 'Voice-based intelligent experiences.',
    examples: ['Customer support', 'Appointment handling', 'Lead qualification', 'Voice assistants'],
    to: '/intelligence/voice',
    cta: 'Explore voice',
    interactive: true,
  },
  {
    id: 'search',
    name: 'AI Search',
    summary: 'Turn business data into useful answers.',
    examples: ['Enterprise search', 'Semantic search', 'RAG', 'Product search', 'Knowledge retrieval'],
    to: '/intelligence/search',
    cta: 'Try AI Search',
    interactive: true,
  },
  {
    id: 'automation',
    name: 'AI Automation',
    summary: 'Connect intelligence to business workflows.',
    examples: ['Application', 'AI', 'Business data', 'Decision', 'Action'],
    to: '/intelligence/automation',
    cta: 'See automation',
    interactive: false,
  },
  {
    id: 'integrations',
    name: 'Enterprise Integration',
    summary: 'Connect AI to the systems you already run.',
    examples: ['APIs', 'CRM', 'ERP', 'Databases', 'Knowledge bases'],
    to: '/intelligence/integrations',
    cta: 'See the architecture',
    interactive: false,
  },
];

/** "Where do I start?" — the AI journey. */
export const aiJourney: Item[] = [
  { title: 'Discover', description: 'Understand the business.' },
  { title: 'Identify', description: 'Find meaningful AI opportunities.' },
  { title: 'Design', description: 'Select the architecture and technology.' },
  { title: 'Connect', description: 'Integrate existing systems.' },
  { title: 'Validate', description: 'Measure quality, security, cost and reliability.' },
  { title: 'Deploy', description: 'Move to production.' },
  { title: 'Optimize', description: 'Continuously improve.' },
];

/** USER → … → RESULT architecture used by the integration visual and demo. */
export const integrationLayers = [
  { id: 'user', label: 'User', detail: 'A person or an application makes a request.' },
  { id: 'prodigi', label: 'Prodigi Intelligence', detail: 'Orchestration: identity, permissions, prompts, policies and logging.' },
  { id: 'model', label: 'AI model', detail: 'Understands the request and decides which tools it needs.' },
  { id: 'tools', label: 'Tools · APIs · RAG', detail: 'Permissioned operations and retrieval over approved knowledge.' },
  { id: 'systems', label: 'Business systems', detail: 'CRM, ERP, databases, e-commerce, documents and internal tools.' },
  { id: 'result', label: 'Result · Action', detail: 'An answer with sources, or an action — approved where required.' },
] as const;

export type IntegrationLayerId = (typeof integrationLayers)[number]['id'];

export const automationFlow = [
  { label: 'Application', detail: 'An event: a new email, order, form or record.' },
  { label: 'AI', detail: 'Understands, classifies or extracts what matters.' },
  { label: 'Business data', detail: 'Adds context from the systems of record.' },
  { label: 'Decision', detail: 'Rules and AI judgement — human approval where risk is high.' },
  { label: 'Action', detail: 'Updates systems, notifies people, closes the loop.' },
] as const;
