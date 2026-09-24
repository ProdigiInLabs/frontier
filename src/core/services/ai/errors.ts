export type AIErrorCode = 'network' | 'timeout' | 'rate_limited' | 'unavailable' | 'bad_request' | 'bad_response' | 'aborted' | 'unknown';

/** Normalized error. `code` is for logic; UI only ever shows `userMessage`. */
export class AIError extends Error {
  readonly code: AIErrorCode;
  constructor(code: AIErrorCode, message: string = code) {
    super(message);
    this.name = 'AIError';
    this.code = code;
  }
}

const messages: Record<AIErrorCode, string> = {
  network: 'We couldn’t reach Prodigi Intelligence. Check your connection and try again.',
  timeout: 'That took longer than expected. Please try again.',
  rate_limited: 'Prodigi Intelligence is busy right now. Please try again in a moment.',
  unavailable: 'Prodigi Intelligence is temporarily unavailable. Please try again shortly.',
  bad_request: 'That request couldn’t be processed. Try rephrasing it.',
  bad_response: 'Something went wrong. Please try again.',
  aborted: 'Stopped.',
  unknown: 'Something went wrong. Please try again.',
};

export function userMessage(error: unknown): string {
  return messages[toAIError(error).code];
}

export function toAIError(error: unknown): AIError {
  if (error instanceof AIError) return error;
  if (error instanceof DOMException && error.name === 'AbortError') return new AIError('aborted');
  if (error instanceof DOMException && error.name === 'TimeoutError') return new AIError('timeout');
  if (error instanceof TypeError) return new AIError('network');
  return new AIError('unknown');
}

export const isAbort = (error: unknown) => toAIError(error).code === 'aborted';
