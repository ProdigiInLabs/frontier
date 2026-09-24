import { AIError } from '../errors';
import type {
  AgentEvent,
  AIService,
  CallOptions,
  ChatStreamEvent,
  SearchResponse,
  VoiceTurnResponse,
} from '../types';

/**
 * Production adapter for a Prodigi AI backend.
 *
 * Endpoints (relative to VITE_API_URL):
 *   POST /api/ai/chat    → NDJSON or SSE stream of ChatStreamEvent, or JSON { content, sources?, followUps? }
 *   POST /api/ai/agent   → NDJSON or SSE stream of AgentEvent
 *   POST /api/ai/search  → JSON SearchResponse
 *   POST /api/ai/voice   → JSON VoiceTurnResponse (multipart when audio is sent)
 *
 * The browser never holds provider credentials. Session auth, if added,
 * rides on httpOnly cookies (credentials: 'include' + CORS on the backend).
 */

const TIMEOUT_MS = 60_000;

function withTimeout(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  return signal && 'any' in AbortSignal ? AbortSignal.any([signal, timeout]) : (signal ?? timeout);
}

function errorForStatus(status: number): AIError {
  if (status === 429) return new AIError('rate_limited');
  if (status === 400 || status === 422) return new AIError('bad_request');
  if (status === 408 || status === 504) return new AIError('timeout');
  return new AIError('unavailable', `HTTP ${status}`);
}

async function post(baseUrl: string, path: string, body: BodyInit, options: CallOptions, json: boolean): Promise<Response> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/x-ndjson, text/event-stream, application/json',
      ...(json ? { 'Content-Type': 'application/json' } : {}),
    },
    body,
    credentials: 'include',
    signal: withTimeout(options.signal),
  });
  if (!response.ok) throw errorForStatus(response.status);
  return response;
}

/** Yields parsed JSON objects from an NDJSON or SSE body. */
async function* readEvents(response: Response): AsyncGenerator<unknown> {
  if (!response.body) throw new AIError('bad_response');
  const sse = (response.headers.get('content-type') ?? '').includes('text/event-stream');
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (value) buffer += value;
    const parts = buffer.split(sse ? /\r?\n\r?\n/ : /\r?\n/);
    buffer = done ? '' : (parts.pop() ?? '');
    for (const part of parts) {
      const payload = sse
        ? part
            .split(/\r?\n/)
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trim())
            .join('')
        : part.trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        yield JSON.parse(payload);
      } catch {
        throw new AIError('bad_response');
      }
    }
    if (done) return;
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function isChatEvent(v: unknown): v is ChatStreamEvent {
  if (!isObject(v)) return false;
  switch (v.type) {
    case 'delta':
      return typeof v.text === 'string';
    case 'sources':
      return Array.isArray(v.sources);
    case 'follow_ups':
      return Array.isArray(v.suggestions);
    case 'done':
      return true;
    default:
      return false;
  }
}

function isAgentEvent(v: unknown): v is AgentEvent {
  return isObject(v) && ['plan', 'step_started', 'log', 'step_completed', 'result'].includes(String(v.type));
}

export function createHttpAIService(baseUrl: string): AIService {
  return {
    mode: 'api',

    async *chat(request, options = {}) {
      const response = await post(baseUrl, '/api/ai/chat', JSON.stringify(request), options, true);
      const type = response.headers.get('content-type') ?? '';
      if (type.includes('application/json')) {
        const data: unknown = await response.json();
        if (!isObject(data) || typeof data.content !== 'string') throw new AIError('bad_response');
        yield { type: 'delta', text: data.content };
        if (Array.isArray(data.sources)) yield { type: 'sources', sources: data.sources as never };
        if (Array.isArray(data.followUps)) yield { type: 'follow_ups', suggestions: data.followUps as string[] };
        yield { type: 'done' };
        return;
      }
      for await (const event of readEvents(response)) {
        if (!isChatEvent(event)) throw new AIError('bad_response');
        yield event;
      }
    },

    async *runAgent(request, options = {}) {
      const response = await post(baseUrl, '/api/ai/agent', JSON.stringify(request), options, true);
      for await (const event of readEvents(response)) {
        if (!isAgentEvent(event)) throw new AIError('bad_response');
        yield event;
      }
    },

    async search(request, options = {}) {
      const response = await post(baseUrl, '/api/ai/search', JSON.stringify(request), options, true);
      const data: unknown = await response.json();
      if (!isObject(data) || !Array.isArray(data.hits)) throw new AIError('bad_response');
      return data as unknown as SearchResponse;
    },

    async voiceTurn(request, options = {}) {
      let body: BodyInit;
      let json = true;
      if (request.audio) {
        const form = new FormData();
        form.append('conversationId', request.conversationId);
        const ext = /mp4|aac/.test(request.audio.type) ? 'mp4' : /ogg/.test(request.audio.type) ? 'ogg' : 'webm';
        form.append('audio', request.audio, `turn.${ext}`);
        body = form;
        json = false;
      } else {
        body = JSON.stringify({ conversationId: request.conversationId, transcript: request.transcript });
      }
      const response = await post(baseUrl, '/api/ai/voice', body, options, json);
      const data: unknown = await response.json();
      if (!isObject(data) || typeof data.reply !== 'string') throw new AIError('bad_response');
      return data as unknown as VoiceTurnResponse;
    },
  };
}
