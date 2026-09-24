import type { AgentGoal, AgentResult, AgentStepKind, ToolCall } from '../types';

/**
 * Scripted agent runs. Every tool call is labelled simulated; nothing here
 * touches a network or a real system. The shape mirrors what a real agent
 * backend streams, so the UI is exercised end to end.
 */
export interface ScriptedStep {
  kind: AgentStepKind;
  title: string;
  durationMs: number;
  logs: { message: string; tool?: ToolCall }[];
}

export interface Scenario {
  steps: ScriptedStep[];
  result: AgentResult;
}

const sim = (name: string, input: Record<string, unknown>, output: string): ToolCall => ({ name, input, output: `${output} (simulated)` });

export const agentGoals: { id: AgentGoal; label: string; description: string; placeholder: string }[] = [
  { id: 'research', label: 'Research', description: 'Gather and summarize information on a topic.', placeholder: 'e.g. How are mid-sized retailers using AI search?' },
  { id: 'analyze', label: 'Analyze', description: 'Examine data and explain what changed.', placeholder: 'e.g. Why did enquiries drop last month?' },
  { id: 'find', label: 'Find information', description: 'Locate an answer across internal knowledge.', placeholder: 'e.g. What is our refund policy for annual plans?' },
  { id: 'documents', label: 'Process documents', description: 'Extract and validate data from documents.', placeholder: 'e.g. Extract totals and due dates from this week’s invoices' },
  { id: 'automate', label: 'Automate workflow', description: 'Carry out a multi-step business process.', placeholder: 'e.g. Qualify new inbound leads and route them' },
  { id: 'connect', label: 'Connect systems', description: 'Plan data flow between two systems.', placeholder: 'e.g. Sync new e-commerce orders into the ERP' },
];

function clean(text: string | undefined, fallback: string): string {
  const value = (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 160);
  return value || fallback;
}

export function buildScenario(goal: AgentGoal, instructions?: string): Scenario {
  const def = agentGoals.find((g) => g.id === goal) ?? agentGoals[0]!;
  const task = clean(instructions, def.placeholder.replace(/^e\.g\. /, ''));

  const understand: ScriptedStep = {
    kind: 'understand',
    title: 'Understanding request',
    durationMs: 700,
    logs: [
      { message: `Goal: ${def.label.toLowerCase()}. Task: “${task}”.` },
      { message: 'Checked permissions: read-only access to the demo workspace.' },
    ],
  };

  const planned = (steps: string[]): ScriptedStep => ({
    kind: 'plan',
    title: 'Planning',
    durationMs: 800,
    logs: steps.map((step, index) => ({ message: `${index + 1}. ${step}` })),
  });

  const complete: ScriptedStep = {
    kind: 'complete',
    title: 'Completed',
    durationMs: 300,
    logs: [{ message: 'Run finished. No changes were made to any system.' }],
  };

  const scenarios: Record<AgentGoal, () => Scenario> = {
    research: () => ({
      steps: [
        understand,
        planned(['Define the questions to answer', 'Search approved sources', 'Compare findings', 'Write a brief with sources']),
        { kind: 'tools', title: 'Calling tools', durationMs: 1200, logs: [
          { message: 'Searching the knowledge base.', tool: sim('knowledge.search', { query: task, limit: 10 }, '8 passages returned') },
          { message: 'Searching approved external sources.', tool: sim('web.search', { query: task, allowlist: 'approved-sources' }, '5 documents returned') },
        ] },
        { kind: 'retrieve', title: 'Retrieving information', durationMs: 900, logs: [{ message: 'Kept 6 passages above the relevance threshold; discarded 7 duplicates.' }] },
        { kind: 'reason', title: 'Reasoning', durationMs: 1000, logs: [{ message: 'Grouped findings into themes and flagged one conflicting claim for review.' }] },
        { kind: 'generate', title: 'Generating result', durationMs: 800, logs: [{ message: 'Drafted a brief with citations for each claim.' }] },
        complete,
      ],
      result: {
        title: 'Research brief',
        summary: `A structured brief on “${task}”, organized by theme with a source for every claim.`,
        sections: [
          { heading: 'What the brief contains', items: ['Three to five key themes', 'Supporting evidence per theme, with citations', 'Open questions and conflicting sources'] },
          { heading: 'How a production agent would do this', items: ['Search only allow-listed sources', 'Store citations with every extracted claim', 'Route conflicting evidence to a person'] },
        ],
        nextActions: ['Review flagged conflicts', 'Share the brief', 'Schedule a weekly refresh'],
      },
    }),
    analyze: () => ({
      steps: [
        understand,
        planned(['Identify the metric and time range', 'Query the data', 'Compare against the previous period', 'Explain the likely drivers']),
        { kind: 'tools', title: 'Calling tools', durationMs: 1300, logs: [
          { message: 'Running a read-only query.', tool: sim('warehouse.query', { metric: 'enquiries', period: 'last_30_days', compare: 'previous_30_days' }, '2 result sets') },
          { message: 'Pulling traffic by channel.', tool: sim('analytics.report', { dimension: 'channel' }, '6 channels') },
        ] },
        { kind: 'retrieve', title: 'Retrieving information', durationMs: 700, logs: [{ message: 'Joined enquiries with traffic by week and by channel.' }] },
        { kind: 'reason', title: 'Reasoning', durationMs: 1100, logs: [{ message: 'Separated volume effects from conversion effects; tested three explanations.' }] },
        { kind: 'generate', title: 'Generating result', durationMs: 700, logs: [{ message: 'Wrote an explanation with the supporting numbers attached.' }] },
        complete,
      ],
      result: {
        title: 'Analysis summary',
        summary: `An explanation for “${task}”, separating what changed from why it likely changed.`,
        sections: [
          { heading: 'What the analysis checks', items: ['Volume versus conversion changes', 'Changes by channel and by week', 'Known events in the period'] },
          { heading: 'Safeguards', items: ['Read-only database role', 'Queries logged for audit', 'Numbers shown alongside every conclusion'] },
        ],
        nextActions: ['Open the underlying queries', 'Set an alert on the metric', 'Share with the team'],
      },
    }),
    find: () => ({
      steps: [
        understand,
        planned(['Search policies and documentation', 'Verify the most recent version', 'Answer with the source']),
        { kind: 'tools', title: 'Calling tools', durationMs: 900, logs: [
          { message: 'Semantic search across internal documents.', tool: sim('docs.search', { query: task, scope: 'policies,handbooks' }, '4 matching sections') },
        ] },
        { kind: 'retrieve', title: 'Retrieving information', durationMs: 800, logs: [{ message: 'Selected the latest version of the policy; ignored two archived copies.' }] },
        { kind: 'reason', title: 'Reasoning', durationMs: 700, logs: [{ message: 'Confirmed the answer is stated explicitly — no inference needed.' }] },
        { kind: 'generate', title: 'Generating result', durationMs: 500, logs: [{ message: 'Composed a direct answer with a link to the section.' }] },
        complete,
      ],
      result: {
        title: 'Answer with source',
        summary: `A direct answer to “${task}”, quoted from the current version of the relevant document.`,
        sections: [
          { heading: 'Why this is trustworthy', items: ['Only the latest document version is used', 'The exact section is linked', 'The agent says when no answer exists'] },
        ],
        nextActions: ['Open the source section', 'Ask a follow-up'],
      },
    }),
    documents: () => ({
      steps: [
        understand,
        planned(['Collect the documents', 'Extract the required fields', 'Validate against business rules', 'Prepare records for review']),
        { kind: 'tools', title: 'Calling tools', durationMs: 1300, logs: [
          { message: 'Listing documents in the inbox folder.', tool: sim('storage.list', { folder: 'inbox/invoices', since: '7d' }, '12 files') },
          { message: 'Extracting structured fields.', tool: sim('docs.extract', { fields: ['supplier', 'total', 'due_date', 'po_number'] }, '12 records') },
        ] },
        { kind: 'retrieve', title: 'Retrieving information', durationMs: 700, logs: [{ message: 'Matched 10 of 12 records to purchase orders.' }] },
        { kind: 'reason', title: 'Reasoning', durationMs: 900, logs: [{ message: 'Flagged 2 records: one missing PO number, one total above the approval limit.' }] },
        { kind: 'generate', title: 'Generating result', durationMs: 600, logs: [{ message: 'Prepared a review queue; nothing was posted to accounting.' }] },
        complete,
      ],
      result: {
        title: 'Extraction ready for review',
        summary: `Structured records prepared for “${task}”, with exceptions separated for a person to check.`,
        sections: [
          { heading: 'Output', items: ['10 records ready to approve', '2 exceptions with the reason for each', 'Original document linked to every record'] },
          { heading: 'Human in the loop', items: ['Nothing is posted until approved', 'Approval thresholds come from business rules'] },
        ],
        nextActions: ['Review exceptions', 'Approve and post', 'Adjust extraction rules'],
      },
    }),
    automate: () => ({
      steps: [
        understand,
        planned(['Fetch new items', 'Enrich with CRM context', 'Apply qualification rules and AI judgement', 'Propose actions for approval']),
        { kind: 'tools', title: 'Calling tools', durationMs: 1400, logs: [
          { message: 'Fetching new inbound leads.', tool: sim('crm.leads.list', { status: 'new', since: '24h' }, '9 leads') },
          { message: 'Looking up company context.', tool: sim('crm.accounts.lookup', { match: 'email_domain' }, '6 matches') },
        ] },
        { kind: 'retrieve', title: 'Retrieving information', durationMs: 700, logs: [{ message: 'Loaded qualification criteria and routing rules.' }] },
        { kind: 'reason', title: 'Reasoning', durationMs: 1100, logs: [{ message: 'Scored each lead against the criteria; 4 strong fits, 3 need information, 2 not a fit.' }] },
        { kind: 'generate', title: 'Generating result', durationMs: 700, logs: [
          { message: 'Drafted owner assignments and follow-up emails.', tool: sim('crm.tasks.propose', { count: 7, requires_approval: true }, '7 proposed actions') },
        ] },
        complete,
      ],
      result: {
        title: 'Workflow proposal',
        summary: `A proposed run of “${task}” — every action waits for approval before anything is sent or changed.`,
        sections: [
          { heading: 'Proposed actions', items: ['4 leads assigned to owners with context', '3 information-request emails drafted', '2 leads closed with a reason'] },
          { heading: 'Controls', items: ['Actions require approval', 'Every step logged', 'Rules editable by the business'] },
        ],
        nextActions: ['Approve all', 'Review individually', 'Change the rules'],
      },
    }),
    connect: () => ({
      steps: [
        understand,
        planned(['Describe both systems’ APIs', 'Map the data', 'Define triggers and error handling', 'Produce an integration plan']),
        { kind: 'tools', title: 'Calling tools', durationMs: 1200, logs: [
          { message: 'Reading the source API description.', tool: sim('api.describe', { system: 'e-commerce', resource: 'orders' }, '14 fields') },
          { message: 'Reading the target API description.', tool: sim('api.describe', { system: 'erp', resource: 'sales_orders' }, '19 fields') },
        ] },
        { kind: 'retrieve', title: 'Retrieving information', durationMs: 700, logs: [{ message: 'Loaded existing field conventions and validation rules.' }] },
        { kind: 'reason', title: 'Reasoning', durationMs: 1100, logs: [{ message: 'Mapped 12 fields directly, 2 need transformation, 5 target fields need defaults.' }] },
        { kind: 'generate', title: 'Generating result', durationMs: 700, logs: [{ message: 'Wrote an integration plan with retries, idempotency and alerts.' }] },
        complete,
      ],
      result: {
        title: 'Integration plan',
        summary: `A plan for “${task}”, including field mapping, triggers, failure handling and monitoring.`,
        sections: [
          { heading: 'Plan', items: ['Event-driven trigger on order creation', 'Field mapping with 2 transformations', 'Idempotent writes and retry with backoff', 'Alerts for failed syncs'] },
          { heading: 'Where AI helps', items: ['Resolving ambiguous product matches', 'Summarizing failures for the operations team'] },
        ],
        nextActions: ['Review the field mapping', 'Estimate the build', 'Talk to Prodigi about delivery'],
      },
    }),
  };

  return scenarios[goal]();
}
