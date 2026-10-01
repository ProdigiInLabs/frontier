import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { gemini } from '../providers/gemini/client.js';
import { env } from '../config/env.js';
import { buildSystemInstruction } from '../knowledge/index.js';
import { Conversation } from '../db/models/conversation.js';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

/**
 * Turn-based voice fallback (record → upload → reply) for clients that
 * aren't using the realtime WebSocket relay (src/ws/voice-gateway.ts). This
 * endpoint returns a text reply only — no synthesized speech — so the
 * frontend falls back to the browser's own speech synthesis. The realtime
 * relay is the primary voice path and does speak its replies.
 */

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const transcriptSchema = z.object({ conversationId: z.string().min(1).max(200), transcript: z.string().min(1).max(2000) });

export const voiceRouter = Router();

async function replyTo(conversationId: string, transcript: string): Promise<string> {
  const response = await gemini.models.generateContent({
    model: env.GEMINI_TEXT_MODEL,
    contents: [{ role: 'user', parts: [{ text: transcript }] }],
    config: {
      systemInstruction: `${buildSystemInstruction()}\n\nThis is a voice turn — keep the reply to 1-3 short spoken sentences.`,
      temperature: 0.4,
      maxOutputTokens: 200,
    },
  });
  const reply = response.text?.trim();
  if (!reply) throw new AppError('bad_response', 502, 'Empty response from model.');

  await Conversation.updateOne(
    { conversationId },
    {
      $push: { messages: { $each: [{ role: 'user', text: transcript, at: new Date() }, { role: 'assistant', text: reply, at: new Date() }] } },
      $setOnInsert: { channel: 'voice-turn' },
    },
    { upsert: true },
  ).catch((error: unknown) => logger.error({ err: error, conversationId }, 'Failed to persist voice turn'));

  return reply;
}

voiceRouter.post('/voice', upload.single('audio'), async (req, res, next) => {
  try {
    // JSON body: { conversationId, transcript } — client already has text (e.g. demo-style input).
    if (req.is('application/json')) {
      const parsed = transcriptSchema.safeParse(req.body);
      if (!parsed.success) return next(AppError.badRequest('Invalid voice request.'));
      const reply = await replyTo(parsed.data.conversationId, parsed.data.transcript);
      return res.json({ transcript: parsed.data.transcript, reply });
    }

    // multipart/form-data: { conversationId, audio } — transcribe via Gemini audio understanding first.
    const conversationId = typeof req.body?.conversationId === 'string' ? req.body.conversationId : '';
    if (!conversationId || !req.file) return next(AppError.badRequest('A conversationId and an audio file are required.'));

    const mimeType = req.file.mimetype.split(';')[0] || 'audio/webm';
    const sttResponse = await gemini.models.generateContent({
      model: env.GEMINI_TEXT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ inlineData: { data: req.file.buffer.toString('base64'), mimeType } }, { text: 'Transcribe exactly what was said. Reply with only the transcript, nothing else.' }],
        },
      ],
      config: { temperature: 0, maxOutputTokens: 300 },
    });
    const transcript = sttResponse.text?.trim();
    if (!transcript) return next(new AppError('bad_response', 502, 'Could not transcribe the recording.'));

    const reply = await replyTo(conversationId, transcript);
    res.json({ transcript, reply });
  } catch (error) {
    next(AppError.fromUnknown(error));
  }
});
