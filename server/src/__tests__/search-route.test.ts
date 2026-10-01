import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/models/search-log.js', () => ({ SearchLog: { create: vi.fn().mockResolvedValue(undefined) } }));
vi.mock('../providers/gemini/search-index.js', () => ({
  semanticSearch: vi.fn(async (query: string) => {
    if (query === 'empty') return [];
    return [
      { doc: { id: 'faq:what-is-prodigi', title: 'What is Prodigi?', path: '/about', category: 'faq', text: 'Prodigi is a product, digital and intelligence company.' }, score: 0.82 },
      { doc: { id: 'page:/intelligence', title: 'Intelligence', path: '/intelligence', category: 'page', text: 'AI strategy, chat, agents and more.' }, score: 0.61 },
    ];
  }),
}));

const { createApp } = await import('../app.js');

describe('POST /api/ai/search', () => {
  let app: ReturnType<typeof createApp>;
  beforeEach(() => {
    app = createApp();
  });

  it('returns ranked hits and a grounded answer above the confidence threshold', async () => {
    const res = await request(app).post('/api/ai/search').send({ query: 'what is prodigi' });
    expect(res.status).toBe(200);
    expect(res.body.hits).toHaveLength(2);
    expect(res.body.answer.text).toContain('Prodigi is a product');
    expect(res.body.answer.citations).toContain('faq:what-is-prodigi');
  });

  it('returns no answer when nothing matches', async () => {
    const res = await request(app).post('/api/ai/search').send({ query: 'empty' });
    expect(res.status).toBe(200);
    expect(res.body.hits).toEqual([]);
    expect(res.body.answer).toBeNull();
  });

  it('rejects an empty query without leaking internals', async () => {
    const res = await request(app).post('/api/ai/search').send({ query: '' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code: 'bad_request', message: expect.any(String) });
  });
});
