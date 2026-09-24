import { AIError } from '../errors';
import type { AgentEvent, AIService, CallOptions, ChatStreamEvent, SearchResponse } from '../types';
import { buildScenario } from './agent-scenarios';
import { composeAnswer } from './chat-engine';
import { buildKnowledge } from './knowledge';
import { Retriever } from './retrieval';

/**
 * DEMO ADAPTER — runs entirely in the browser.
 * No network calls, no AI model, no business systems. Answers come only from
 * this website's own content; agent runs are scripted and labelled simulated.
 */

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new AIError('aborted'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new AIError('aborted'));
      },
      { once: true },
    );
  });
}

/** Demo-only fault injection so error states can be reviewed: include "#fail" in a message. */
const wantsFailure = (text: string | undefined) => Boolean(text?.includes('#fail'));

export function createDemoAIService(): AIService {
  const docs = buildKnowledge();
  const retriever = new Retriever(docs);
  const categories = [...new Set(docs.map((doc) => doc.category))];

  return {
    mode: 'demo',

    async *chat(request, options: CallOptions = {}): AsyncGenerator<ChatStreamEvent> {
      const { signal } = options;
      const latest = request.messages.at(-1)?.content;
      await sleep(450, signal); // "connecting"
      if (wantsFailure(latest)) throw new AIError('unavailable');

      const answer = composeAnswer(retriever, request.messages);
      const words = answer.text.split(/(\s+)/);
      for (let i = 0; i < words.length; i += 4) {
        yield { type: 'delta', text: words.slice(i, i + 4).join('') };
        await sleep(28, signal);
      }
      if (answer.sources.length) yield { type: 'sources', sources: answer.sources };
      if (answer.followUps.length) yield { type: 'follow_ups', suggestions: answer.followUps };
      yield { type: 'done' };
    },

    async *runAgent(request, options: CallOptions = {}): AsyncGenerator<AgentEvent> {
      const { signal } = options;
      if (wantsFailure(request.instructions)) {
        await sleep(600, signal);
        throw new AIError('unavailable');
      }
      const scenario = buildScenario(request.goal, request.instructions);
      const steps = scenario.steps.map((step, index) => ({ id: `step-${index + 1}`, kind: step.kind, title: step.title }));
      yield { type: 'plan', steps };

      for (const [index, step] of scenario.steps.entries()) {
        const stepId = steps[index]!.id;
        yield { type: 'step_started', stepId };
        const slice = step.durationMs / Math.max(step.logs.length, 1);
        for (const log of step.logs) {
          await sleep(slice, signal);
          yield { type: 'log', stepId, message: log.message, ...(log.tool ? { tool: log.tool } : {}) };
        }
        yield { type: 'step_completed', stepId, durationMs: step.durationMs };
      }
      yield { type: 'result', result: scenario.result };
    },

    async search(request, options: CallOptions = {}): Promise<SearchResponse> {
      const started = performance.now();
      await sleep(320, options.signal);
      if (wantsFailure(request.query)) throw new AIError('unavailable');

      const ranked = retriever.search(request.query, { limit: request.limit ?? 8, category: request.category });
      const best = ranked[0]?.score ?? 1;
      const hits = ranked.map((item) => ({
        id: item.doc.id,
        title: item.doc.title,
        url: item.doc.url,
        category: item.doc.category,
        snippet: item.doc.answer.length > 260 ? `${item.doc.answer.slice(0, 257).trimEnd()}…` : item.doc.answer,
        score: Math.round((item.score / best) * 100) / 100,
        matchedTerms: [...new Set(item.matched)],
      }));

      const top = ranked[0];
      const answer =
        top && top.score >= 2.2
          ? { text: top.doc.answer, citations: hits.filter((hit) => hit.score >= 0.5).slice(0, 3).map((hit) => hit.id) }
          : null;

      return { query: request.query, answer, hits, categories, tookMs: Math.round(performance.now() - started) };
    },

    async voiceTurn(request, options: CallOptions = {}) {
      // Demo mode never records audio; the UI supplies a transcript.
      const transcript = (request.transcript ?? '').trim();
      await sleep(900, options.signal);
      if (!transcript || wantsFailure(transcript)) throw new AIError('bad_request');
      const answer = composeAnswer(retriever, [{ role: 'user', content: transcript }]);
      // Voice replies are short: first two sentences, markdown stripped.
      const plain = answer.text.replace(/\*\*/g, '').split('\n\n')[0] ?? '';
      const reply = plain.match(/[^.!?]+[.!?]+/g)?.slice(0, 2).join(' ').trim() ?? plain;
      return { transcript, reply };
    },
  };
}
