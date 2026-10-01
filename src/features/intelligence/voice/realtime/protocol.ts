/** Wire protocol for the realtime voice relay (wss://…/ws/voice). Mirrors server/src/ws/voice-gateway.ts. */
export type ServerMessage =
  | { type: 'ready' }
  | { type: 'transcript'; role: 'user' | 'assistant'; text: string; final: boolean }
  | { type: 'interrupted' }
  | { type: 'turn_complete' }
  | { type: 'error'; code: string; message?: string };

export type ClientMessage = { type: 'end' } | { type: 'text'; text: string };

export function isServerMessage(value: unknown): value is ServerMessage {
  return typeof value === 'object' && value !== null && typeof (value as { type?: unknown }).type === 'string';
}
