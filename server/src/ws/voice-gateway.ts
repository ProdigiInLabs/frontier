import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Session } from '@google/genai';
import { Modality } from '@google/genai';
import type { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import { gemini } from '../providers/gemini/client.js';
import { env } from '../config/env.js';
import { buildSystemInstruction } from '../knowledge/index.js';
import { logger } from '../lib/logger.js';
import { Conversation } from '../db/models/conversation.js';

/**
 * Realtime, interruptible voice relay.
 *
 * Browser ──(binary PCM16 16kHz mic frames, JSON control frames)──▶ this gateway
 * this gateway ──(Gemini Live session, server-side API key only)──▶ Gemini
 * Gemini ──(PCM16 24kHz audio deltas + transcripts + interrupt signal)──▶ gateway
 * gateway ──(binary PCM16 24kHz frames, JSON control frames)──▶ browser
 *
 * The Gemini API key never leaves this process. See docs/BACKEND.md for the
 * wire protocol this gateway speaks with the browser.
 *
 * Built against @google/genai's `ai.live.connect()` client, checked against
 * the installed package's own .d.ts (not against live docs, which this
 * environment can't reach — see docs/BACKEND.md's verification note). If
 * Google changes the Live API shape, this file and
 * src/features/intelligence/voice/realtime/useRealtimeVoice.ts on the
 * frontend are the only two places that need updating.
 */

type ClientControl = { type: 'end' } | { type: 'text'; text: string };

const activeSessions = new Set<string>();
const MIC_MIME_TYPE = 'audio/pcm;rate=16000';

/** Test-only seam: process-wide session tracking otherwise leaks between test cases. */
export function _resetActiveSessionsForTests(): void {
  activeSessions.clear();
}

function send(ws: WebSocket, message: object) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}

/**
 * Sends a final message and only closes once it is actually flushed.
 * `ws.close()` called right after `ws.send()` can otherwise race ahead of
 * the write, dropping the message the client needed to see (e.g. why it's
 * being rejected) before the connection drops.
 */
function sendThenClose(ws: WebSocket, message: object) {
  if (ws.readyState !== WebSocket.OPEN) return ws.close();
  ws.send(JSON.stringify(message), () => ws.close());
}

async function persistTurn(conversationId: string, role: 'user' | 'assistant', text: string) {
  if (!text.trim()) return;
  try {
    await Conversation.updateOne(
      { conversationId },
      { $push: { messages: { role, text: text.slice(0, 8000), at: new Date() } }, $setOnInsert: { channel: 'voice-realtime' } },
      { upsert: true },
    );
  } catch (error) {
    logger.error({ err: error, conversationId }, 'Failed to persist voice turn');
  }
}

export function registerVoiceGateway(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    handleConnection(ws, request);
  });
}

function handleConnection(ws: WebSocket, request: IncomingMessage): void {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const conversationId = url.searchParams.get('conversationId') || randomUUID();

  if (activeSessions.size >= env.MAX_VOICE_SESSIONS) {
    logger.warn({ active: activeSessions.size }, 'Voice session limit reached');
    sendThenClose(ws, { type: 'error', code: 'rate_limited', message: 'Too many active voice sessions. Please try again shortly.' });
    return;
  }
  activeSessions.add(conversationId);
  logger.info({ conversationId, active: activeSessions.size }, 'Voice session opening');

  let session: Session | null = null;
  let upstreamReady = false;
  let clientClosed = false;
  let released = false;
  let userBuffer = '';
  let assistantBuffer = '';
  const pendingAudio: Buffer[] = [];

  const release = () => {
    if (released) return;
    released = true;
    activeSessions.delete(conversationId);
    void persistTurn(conversationId, 'user', userBuffer);
    void persistTurn(conversationId, 'assistant', assistantBuffer);
    logger.info({ conversationId, active: activeSessions.size }, 'Voice session closed');
  };

  // Registered immediately (not after the Gemini connect resolves) so no
  // browser message or disconnect is missed while the upstream handshake is
  // still in flight.
  ws.on('message', (data: Buffer, isBinary: boolean) => {
    if (isBinary) {
      if (!session || !upstreamReady) pendingAudio.push(data);
      else session.sendRealtimeInput({ media: { data: data.toString('base64'), mimeType: MIC_MIME_TYPE } });
      return;
    }
    try {
      const control = JSON.parse(data.toString('utf8')) as ClientControl;
      if (!session) return;
      if (control.type === 'end') session.sendRealtimeInput({ audioStreamEnd: true });
      else if (control.type === 'text') session.sendClientContent({ turns: control.text, turnComplete: true });
    } catch {
      // Ignore malformed control frames rather than tearing down the session.
    }
  });

  ws.on('close', () => {
    clientClosed = true;
    session?.close();
    release();
  });
  ws.on('error', (error) => logger.error({ err: error, conversationId }, 'Voice client socket error'));

  gemini.live
    .connect({
      model: env.GEMINI_LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `${buildSystemInstruction()}\n\nYou are speaking with the visitor by voice. Keep replies short and conversational (1-3 sentences) — this is speech, not a document.`,
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: env.GEMINI_VOICE_NAME } } },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          upstreamReady = true;
          for (const chunk of pendingAudio.splice(0)) session?.sendRealtimeInput({ media: { data: chunk.toString('base64'), mimeType: MIC_MIME_TYPE } });
          send(ws, { type: 'ready' });
        },
        onmessage: (message) => {
          const content = message.serverContent;
          if (content?.interrupted) send(ws, { type: 'interrupted' });

          const audioBase64 = message.data;
          if (audioBase64 && ws.readyState === WebSocket.OPEN) ws.send(Buffer.from(audioBase64, 'base64'), { binary: true });

          const inputText = content?.inputTranscription?.text;
          if (inputText) {
            userBuffer += inputText;
            send(ws, { type: 'transcript', role: 'user', text: inputText, final: Boolean(content?.inputTranscription?.finished) });
          }
          const outputText = content?.outputTranscription?.text;
          if (outputText) {
            assistantBuffer += outputText;
            send(ws, { type: 'transcript', role: 'assistant', text: outputText, final: Boolean(content?.outputTranscription?.finished) });
          }
          if (content?.turnComplete) send(ws, { type: 'turn_complete' });
        },
        onerror: (event) => {
          logger.error({ conversationId, message: event.message }, 'Gemini Live error');
          send(ws, { type: 'error', code: 'unavailable' });
        },
        onclose: () => {
          if (ws.readyState === WebSocket.OPEN) ws.close();
          release();
        },
      },
    })
    .then((connected) => {
      session = connected;
      // The browser disconnected while the upstream handshake was in flight.
      if (clientClosed) connected.close();
    })
    .catch((error) => {
      logger.error({ err: error, conversationId }, 'Failed to open Gemini Live session');
      sendThenClose(ws, { type: 'error', code: 'unavailable', message: 'Could not start the voice session.' });
      release();
    });
}
