/**
 * AI service contracts.
 *
 *   UI → aiClient → AIService (interface) → adapter (demo | http) → backend
 *
 * The UI depends only on these types. A backend implementing
 * POST /api/ai/{chat,agent,search,voice} with these shapes can replace the
 * demo engine without UI changes — whichever model provider (Claude, OpenAI,
 * Gemini, Azure AI, …) it uses. Provider keys live on that backend only.
 */

export type AIMode = 'demo' | 'api';

export interface CallOptions {
  signal?: AbortSignal;
}

// ---------- Chat ----------
export type ChatRole = 'user' | 'assistant';

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface Source {
  id: string;
  title: string;
  /** Site-relative path or absolute URL. */
  url: string;
  snippet?: string;
}

export interface ChatRequest {
  conversationId: string;
  messages: ChatTurn[];
}

export type ChatStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'sources'; sources: Source[] }
  | { type: 'follow_ups'; suggestions: string[] }
  | { type: 'done' };

// ---------- Agents ----------
export type AgentGoal = 'research' | 'analyze' | 'find' | 'documents' | 'automate' | 'connect';

export type AgentStepKind = 'understand' | 'plan' | 'tools' | 'retrieve' | 'reason' | 'generate' | 'complete';

export interface AgentStep {
  id: string;
  kind: AgentStepKind;
  title: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: string;
}

export interface AgentResult {
  title: string;
  summary: string;
  sections: { heading: string; items: string[] }[];
  nextActions: string[];
}

export interface AgentRequest {
  goal: AgentGoal;
  instructions?: string;
}

export type AgentEvent =
  | { type: 'plan'; steps: AgentStep[] }
  | { type: 'step_started'; stepId: string }
  | { type: 'log'; stepId: string; message: string; tool?: ToolCall }
  | { type: 'step_completed'; stepId: string; durationMs: number }
  | { type: 'result'; result: AgentResult };

// ---------- Search ----------
export interface SearchRequest {
  query: string;
  category?: string;
  limit?: number;
}

export interface SearchHit {
  id: string;
  title: string;
  url: string;
  category: string;
  snippet: string;
  /** Relevance normalised to 0–1. */
  score: number;
  matchedTerms: string[];
}

export interface SearchResponse {
  query: string;
  answer: { text: string; citations: string[] } | null;
  hits: SearchHit[];
  categories: string[];
  tookMs: number;
}

// ---------- Voice ----------
export interface VoiceTurnRequest {
  conversationId: string;
  /** Recorded audio (API mode). */
  audio?: Blob;
  /** Text transcript (demo mode, or client-side speech recognition). */
  transcript?: string;
}

export interface VoiceTurnResponse {
  transcript: string;
  reply: string;
  /** Synthesized reply audio, when the backend provides it. */
  audioUrl?: string;
}

// ---------- Service ----------
export interface AIService {
  readonly mode: AIMode;
  chat(request: ChatRequest, options?: CallOptions): AsyncIterable<ChatStreamEvent>;
  runAgent(request: AgentRequest, options?: CallOptions): AsyncIterable<AgentEvent>;
  search(request: SearchRequest, options?: CallOptions): Promise<SearchResponse>;
  voiceTurn(request: VoiceTurnRequest, options?: CallOptions): Promise<VoiceTurnResponse>;
}
