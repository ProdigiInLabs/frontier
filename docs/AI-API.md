# AI API contract

The AI experiences talk to one interface. A backend that implements the four endpoints below replaces the demo engine with no UI changes.

```
UI (features/intelligence/*)
  ↓
aiClient                      src/core/services/ai/ai-client.ts   — the only import UI code uses
  ↓
AIService interface           src/core/services/ai/types.ts
  ↓                    ↘
HttpAIService (API mode)   DemoAIService (demo mode)
  ↓                         src/core/services/ai/demo/  — local, no network
Backend AI service  →  model provider (Claude, OpenAI, Gemini, Azure AI, …), tools, RAG, business systems
```

Adapters are loaded lazily and separately: the demo engine is never downloaded in API mode, and neither is downloaded on marketing pages.

## Switching to a real backend

```bash
VITE_DEMO_MODE=false
VITE_API_URL=https://api.prodiginl.com
```

If `VITE_API_URL` is empty the site stays in demo mode regardless of `VITE_DEMO_MODE`.

## Security rules

- **Provider API keys never reach the browser.** The frontend has no secrets; every `VITE_*` value is public.
- The backend authenticates the caller (session cookie set by the backend, `credentials: 'include'`), applies rate limits and logs requests.
- Tools exposed to a model are least-privilege; actions with consequences require human approval server-side.
- Error responses must not include stack traces or provider payloads. The UI maps status codes to friendly messages and never renders error bodies.

## Endpoints

All requests are `POST` with `Content-Type: application/json` (voice may be `multipart/form-data`). Streaming endpoints may respond with `application/x-ndjson` (one JSON event per line) or `text/event-stream` (`data: {json}` frames).

### `POST /api/ai/chat`

Request:

```json
{ "conversationId": "c_123", "messages": [{ "role": "user", "content": "How does AI integration work?" }] }
```

Streamed response events (`ChatStreamEvent`):

```json
{ "type": "delta", "text": "AI integration works in layers…" }
{ "type": "sources", "sources": [{ "id": "doc-1", "title": "Integration guide", "url": "https://…", "snippet": "…" }] }
{ "type": "follow_ups", "suggestions": ["Which systems can it connect to?"] }
{ "type": "done" }
```

Non-streaming alternative (`application/json`): `{ "content": "…", "sources": [...], "followUps": [...] }`.

### `POST /api/ai/agent`

Request: `{ "goal": "research" | "analyze" | "find" | "documents" | "automate" | "connect", "instructions": "…" }`

Streamed `AgentEvent`s:

```json
{ "type": "plan", "steps": [{ "id": "s1", "kind": "understand", "title": "Understanding request" }] }
{ "type": "step_started", "stepId": "s1" }
{ "type": "log", "stepId": "s1", "message": "…", "tool": { "name": "crm.search", "input": {}, "output": "…" } }
{ "type": "step_completed", "stepId": "s1", "durationMs": 640 }
{ "type": "result", "result": { "title": "…", "summary": "…", "sections": [{ "heading": "…", "items": ["…"] }], "nextActions": ["…"] } }
```

Step `kind`: `understand | plan | tools | retrieve | reason | generate | complete`.

### `POST /api/ai/search`

Request: `{ "query": "refund policy", "category": "Answers", "limit": 8 }`

Response (`SearchResponse`):

```json
{
  "query": "refund policy",
  "answer": { "text": "…", "citations": ["hit-1"] },
  "hits": [{ "id": "hit-1", "title": "…", "url": "…", "category": "…", "snippet": "…", "score": 0.92, "matchedTerms": ["refund"] }],
  "categories": ["Answers", "Policies"],
  "tookMs": 84
}
```

### `POST /api/ai/voice`

Either multipart (`conversationId`, `audio` — WebM/Opus from `MediaRecorder`) or JSON `{ "conversationId": "…", "transcript": "…" }`.

Response (`VoiceTurnResponse`): `{ "transcript": "…", "reply": "…", "audioUrl": "https://…/reply.mp3" }` (`audioUrl` optional).

The browser only requests microphone access in API mode, after the visitor presses the microphone button.

## Status codes the UI understands

| Status | UI message |
| --- | --- |
| 400 / 422 | "That request couldn’t be processed. Try rephrasing it." |
| 408 / 504 / client timeout (60 s) | "That took longer than expected. Please try again." |
| 429 | "Prodigi Intelligence is busy right now…" |
| other 5xx | "Prodigi Intelligence is temporarily unavailable…" |
| network failure | "We couldn’t reach Prodigi Intelligence…" |

## Demo engine

`src/core/services/ai/demo/` answers only from this website's published content (FAQs, capability pages, pillars, products), using a small BM25 retriever. Agent runs are scripted and every tool call is labelled *simulated*. Typing `#fail` in any input triggers the error state for review.
