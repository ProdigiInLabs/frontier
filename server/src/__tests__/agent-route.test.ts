import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../providers/gemini/agent.js', () => ({
  runAgent: vi.fn(async function* (goal: string) {
    if (goal === 'automate') throw new Error('429 quota');
    yield { type: 'plan', steps: [{ id: 's1', kind: 'understand', title: 'Understanding request' }] };
    yield { type: 'result', result: { title: 'Done', summary: 'ok', sections: [], nextActions: [] } };
  }),
}));

const { createApp } = await import('../app.js');

describe('POST /api/ai/agent', () => {
  let app: ReturnType<typeof createApp>;
  beforeEach(() => {
    app = createApp();
  });

  it('streams a plan followed by a result', async () => {
    const res = await request(app).post('/api/ai/agent').send({ goal: 'research', instructions: 'find stuff' });
    expect(res.status).toBe(200);
    const events = res.text
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(events[0]).toMatchObject({ type: 'plan' });
    expect(events.at(-1)).toMatchObject({ type: 'result' });
  });

  it('rejects an unknown goal', async () => {
    const res = await request(app).post('/api/ai/agent').send({ goal: 'nope' });
    expect(res.status).toBe(400);
  });

  it('returns a clean JSON error when the run fails before any event', async () => {
    const res = await request(app).post('/api/ai/agent').send({ goal: 'automate' });
    expect(res.status).toBe(429);
    expect(res.body).toEqual({ code: 'rate_limited', message: expect.any(String) });
  });
});
