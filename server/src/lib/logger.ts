import { createRequire } from 'node:module';
import pino from 'pino';
import { env, isProduction } from '../config/env.js';

const require = createRequire(import.meta.url);

/**
 * Pretty-printing is a local dev convenience only, and must never be able to
 * crash the process in production. `pino-pretty` is a devDependency — a
 * production image built with `npm ci --omit=dev` won't have it — so this
 * checks it actually resolves before asking pino to use it, rather than
 * trusting NODE_ENV alone. (A real deploy crashed exactly this way: pino's
 * worker-thread transport throws synchronously, at import time, the moment
 * the target module can't be found — see git history for the incident.)
 */
function prettyTransportAvailable(): boolean {
  if (isProduction || env.NODE_ENV === 'test') return false;
  try {
    require.resolve('pino-pretty');
    return true;
  } catch {
    return false;
  }
}

/** Structured logging. Pretty-printed locally when available, plain JSON otherwise. */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport: prettyTransportAvailable() ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } : undefined,
});
