import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHttpAIService } from './http-ai-service';

const service = createHttpAIService('https://api.example.test');

function mockFetch(body: string, init: ResponseInit & { contentType: string }) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status: init.status ?? 200, headers: { 'content-type': init.contentType } })));
}

afterEach(() => vi.unstubAllGlobals());

describe('http adapter', () => {
  it('never sends credentialed cross-origin requests without matching backend CORS', async () => {
    // Regression test: 'include' here requires the backend to send
    // Access-Control-Allow-Credentials: true, which it doesn't (there's no
    // session auth) — the browser rejects the request outright if this drifts.
    mockFetch('{"type":"done"}\n', { contentType: 'application/x-ndjson' });
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    for await (const _ of service.chat({ conversationId: 'c', messages: [] })) void _;
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).not.toBe('include');
  });

  it('parses NDJSON chat streams', async () => {
    mockFetch('{"type":"delta","text":"Hel"}\n{"type":"delta","text":"lo"}\n{"type":"done"}\n', { contentType: 'application/x-ndjson' });
    const text: string[] = [];
    for await (const event of service.chat({ conversationId: 'c', messages: [] })) if (event.type === 'delta') text.push(event.text);
    expect(text.join('')).toBe('Hello');
  });

  it('parses SSE chat streams', async () => {
    mockFetch('data: {"type":"delta","text":"Hi"}\n\ndata: {"type":"done"}\n\n', { contentType: 'text/event-stream' });
    const types: string[] = [];
    for await (const event of service.chat({ conversationId: 'c', messages: [] })) types.push(event.type);
    expect(types).toEqual(['delta', 'done']);
  });

  it('accepts plain JSON chat responses', async () => {
    mockFetch(JSON.stringify({ content: 'Answer', followUps: ['Next?'] }), { contentType: 'application/json' });
    const types: string[] = [];
    for await (const event of service.chat({ conversationId: 'c', messages: [] })) types.push(event.type);
    expect(types).toEqual(['delta', 'follow_ups', 'done']);
  });

  it('maps HTTP 429 to rate_limited', async () => {
    mockFetch('{}', { status: 429, contentType: 'application/json' });
    await expect(service.search({ query: 'x' })).rejects.toMatchObject({ code: 'rate_limited' });
  });

  it('rejects malformed events', async () => {
    mockFetch('{"type":"unexpected"}\n', { contentType: 'application/x-ndjson' });
    const run = async () => {
      for await (const _ of service.chat({ conversationId: 'c', messages: [] })) void _;
    };
    await expect(run()).rejects.toMatchObject({ code: 'bad_response' });
  });
});
