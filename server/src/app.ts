import express from 'express';
import { pinoHttp } from 'pino-http';
import { agentRouter } from './routes/agent.js';
import { chatRouter } from './routes/chat.js';
import { healthRouter } from './routes/health.js';
import { searchRouter } from './routes/search.js';
import { voiceRouter } from './routes/voice.js';
import { corsMiddleware } from './middleware/cors.js';
import { aiRateLimit, searchRateLimit } from './middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { logger } from './lib/logger.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct rate-limit client IPs.

  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/healthz' } }));
  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));

  app.use(healthRouter);
  app.use('/api/ai', aiRateLimit, chatRouter);
  app.use('/api/ai', aiRateLimit, agentRouter);
  app.use('/api/ai', searchRateLimit, searchRouter);
  app.use('/api/ai', aiRateLimit, voiceRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
