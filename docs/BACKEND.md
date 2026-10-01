# Backend — real-time AI chat, search, agent and voice

The site ships fully functional with **no backend** (demo mode, the default). This document covers the optional backend in `server/`, which replaces the demo engine with real answers from Google Gemini, grounded in Prodigi's own site content, with MongoDB logging and a true real-time, interruptible voice relay.

```
Browser (prodiginl.com)
  │  POST /api/ai/{chat,agent,search,voice}   (REST, same origin policy via CORS)
  │  wss://…/ws/voice                         (realtime voice relay)
  ▼
server/  (Node.js + Express + ws, hosted separately — e.g. Render)
  │  Google Gemini API (chat, embeddings, Live API for voice)
  │  MongoDB Atlas (free tier) — conversation + search logs
  ▼
```

The frontend and backend are independent packages in one repository (`/` and `/server`), each with their own `package.json`, deployed to different hosts.

## Why these choices

- **Google Gemini.** The only AI provider with a genuinely free API tier (no card required) *and* a realtime, duplex voice API (the Live API) — the combination the voice experience needs. Anthropic's and OpenAI's APIs have no permanent free tier.
- **Free-tier terms, read before you ship this live:** Google's free tier may use prompts/responses to improve its models unless you're on a paid tier. For a company site, read [Google's current terms](https://ai.google.dev/gemini-api/terms) before deciding whether that's acceptable, and move to a paid tier if not.
- **MongoDB Atlas free tier (M0).** 512 MB storage, shared cluster, no cost. Used for conversation transcripts and search logs — operational data, auto-expired after 90 days for search logs (see `server/src/db/models/search-log.ts`).
- **Render free tier.** Deploys straight from this repo on push. The trade-off: the service sleeps after ~15 minutes idle and takes ~30-60s to wake — fine for a showcase, not for guaranteed always-on traffic (upgrade the plan when that matters).

## ⚠️ A note on the realtime voice relay

`server/src/ws/voice-gateway.ts` is built against the official `@google/genai` npm package's own TypeScript definitions (checked directly against the installed package, not against Google's live documentation — this environment's network policy blocks `ai.google.dev`). The SDK surface (`ai.live.connect()`, `Session.sendRealtimeInput()`, `LiveServerMessage`) is real and verified. What is **not independently verified against a live connection** is:

- The exact current **model id** for `GEMINI_LIVE_MODEL` (Google renames/rotates these more often than text models — check [Google AI Studio](https://aistudio.google.com) for the current live-capable model and update the env var if `unavailable` errors appear in the logs).
- The exact runtime **behavior** of transcription and interruption fields under real network conditions.

If something doesn't match, the fix is isolated to two files: `server/src/ws/voice-gateway.ts` (server) and `src/features/intelligence/voice/realtime/` (client protocol in `protocol.ts`). Test it against a real key before relying on it in front of visitors.

## One-time setup

### 1. MongoDB Atlas (free)

1. Create an account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free **M0** cluster (any region close to your Render region).
3. *Database Access* → add a database user with a strong generated password.
4. *Network Access* → add `0.0.0.0/0` (Render's free tier has no static IP; this is the standard trade-off — the database user's password is what protects it, so keep it strong and private).
5. *Connect* → *Drivers* → copy the connection string (`mongodb+srv://<user>:<password>@.../?retryWrites=true&w=majority`). This is `MONGODB_URI`.

### 2. Google Gemini API key (free)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in.
2. Create an API key. This is `GEMINI_API_KEY` — a secret; never commit it or put it in frontend code.
3. Note the current Live-API-capable model name shown in AI Studio's model list (for `GEMINI_LIVE_MODEL`).

### 3. Deploy the backend (Render)

1. Push this repo to GitHub (already done if you're reading this there).
2. In Render: **New +** → **Blueprint** → connect this repo. Render reads `render.yaml` at the repo root and creates the `prodigi-backend` service with `rootDir: server`.
3. Set the two secrets Render will prompt for (`MONGODB_URI`, `GEMINI_API_KEY`) in the service's *Environment* tab.
4. Deploy. Confirm `GET https://<service>.onrender.com/healthz` returns `{"status":"ok","mongo":"connected"}`.

Prefer another host? `server/Dockerfile` is a self-contained, portable build (see `server/docker-compose.yml` for local parity) — any container host that terminates WebSockets on the same port as HTTP will work.

### 4. Point the frontend at it

Set these when building the frontend (see the frontend `README.md` / `.env.example`):

```
VITE_DEMO_MODE=false
VITE_API_URL=https://<service>.onrender.com
```

`VITE_WS_URL` is optional — it auto-derives `wss://<service>.onrender.com/ws/voice` from `VITE_API_URL`.

## Local development

```bash
cd server
cp .env.example .env     # fill in MONGODB_URI and GEMINI_API_KEY
npm install
npm run dev               # http://localhost:8080, auto-reload (tsx watch)
```

Point a local frontend dev server at it: `VITE_DEMO_MODE=false VITE_API_URL=http://localhost:8080 npm run dev` (from the repo root). Note `apiUrl` requires `https://` or `localhost` — see `src/core/config/env.ts`.

## The knowledge base (grounding)

`server/src/knowledge/prodigi-knowledge.json` is **generated from the frontend's own content** (`src/content/*.ts`) and **committed to git** like a lockfile — the server's build never needs the frontend's source tree.

```bash
cd server
npm run sync-knowledge     # regenerate after editing src/content/*.ts
git add src/knowledge/prodigi-knowledge.json
```

CI fails (`npm run check:knowledge`) if this file drifts from the frontend content, so the backend can never say something the website itself doesn't.

## Endpoints

See [docs/AI-API.md](AI-API.md) for the full request/response contract (`POST /api/ai/{chat,agent,search,voice}`) and the `wss://…/ws/voice` realtime protocol.

| Endpoint | What it does for real |
| --- | --- |
| `POST /api/ai/chat` | Semantic search over the knowledge base (Gemini embeddings) → grounded, streamed reply (Gemini `generateContentStream`). |
| `POST /api/ai/agent` | Real tool-calling loop: the model calls `search_prodigi_knowledge` / `list_intelligence_capabilities`, then returns a structured JSON result. No access to any business system — none exist yet, so none is faked. |
| `POST /api/ai/search` | The same embedding search, returned directly as ranked results with a grounded answer above a confidence threshold. |
| `POST /api/ai/voice` | Turn-based fallback: audio → transcript (Gemini audio understanding) → short spoken-style text reply. No synthesized audio — the client falls back to browser speech synthesis. |
| `wss://…/ws/voice` | The primary voice experience: continuous mic streaming, real-time spoken replies, mid-sentence interruption (barge-in), via the Gemini Live API. |

## Operational notes

- **Rate limits** (`server/src/middleware/rate-limit.ts`): 20 req/min for chat/agent/voice, 40 req/min for search, per IP. `MAX_VOICE_SESSIONS` (default 4) caps concurrent realtime voice connections process-wide — tune for your Render plan's memory.
- **Errors never leak internals.** Every response is `{code, message}` from a fixed vocabulary (`server/src/lib/app-error.ts`), matching the frontend's own `AIErrorCode` taxonomy. Stack traces and provider error bodies stay in the server logs only.
- **CORS** is an explicit origin allowlist (`ALLOWED_ORIGINS`) — not a wildcard.
- **Boot behavior:** the process fails fast (non-zero exit, structured log) if `MONGODB_URI` or `GEMINI_API_KEY` is missing/invalid at startup, so a misconfigured deploy is obvious in Render's logs rather than failing confusingly on the first request.
