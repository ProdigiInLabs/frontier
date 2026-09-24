import { describe, expect, it } from 'vitest';
import type { ChatStreamEvent } from '../types';
import { composeAnswer } from './chat-engine';
import { createDemoAIService } from './demo-ai-service';
import { buildKnowledge } from './knowledge';
import { Retriever } from './retrieval';

const retriever = new Retriever(buildKnowledge());
const top = (q: string) => retriever.search(q)[0]?.doc.id;
const ask = (q: string) => composeAnswer(retriever, [{ role: 'user', content: q }]);

describe('demo retrieval', () => {
  it.each([
    ['What is AEO?', 'faq:what-is-aeo'],
    ['what is generative engine optimization', 'faq:what-is-geo'],
    ['How much does a project cost?', 'faq:how-much-does-it-cost'],
    ['what is an ai agent', 'faq:what-is-an-ai-agent'],
    ['what is RAG', 'faq:what-is-rag'],
  ])('%s → %s', (query, expected) => {
    expect(top(query)).toBe(expected);
  });

  it('finds modernization for legacy questions', () => {
    const ids = retriever.search('can you modernize our legacy application').slice(0, 3).map((r) => r.doc.url);
    expect(ids).toContain('/product/modernization');
  });
});

describe('demo chat', () => {
  it('answers with sources and follow-ups', () => {
    const answer = ask('How does AI integration work?');
    expect(answer.text).toMatch(/layers/i);
    expect(answer.sources.length).toBeGreaterThan(0);
    expect(answer.followUps.length).toBe(3);
  });

  it('is honest about being a demo', () => {
    expect(ask('Which model are you?').text).toMatch(/no AI model is connected/i);
  });

  it('declines instead of guessing', () => {
    expect(ask('banana smoothie recipe with oat milk').text).toMatch(/rather say so than guess/);
  });

  it('streams deltas then sources, follow-ups and done', async () => {
    const service = createDemoAIService();
    const events: ChatStreamEvent[] = [];
    for await (const event of service.chat({ conversationId: 'c', messages: [{ role: 'user', content: 'What is GEO?' }] })) events.push(event);
    expect(events[0]?.type).toBe('delta');
    expect(events.at(-1)?.type).toBe('done');
    expect(events.some((e) => e.type === 'sources')).toBe(true);
  });

  it('can be aborted', async () => {
    const service = createDemoAIService();
    const controller = new AbortController();
    const run = (async () => {
      for await (const _ of service.chat({ conversationId: 'c', messages: [{ role: 'user', content: 'What is SEO?' }] }, { signal: controller.signal })) {
        void _;
      }
    })();
    controller.abort();
    await expect(run).rejects.toMatchObject({ code: 'aborted' });
  });
});

describe('demo agent', () => {
  it('emits a plan, completes every step and returns a result', async () => {
    const service = createDemoAIService();
    const types: string[] = [];
    const iterator = service.runAgent({ goal: 'find', instructions: 'refund policy' });
    for await (const event of iterator) types.push(event.type);
    expect(types[0]).toBe('plan');
    expect(types.at(-1)).toBe('result');
    expect(types.filter((t) => t === 'step_completed').length).toBe(types.filter((t) => t === 'step_started').length);
  }, 20_000);
});
