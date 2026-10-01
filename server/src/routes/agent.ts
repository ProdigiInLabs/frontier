import { Router } from 'express';
import { z } from 'zod';
import { runAgent } from '../providers/gemini/agent.js';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

const bodySchema = z.object({
  goal: z.enum(['research', 'analyze', 'find', 'documents', 'automate', 'connect']),
  instructions: z.string().max(2000).optional().default(''),
});

export const agentRouter = Router();

agentRouter.post('/agent', async (req, res, next) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return next(AppError.badRequest('Invalid agent request.'));
  const { goal, instructions } = parsed.data;

  // Headers are set lazily (see chat.ts for why): only once the first event
  // actually arrives, so a failure before that leaves a clean JSON error.
  const beginStream = () => {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
  };

  try {
    for await (const event of runAgent(goal, instructions)) {
      if (!res.headersSent) beginStream();
      res.write(`${JSON.stringify(event)}\n`);
    }
    res.end();
  } catch (error) {
    const appError = AppError.fromUnknown(error);
    logger.error({ err: appError.detail ?? appError, goal }, 'Agent run failed');
    if (!res.headersSent) return next(appError);
    res.write(`${JSON.stringify({ type: 'error', code: appError.code })}\n`);
    res.end();
  }
});
