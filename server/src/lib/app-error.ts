/**
 * Mirrors the frontend's AIErrorCode taxonomy (src/core/services/ai/errors.ts)
 * so the same codes carry across the wire. The client maps each code to a
 * user-facing message; the server never sends a raw message, stack trace or
 * provider error body to the client.
 */
export type ErrorCode = 'network' | 'timeout' | 'rate_limited' | 'unavailable' | 'bad_request' | 'bad_response' | 'unknown';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** Internal detail for logs only — never sent to the client. */
  readonly detail?: unknown;

  constructor(code: ErrorCode, status: number, message: string, detail?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.detail = detail;
  }

  static badRequest(message: string): AppError {
    return new AppError('bad_request', 400, message);
  }

  static rateLimited(): AppError {
    return new AppError('rate_limited', 429, 'Rate limit exceeded.');
  }

  /** Wraps an unexpected error (e.g. from the Gemini SDK) without leaking its contents. */
  static fromUnknown(error: unknown): AppError {
    if (error instanceof AppError) return error;
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();
    if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
      return new AppError('rate_limited', 429, 'Upstream rate limit exceeded.', error);
    }
    if (lower.includes('timeout') || lower.includes('deadline')) {
      return new AppError('timeout', 504, 'Upstream request timed out.', error);
    }
    if (lower.includes('fetch failed') || lower.includes('enotfound') || lower.includes('econnrefused')) {
      return new AppError('network', 502, 'Upstream network error.', error);
    }
    if (lower.includes('400') || lower.includes('invalid')) {
      return new AppError('bad_request', 400, 'Invalid request.', error);
    }
    return new AppError('unavailable', 503, 'Service temporarily unavailable.', error);
  }
}
