import type { Content, FunctionDeclaration } from '@google/genai';
import { gemini } from './client.js';
import { env } from '../../config/env.js';
import { buildSystemInstruction, knowledge } from '../../knowledge/index.js';
import { semanticSearch } from './search-index.js';
import { AppError } from '../../lib/app-error.js';
import { logger } from '../../lib/logger.js';

/** Matches the frontend's AgentEvent union (src/core/services/ai/types.ts). */
export type AgentEvent =
  | { type: 'plan'; steps: { id: string; kind: string; title: string }[] }
  | { type: 'step_started'; stepId: string }
  | { type: 'log'; stepId: string; message: string; tool?: { name: string; input: Record<string, unknown>; output: string } }
  | { type: 'step_completed'; stepId: string; durationMs: number }
  | { type: 'result'; result: { title: string; summary: string; sections: { heading: string; items: string[] }[]; nextActions: string[] } };

export type AgentGoal = 'research' | 'analyze' | 'find' | 'documents' | 'automate' | 'connect';

const goalTitles: Record<AgentGoal, string> = {
  research: 'Research',
  analyze: 'Analyze',
  find: 'Find information',
  documents: 'Process documents',
  automate: 'Automate workflow',
  connect: 'Connect systems',
};

/**
 * Real tools the agent can call. Scoped deliberately: this agent can only
 * read Prodigi's own published content — it has no access to any business
 * system (none exist yet), matching the "never fake what isn't connected"
 * principle the rest of the site follows.
 */
const tools: FunctionDeclaration[] = [
  {
    name: 'search_prodigi_knowledge',
    description: "Search Prodigi's own published site content (capabilities, FAQs, pillars) for passages relevant to a query.",
    parametersJsonSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'What to search for' } },
      required: ['query'],
    },
  },
  {
    name: 'list_intelligence_capabilities',
    description: 'List every AI capability Prodigi Intelligence offers (chat, agents, search, voice, automation, integrations) with a one-line summary.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<{ output: unknown; log: string }> {
  if (name === 'search_prodigi_knowledge') {
    const query = typeof args.query === 'string' ? args.query : '';
    const hits = await semanticSearch(query, { limit: 4 });
    const results = hits.map((hit) => ({ title: hit.doc.title, path: hit.doc.path, text: hit.doc.text, relevance: Math.round(hit.score * 100) / 100 }));
    return { output: { results }, log: `Found ${results.length} relevant passage(s) for "${query}".` };
  }
  if (name === 'list_intelligence_capabilities') {
    const results = knowledge.intelligenceCapabilities.map((c) => ({ name: c.name, summary: c.summary, path: c.path }));
    return { output: { results }, log: `Listed ${results.length} Intelligence capabilities.` };
  }
  throw AppError.badRequest(`Unknown tool: ${name}`);
}

/**
 * Runs a real agent loop: the model plans by calling tools (grounded in
 * Prodigi's own content — there are no other systems to connect to yet),
 * then synthesizes a result. Streamed as AgentEvents so the UI's existing
 * timeline renders real tool calls instead of a scripted demo.
 */
export async function* runAgent(goal: AgentGoal, instructions: string): AsyncGenerator<AgentEvent> {
  const task = instructions.trim() || `Help with: ${goalTitles[goal]}`;
  const steps = [
    { id: 's1', kind: 'understand', title: 'Understanding request' },
    { id: 's2', kind: 'plan', title: 'Planning' },
    { id: 's3', kind: 'tools', title: 'Calling tools' },
    { id: 's4', kind: 'reason', title: 'Reasoning' },
    { id: 's5', kind: 'generate', title: 'Generating result' },
    { id: 's6', kind: 'complete', title: 'Completed' },
  ] as const;
  yield { type: 'plan', steps: steps.map(({ id, kind, title }) => ({ id, kind, title })) };

  const started = Date.now();
  yield { type: 'step_started', stepId: 's1' };
  yield { type: 'log', stepId: 's1', message: `Goal: ${goalTitles[goal].toLowerCase()}. Task: "${task}".` };
  yield { type: 'step_completed', stepId: 's1', durationMs: Date.now() - started };

  yield { type: 'step_started', stepId: 's2' };
  yield { type: 'log', stepId: 's2', message: 'Decided which Prodigi tools can help, based on what is actually available today.' };
  yield { type: 'step_completed', stepId: 's2', durationMs: 300 };

  const systemInstruction = `${buildSystemInstruction()}\n\nYou are running as an agent with tool access, carrying out: ${goalTitles[goal]}. Task: "${task}". Call tools to gather real information first. Once you have enough, stop calling tools and produce the final JSON result (schema given separately). Only use information returned by your tools or this instruction — never invent facts, names or numbers.`;

  const resultSchema = {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'One to two sentence summary of the outcome.' },
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: { heading: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } },
          required: ['heading', 'items'],
        },
      },
      nextActions: { type: 'array', items: { type: 'string' }, description: '2-3 short, concrete next steps.' },
    },
    required: ['summary', 'sections', 'nextActions'],
  } as const;

  type AgentResult = { summary: string; sections: { heading: string; items: string[] }[]; nextActions: string[] };
  const contents: Content[] = [{ role: 'user', parts: [{ text: task }] }];
  let finalResult: AgentResult | null = null;
  const toolStepStarted = { done: false };
  const MAX_TOOL_ROUNDS = 4;

  try {
    // Phase 1: let the model call tools (up to MAX_TOOL_ROUNDS times) until it
    // stops asking for them, i.e. it replies with text instead of a function call.
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const response = await gemini.models.generateContent({
        model: env.GEMINI_TEXT_MODEL,
        contents,
        config: { systemInstruction, tools: [{ functionDeclarations: tools }], temperature: 0.3, maxOutputTokens: 700 },
      });

      const calls = response.functionCalls;
      if (!calls || !calls.length) {
        if (response.text) contents.push({ role: 'model', parts: [{ text: response.text }] });
        break;
      }

      if (!toolStepStarted.done) {
        yield { type: 'step_started', stepId: 's3' };
        toolStepStarted.done = true;
      }
      contents.push({ role: 'model', parts: calls.map((call) => ({ functionCall: call })) });
      const responseParts = [];
      for (const call of calls) {
        const name = call.name ?? 'unknown_tool';
        const args = call.args ?? {};
        const { output, log } = await callTool(name, args);
        yield { type: 'log', stepId: 's3', message: log, tool: { name, input: args, output: JSON.stringify(output).slice(0, 500) } };
        responseParts.push({ functionResponse: { name, id: call.id, response: output as Record<string, unknown> } });
      }
      contents.push({ role: 'user', parts: responseParts });
    }

    // Phase 2: a dedicated call (no tools, so the model can't deflect into
    // another tool call) asking it to summarize everything gathered above as
    // the structured result the UI renders.
    contents.push({ role: 'user', parts: [{ text: 'Summarize the above as the final JSON result, following the given schema exactly.' }] });
    const finalResponse = await gemini.models.generateContent({
      model: env.GEMINI_TEXT_MODEL,
      contents,
      config: { systemInstruction, responseMimeType: 'application/json', responseJsonSchema: resultSchema, temperature: 0.2, maxOutputTokens: 700 },
    });
    const raw = finalResponse.text;
    if (raw) {
      try {
        finalResult = JSON.parse(raw) as AgentResult;
      } catch (parseError) {
        logger.warn({ err: parseError, raw: raw.slice(0, 200) }, 'Agent final JSON failed to parse');
      }
    }
  } catch (error) {
    throw AppError.fromUnknown(error);
  }

  if (toolStepStarted.done) yield { type: 'step_completed', stepId: 's3', durationMs: 900 };
  else {
    yield { type: 'step_started', stepId: 's3' };
    yield { type: 'log', stepId: 's3', message: 'No tool calls were needed for this task.' };
    yield { type: 'step_completed', stepId: 's3', durationMs: 50 };
  }

  yield { type: 'step_started', stepId: 's4' };
  yield { type: 'log', stepId: 's4', message: 'Synthesized the tool results into a plain-language answer.' };
  yield { type: 'step_completed', stepId: 's4', durationMs: 300 };

  yield { type: 'step_started', stepId: 's5' };
  if (!finalResult) {
    logger.warn({ goal }, 'Agent produced no structured result');
    finalResult = {
      summary: "I gathered information but couldn't form a complete answer. Try rephrasing the task, or start a conversation with the Prodigi team.",
      sections: [],
      nextActions: ['Start a conversation with Prodigi'],
    };
  }
  yield { type: 'step_completed', stepId: 's5', durationMs: 200 };

  yield { type: 'step_started', stepId: 's6' };
  yield { type: 'log', stepId: 's6', message: 'Run finished. No changes were made to any system — this agent only reads Prodigi’s own content today.' };
  yield { type: 'step_completed', stepId: 's6', durationMs: 50 };

  yield {
    type: 'result',
    result: {
      title: `${goalTitles[goal]} — result`,
      summary: finalResult.summary,
      sections: finalResult.sections,
      nextActions: finalResult.nextActions.length ? finalResult.nextActions : ['Start a conversation with Prodigi'],
    },
  };
}
