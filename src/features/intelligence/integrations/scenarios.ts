import type { IntegrationLayerId } from '@/content/intelligence';

/**
 * Local simulation data for the enterprise integration demo.
 * Payloads are illustrative samples, not captured traffic; every identifier
 * is made up and no request leaves the browser.
 */

export interface TraceStep {
  /** What happens at this layer, in one or two sentences. */
  summary: string;
  payload: Record<string, unknown>;
}

export interface Scenario {
  id: 'order-status' | 'travel-policy' | 'enterprise-lead';
  label: string;
  actor: string;
  route: string;
  request: string;
  trace: Record<IntegrationLayerId, TraceStep>;
  outcome: { kind: 'answer' | 'approval'; title: string; text: string };
}

export const scenarios: Scenario[] = [
  {
    id: 'order-status',
    label: 'Where is my order?',
    actor: 'Customer',
    route: 'Customer → e-commerce + ERP',
    request: 'Where is my order?',
    trace: {
      user: {
        summary: 'A signed-in customer asks the store’s chat assistant about their order.',
        payload: { channel: 'web_chat', session: 'authenticated', customer_ref: 'C-1042', message: 'Where is my order?' },
      },
      prodigi: {
        summary: 'Verifies the session, loads the order-support policy and limits the assistant to read-only order tools.',
        payload: { identity: 'verified_session', policy: 'order-support', allowed_tools: ['orders.lookup', 'shipments.track'], trace_id: 'tr_sample_01' },
      },
      model: {
        summary: 'Recognizes an order-status question and plans two tool calls: find the latest order, then its shipment.',
        payload: { intent: 'order_status', plan: ['orders.lookup', 'shipments.track'] },
      },
      tools: {
        summary: 'Calls the order and shipment APIs with the customer’s own reference — nothing broader.',
        payload: { call: 'orders.lookup', args: { customer_ref: 'C-1042', latest: true }, then: { call: 'shipments.track', args: { order: 'SO-58213' } } },
      },
      systems: {
        summary: 'The e-commerce platform returns the order; the ERP returns fulfilment and carrier status.',
        payload: { ecommerce: { order: 'SO-58213', status: 'paid' }, erp: { fulfilment: 'dispatched', carrier_status: 'in_transit', estimated_delivery: 'in 2 business days' } },
      },
      result: {
        summary: 'A direct answer grounded in live system data, with the tracking link attached.',
        payload: { reply: 'Your order SO-58213 has been dispatched and should arrive in 2 business days.', links: ['tracking'], sources: ['ecommerce.orders', 'erp.fulfilment'] },
      },
    },
    outcome: {
      kind: 'answer',
      title: 'Answer returned',
      text: '“Your order SO-58213 has been dispatched and should arrive in 2 business days.” The reply cites the systems it came from and includes the tracking link.',
    },
  },
  {
    id: 'travel-policy',
    label: 'What’s our travel policy for client visits?',
    actor: 'Employee',
    route: 'Employee → knowledge base (RAG)',
    request: 'What’s our travel policy for client visits?',
    trace: {
      user: {
        summary: 'An employee asks the internal assistant a policy question.',
        payload: { channel: 'internal_assistant', auth: 'sso', role: 'employee', message: 'What’s our travel policy for client visits?' },
      },
      prodigi: {
        summary: 'Resolves the employee’s permissions so retrieval only sees documents they are allowed to read.',
        payload: { identity: 'sso_user', scopes: ['knowledge:policies'], policy: 'internal-knowledge', trace_id: 'tr_sample_02' },
      },
      model: {
        summary: 'Identifies a policy question that must be answered from source documents, not from general knowledge.',
        payload: { intent: 'policy_question', requires_retrieval: true, answer_style: 'direct_with_citation' },
      },
      tools: {
        summary: 'Runs retrieval (RAG) over the policy index, filtered to current versions for this audience.',
        payload: { call: 'rag.search', args: { query: 'travel policy client visits', index: 'policies', filters: { status: 'current', audience: 'employees' }, top_k: 5 } },
      },
      systems: {
        summary: 'The knowledge base returns the relevant sections of the current travel and expenses policy.',
        payload: { passages: [{ document: 'Travel & Expenses Policy', section: '4.2 Client visits', version: 'current' }, { document: 'Travel & Expenses Policy', section: '4.5 Approvals', version: 'current' }] },
      },
      result: {
        summary: 'A short answer drawn only from the retrieved sections, citing each one.',
        payload: { reply: 'Summary of section 4.2 (client visits) and the approval rule in 4.5.', citations: ['Travel & Expenses Policy §4.2', 'Travel & Expenses Policy §4.5'] },
      },
    },
    outcome: {
      kind: 'answer',
      title: 'Answer with citations',
      text: 'The employee gets a direct summary of the client-visit rules with links to sections 4.2 and 4.5 of the current policy. If no section answers the question, the assistant says so instead of guessing.',
    },
  },
  {
    id: 'enterprise-lead',
    label: 'New enterprise lead from the website',
    actor: 'Application event',
    route: 'Application → CRM + email (approval required)',
    request: 'A new enterprise enquiry was submitted on the website.',
    trace: {
      user: {
        summary: 'No person asks anything: a website form submission emits an event that starts the workflow.',
        payload: { event: 'form.submitted', form: 'enterprise-enquiry', fields: { company_size: '500–1,000', interest: 'AI integration', message: '[redacted before processing]' } },
      },
      prodigi: {
        summary: 'Routes the event to the lead-qualification workflow and applies data-handling rules before any model sees it.',
        payload: { workflow: 'lead-qualification', data_policy: 'mask_personal_data', approval_required_for: ['crm.owner.assign', 'email.send'], trace_id: 'tr_sample_03' },
      },
      model: {
        summary: 'Assesses fit against the qualification criteria and proposes actions — it does not execute them.',
        payload: { assessment: 'enterprise_fit', reasons: ['company size in target range', 'interest matches AI integration'], proposed_actions: ['crm.lead.create', 'crm.owner.assign', 'email.draft'] },
      },
      tools: {
        summary: 'Checks the CRM for an existing account, then prepares a draft lead and a draft reply.',
        payload: { calls: [{ call: 'crm.accounts.lookup', args: { match: 'email_domain' } }, { call: 'crm.lead.create', args: { status: 'draft' } }, { call: 'email.draft', args: { template: 'enterprise-first-reply' } }] },
      },
      systems: {
        summary: 'The CRM stores a draft lead with a suggested owner; the email system saves a draft reply. Nothing is sent.',
        payload: { crm: { lead: 'L-3307', status: 'draft', suggested_owner: 'enterprise-team' }, email: { draft: 'D-118', status: 'unsent' } },
      },
      result: {
        summary: 'The proposed actions wait for a person to approve them.',
        payload: { status: 'awaiting_approval', approver_role: 'sales_lead', pending: ['assign owner', 'send reply'] },
      },
    },
    outcome: {
      kind: 'approval',
      title: 'Awaiting human approval',
      text: 'A sales lead reviews the qualification, the suggested owner and the drafted reply. Only after approval is the owner assigned and the email sent.',
    },
  },
];
