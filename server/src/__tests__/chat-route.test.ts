import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/models/conversation.js', () => ({ Conversation: { updateOne: vi.fn().mockResolvedValue(undefined) } }));
vi.mock('../providers/gemini/chat.js', () => ({
  streamChatReply: vi.fn(async function* (turns: { role: string; content: string }[]) {
    const latest = turns.at(-1)?.content;
    if (latest === '#fail-before-bytes') throw new Error('500 upstream boom');
    yield { type: 'delta', text: 'Hello ' };
    if (latest === '#fail-mid-stream') throw new Error('deadline exceeded');
    yield { type: 'delta', text: 'there.' };
    yield { type: 'sources', sources: [{ id: 'faq:x', title: 'X', url: '/x' }] };
    yield { type: 'done' };
  }),
}));

const { createApp } = await import('../app.js');

function parseNdjson(text: string) {
  return text
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

describe('POST /api/ai/chat', () => {
  let app: ReturnType<typeof createApp>;
  beforeEach(() => {
    app = createApp();
  });

  it('streams NDJSON events ending in done', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ conversationId: 'c1', messages: [{ role: 'user', content: 'hi' }] });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/x-ndjson');
    const events = parseNdjson(res.text);
    expect(events.map((e) => e.type)).toEqual(['delta', 'delta', 'sources', 'done']);
  });

  it('rejects a request with no messages', async () => {
    const res = await request(app).post('/api/ai/chat').send({ conversationId: 'c1', messages: [] });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('bad_request');
  });

  it('returns a clean JSON error when nothing has streamed yet', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ conversationId: 'c1', messages: [{ role: 'user', content: '#fail-before-bytes' }] });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ code: 'unavailable', message: expect.any(String) });
  });

  it('emits an NDJSON error event instead of crashing mid-stream once bytes are already sent', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ conversationId: 'c1', messages: [{ role: 'user', content: '#fail-mid-stream' }] });
    expect(res.status).toBe(200);
    const events = parseNdjson(res.text);
    expect(events[0]).toEqual({ type: 'delta', text: 'Hello ' });
    expect(events.at(-1)).toMatchObject({ type: 'error', code: 'timeout' });
  });
});
