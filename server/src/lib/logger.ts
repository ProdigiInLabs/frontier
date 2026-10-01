import pino from 'pino';
import { env, isProduction } from '../config/env.js';

/** Structured logging. Pretty-printed locally, JSON in production (what Render expects). */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport: isProduction || env.NODE_ENV === 'test' ? undefined : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
});
