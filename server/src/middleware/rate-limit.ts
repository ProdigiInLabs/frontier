import rateLimit from 'express-rate-limit';
import { AppError } from '../lib/app-error.js';

function limiter(max: number, windowMs: number) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => next(AppError.rateLimited()),
  });
}

/** Chat/agent calls an LLM per request — the tightest limit, to protect the free tier. */
export const aiRateLimit = limiter(20, 60_000);
/** Search is cheaper (embeddings only) but still bounded. */
export const searchRateLimit = limiter(40, 60_000);
