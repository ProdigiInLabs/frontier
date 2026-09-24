import { config } from '@/core/config/env';
import { toAIError } from './errors';
import type {
  AgentEvent,
  AgentRequest,
  AIMode,
  AIService,
  CallOptions,
  ChatRequest,
  ChatStreamEvent,
  SearchRequest,
  SearchResponse,
  VoiceTurnRequest,
  VoiceTurnResponse,
} from './types';

let service: Promise<AIService> | undefined;

/**
 * Selects the adapter from configuration. Both adapters are separate chunks:
 * the demo engine is never downloaded in API mode, and neither is downloaded
 * until a visitor opens an AI experience.
 */
function getService(): Promise<AIService> {
  service ??= config.demoMode
    ? import('./demo/demo-ai-service').then((m) => m.createDemoAIService())
    : import('./http/http-ai-service').then((m) => m.createHttpAIService(config.apiUrl));
  return service;
}

async function* stream<T>(factory: (s: AIService) => AsyncIterable<T>): AsyncGenerator<T> {
  try {
    const s = await getService();
    yield* factory(s);
  } catch (error) {
    throw toAIError(error);
  }
}

/** The only entry point UI code uses. All errors are normalized to AIError. */
export const aiClient = {
  mode: (config.demoMode ? 'demo' : 'api') as AIMode,

  chat(request: ChatRequest, options?: CallOptions): AsyncGenerator<ChatStreamEvent> {
    return stream((s) => s.chat(request, options));
  },

  runAgent(request: AgentRequest, options?: CallOptions): AsyncGenerator<AgentEvent> {
    return stream((s) => s.runAgent(request, options));
  },

  async search(request: SearchRequest, options?: CallOptions): Promise<SearchResponse> {
    try {
      return await (await getService()).search(request, options);
    } catch (error) {
      throw toAIError(error);
    }
  },

  async voiceTurn(request: VoiceTurnRequest, options?: CallOptions): Promise<VoiceTurnResponse> {
    try {
      return await (await getService()).voiceTurn(request, options);
    } catch (error) {
      throw toAIError(error);
    }
  },
};
