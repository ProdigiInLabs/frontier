/**
 * Technology patterns per industry. Deliberately framed as patterns Prodigi
 * can apply — not as claims of past client work in each industry.
 */
export const industries = [
  { name: 'Retail', patterns: ['Product discovery chat', 'Inventory-aware search', 'Personalized recommendations'] },
  { name: 'E-commerce', patterns: ['Conversational shopping', 'Catalogue enrichment', 'Order-status automation'] },
  { name: 'Healthcare', patterns: ['Appointment handling', 'Intake automation', 'Knowledge assistants for staff'] },
  { name: 'Finance', patterns: ['Document extraction', 'Policy and compliance search', 'Report generation'] },
  { name: 'SaaS', patterns: ['In-product assistants', 'Support deflection', 'Usage analytics and insights'] },
  { name: 'Manufacturing', patterns: ['Maintenance knowledge search', 'Order and supply automation', 'Operational reporting'] },
  { name: 'Logistics', patterns: ['Shipment status agents', 'Exception triage', 'Route and capacity reporting'] },
  { name: 'Professional services', patterns: ['Proposal drafting', 'Research assistants', 'Lead qualification'] },
] as const;
