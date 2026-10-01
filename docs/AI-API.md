# AI API contract

The AI experiences talk to one interface. This contract is implemented twice: the **demo engine** (default, no backend) and the **real backend** in `server/` (Node.js + Gemini + MongoDB — see [docs/BACKEND.md](BACKEND.md) for what it does and how to deploy it).

```
UI (features/intelligence/*)
  ↓
aiClient                      src/core/services/ai/ai-client.ts   — the only import UI code uses
  ↓
AIService interface           src/core/services/ai/types.ts
  ↓                    ↘
HttpAIService (API mode)   DemoAIService (demo mode)
  ↓                         src/core/services/ai/demo/  — local, no network
server/  (real backend)  →  Google Gemini (chat, embeddings, Live API), MongoDB Atlas
```

Realtime voice is a second, specialized channel alongside `aiClient`: a persistent WebSocket (`wss://…/ws/voice`), because continuous duplex audio doesn't fit a request/response client. See [Realtime voice](#realtime-voice-wsvoice) below and `src/features/intelligence/voice/realtime/`.

Adapters are loaded lazily and separately: the demo engine is never downloaded in API mode, and neither is downloaded on marketing pages.

## Switching to the real backend

```bash
VITE_DEMO_MODE=false
VITE_API_URL=https://prodigi-backend.onrender.com   # or wherever you deployed server/
```

If `VITE_API_URL` is empty the site stays in demo mode regardless of `VITE_DEMO_MODE`. See [docs/BACKEND.md](BACKEND.md) for one-time setup (MongoDB Atlas, a Gemini API key, deploying `server/`).

## Security rules

- **Provider API keys never reach the browser.** The frontend has no secrets; every `VITE_*` value is public.
- There is no session auth today — requests are anonymous, same-origin credentials only (`fetch`'s default). The backend applies rate limits and logs requests regardless. If session auth is added later, see the note in `src/core/services/ai/http/http-ai-service.ts`: both the client's `credentials` mode and the backend's CORS `credentials`/origin config must change together, or every cross-origin request breaks with a CORS error.
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

Response (`VoiceTurnResponse`): `{ "transcript": "…", "reply": "…", "audioUrl": "https://…/reply.mp3" }` (`audioUrl` optional — the real backend omits it and the client falls back to browser speech synthesis; see [Realtime voice](#realtime-voice-wsvoice) for the primary, fully-spoken experience).

The browser only requests microphone access in API mode, after the visitor presses the microphone button.

## Realtime voice (`wss://…/ws/voice`)

The primary voice experience — continuous, interruptible, phone-call-style — bypasses the request/response pattern above entirely. `src/features/intelligence/voice/realtime/useRealtimeVoice.ts` opens one WebSocket per call and streams audio both directions for its duration, closing it when the visitor ends the call.

**Connect:** `wss://<backend>/ws/voice?conversationId=<id>` (`VITE_WS_URL`, or auto-derived from `VITE_API_URL` — see `src/core/config/env.ts`).

**Client → server:**
- Binary frames: raw PCM16 mono audio, 16kHz, in ~100ms chunks (captured and resampled by an AudioWorklet — `src/features/intelligence/voice/realtime/pcm-worklet.ts`).
- Text (JSON) control frames: `{ "type": "end" }` (end the call) or `{ "type": "text" }` (send a typed message mid-call).

**Server → client:**
- Binary frames: raw PCM16 mono audio, 24kHz (the model's spoken reply — play immediately for lowest latency).
- Text (JSON) frames:
  ```json
  { "type": "ready" }
  { "type": "transcript", "role": "user" | "assistant", "text": "…", "final": false }
  { "type": "interrupted" }
  { "type": "turn_complete" }
  { "type": "error", "code": "rate_limited", "message": "…" }
  ```

**Interruption (barge-in):** if the visitor starts speaking while the model's reply is still arriving, the server sends `{"type":"interrupted"}`; the client must stop playback and discard any queued audio immediately (`RealtimePlaybackQueue.clear()`), the same way a real phone call works.

The server-side relay (`server/src/ws/voice-gateway.ts`) holds the only Gemini API key and proxies to Google's Live API — the browser never talks to Gemini directly. See the verification caveat in [docs/BACKEND.md](BACKEND.md#️-a-note-on-the-realtime-voice-relay) about this protocol's provenance.

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
