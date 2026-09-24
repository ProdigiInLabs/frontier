export type Pillar = 'product' | 'digital' | 'intelligence';

export interface LinkRef {
  label: string;
  to: string;
}

export interface Item {
  title: string;
  description: string;
}

export interface Faq {
  id: string;
  question: string;
  /** Direct answer first, written to be quotable on its own (AEO). */
  answer: string;
  group: FaqGroup;
  links?: LinkRef[];
}

export type FaqGroup = 'prodigi' | 'intelligence' | 'visibility' | 'engagement';

export type VisualKey =
  | 'product-architecture'
  | 'modernization-path'
  | 'visibility-stack'
  | 'automation-flow'
  | 'integration-architecture'
  | 'ai-journey'
  | 'assistant-workspace';

export interface CapabilityPage {
  path: string;
  pillar: Pillar;
  navLabel: string;
  eyebrow: string;
  title: string;
  lead: string;
  seo: { title: string; description: string };
  /** schema.org Service.serviceType */
  serviceType: string;
  definition: { question: string; answer: string };
  offerings: { title: string; items: Item[] };
  process?: { title: string; steps: Item[] };
  visual?: VisualKey;
  useCases?: { title: string; items: Item[] };
  /** Optional second hero action, e.g. the matching interactive experience. */
  secondaryAction?: LinkRef;
  faqIds: string[];
  related: string[];
  cta: { title: string; text: string; topic: ContactTopicId };
}

export type ContactTopicId =
  | 'build-product'
  | 'modernize'
  | 'improve-website'
  | 'visibility'
  | 'integrate-ai'
  | 'automate'
  | 'explore-idea'
  | 'other';
