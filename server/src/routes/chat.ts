import { Router } from 'express';
import { z } from 'zod';
import { streamChatReply } from '../providers/gemini/chat.js';
import { Conversation } from '../db/models/conversation.js';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

const bodySchema = z.object({
  conversationId: z.string().min(1).max(200),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(50),
});

export const chatRouter = Router();

chatRouter.post('/chat', async (req, res, next) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return next(AppError.badRequest('Invalid chat request.'));
  const { conversationId, messages } = parsed.data;

  // Headers are set lazily, only once the first event is ready to write. If
  // the model call fails before producing anything, the response stays
  // plain JSON (via the shared error handler) instead of inheriting an
  // NDJSON content-type it never actually streamed.
  const beginStream = () => {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
  };

  let assistantText = '';
  try {
    for await (const event of streamChatReply(messages)) {
      if (!res.headersSent) beginStream();
      if (event.type === 'delta') assistantText += event.text;
      res.write(`${JSON.stringify(event)}\n`);
    }
    res.end();
  } catch (error) {
    const appError = AppError.fromUnknown(error);
    logger.error({ err: appError.detail ?? appError, conversationId }, 'Chat stream failed');
    // Once bytes are already flushed we can't switch to a JSON error
    // response, so emit an NDJSON error event the client's reader understands.
    if (!res.headersSent) return next(appError);
    res.write(`${JSON.stringify({ type: 'error', code: appError.code })}\n`);
    res.end();
    return;
  }

  const latestUser = messages.at(-1);
  await Conversation.updateOne(
    { conversationId },
    {
      $push: {
        messages: {
          $each: [
            ...(latestUser ? [{ role: 'user', text: latestUser.content, at: new Date() }] : []),
            { role: 'assistant', text: assistantText, at: new Date() },
          ],
        },
      },
      $setOnInsert: { channel: 'chat' },
    },
    { upsert: true },
  ).catch((error: unknown) => logger.error({ err: error, conversationId }, 'Failed to persist chat turn'));
});
