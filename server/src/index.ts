import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './db/connection.js';
import { logger } from './lib/logger.js';
import { warmSearchIndex } from './providers/gemini/search-index.js';
import { registerVoiceGateway } from './ws/voice-gateway.js';

async function main() {
  await connectDatabase();
  warmSearchIndex();

  const app = createApp();
  const server = createServer(app);

  // The realtime voice relay shares the HTTP server's port (what Render and
  // most single-port PaaS hosts expect) and only upgrades requests to /ws/voice.
  const wss = new WebSocketServer({ noServer: true });
  registerVoiceGateway(wss);
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url ?? '/', 'http://localhost');
    if (pathname !== '/ws/voice') {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
  });

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Prodigi backend listening');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    server.close();
    wss.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((error: unknown) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
