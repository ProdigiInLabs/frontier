export interface DemoCard {
  id: string;
  name: string;
  description: string;
  to: string;
  cta: string;
}

export const demos: DemoCard[] = [
  { id: 'chat', name: 'AI Chat', description: 'Experience a conversational AI interface with sources and follow-ups.', to: '/intelligence/chat', cta: 'Open AI Chat' },
  { id: 'agent', name: 'AI Agent', description: 'See an agent plan, call tools and reason its way to a result.', to: '/intelligence/agents', cta: 'Run an agent' },
  { id: 'search', name: 'AI Search', description: 'Ask questions against structured knowledge and see where answers come from.', to: '/intelligence/search', cta: 'Try AI Search' },
  { id: 'voice', name: 'AI Voice', description: 'Explore a voice interaction interface and its conversation states.', to: '/intelligence/voice', cta: 'Explore voice' },
  { id: 'enterprise', name: 'Enterprise Integration', description: 'Watch a request travel from user to AI to business systems and back.', to: '/demo/enterprise-ai', cta: 'See the flow' },
];
