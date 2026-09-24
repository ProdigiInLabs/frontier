import type { AgentGoal } from '@/core/services/ai/types';

/** Goal picker content (UI copy; mirrors the goals any agent backend accepts). */
export const agentGoals: { id: AgentGoal; label: string; description: string; placeholder: string }[] = [
  { id: 'research', label: 'Research', description: 'Gather and summarize information on a topic.', placeholder: 'e.g. How are mid-sized retailers using AI search?' },
  { id: 'analyze', label: 'Analyze', description: 'Examine data and explain what changed.', placeholder: 'e.g. Why did enquiries drop last month?' },
  { id: 'find', label: 'Find information', description: 'Locate an answer across internal knowledge.', placeholder: 'e.g. What is our refund policy for annual plans?' },
  { id: 'documents', label: 'Process documents', description: 'Extract and validate data from documents.', placeholder: 'e.g. Extract totals and due dates from this week’s invoices' },
  { id: 'automate', label: 'Automate workflow', description: 'Carry out a multi-step business process.', placeholder: 'e.g. Qualify new inbound leads and route them' },
  { id: 'connect', label: 'Connect systems', description: 'Plan data flow between two systems.', placeholder: 'e.g. Sync new e-commerce orders into the ERP' },
];

export const MAX_INSTRUCTIONS = 300;
