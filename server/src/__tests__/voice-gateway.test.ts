import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { WebSocket, WebSocketServer } from 'ws';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Callbacks = {
  onopen?: () => void;
  onmessage: (message: { serverContent?: Record<string, unknown>; data?: string }) => void;
  onerror?: (event: { message: string }) => void;
  onclose?: () => void;
};

const sendRealtimeInput = vi.fn();
const sendClientContent = vi.fn();
const closeSession = vi.fn();
let lastCallbacks: Callbacks | null = null;
let connectShouldFail = false;
/** Mirrors real latency: the upstream handshake never resolves within the same tick. */
const CONNECT_DELAY_MS = 15;

vi.mock('../providers/gemini/client.js', () => ({
  gemini: {
    live: {
      connect: vi.fn(async (params: { callbacks: Callbacks }) => {
        await new Promise((resolve) => setTimeout(resolve, CONNECT_DELAY_MS));
        if (connectShouldFail) throw new Error('boom');
        lastCallbacks = params.callbacks;
        params.callbacks.onopen?.();
        return { sendRealtimeInput, sendClientContent, close: closeSession };
      }),
    },
  },
}));

const persist = vi.fn().mockResolvedValue(undefined);
vi.mock('../db/models/conversation.js', () => ({ Conversation: { updateOne: (...args: unknown[]) => persist(...args) } }));

const { registerVoiceGateway, _resetActiveSessionsForTests } = await import('../ws/voice-gateway.js');

function waitFor<T>(emitter: WebSocket, event: string): Promise<T> {
  return new Promise((resolve) => emitter.once(event, (data: T) => resolve(data)));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface TestClient {
  ws: WebSocket;
  /**
   * Reads messages in arrival order, queued from the moment the socket was
   * constructed — not from whenever a test happens to call this. The server
   * can reply before a test's `await open` even resolves (e.g. the
   * over-capacity rejection, sent synchronously), so a plain `.once('message')`
   * attached after the fact can miss it forever.
   */
  nextMessage: () => Promise<Buffer>;
}

describe('voice gateway', () => {
  let server: ReturnType<typeof createServer>;
  let url: string;
  let openClients: WebSocket[];

  const openClient = async (path: string): Promise<TestClient> => {
    const ws = new WebSocket(`${url}${path}`);
    openClients.push(ws);
    const queue: Buffer[] = [];
    const waiters: ((data: Buffer) => void)[] = [];
    ws.on('message', (data: Buffer) => {
      const waiter = waiters.shift();
      if (waiter) waiter(data);
      else queue.push(data);
    });
    const nextMessage = () => (queue.length ? Promise.resolve(queue.shift()!) : new Promise<Buffer>((resolve) => waiters.push(resolve)));
    await waitFor(ws, 'open');
    return { ws, nextMessage };
  };

  beforeEach(async () => {
    _resetActiveSessionsForTests();
    connectShouldFail = false;
    lastCallbacks = null;
    openClients = [];
    sendRealtimeInput.mockClear();
    sendClientContent.mockClear();
    closeSession.mockClear();
    persist.mockClear();

    server = createServer();
    const wss = new WebSocketServer({ noServer: true });
    registerVoiceGateway(wss);
    server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    url = `ws://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    for (const client of openClients) client.terminate();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('relays audio, transcripts and turn completion to the browser', async () => {
    const { ws, nextMessage } = await openClient('/ws/voice?conversationId=test-1');
    await nextMessage(); // {"type":"ready"}

    const audio = Buffer.from([1, 2, 3]);
    ws.send(audio, { binary: true });
    await vi.waitFor(() => expect(sendRealtimeInput).toHaveBeenCalledWith({ media: { data: audio.toString('base64'), mimeType: 'audio/pcm;rate=16000' } }));

    const replyAudio = Buffer.from([9, 9]).toString('base64');
    lastCallbacks?.onmessage({ data: replyAudio, serverContent: { outputTranscription: { text: 'Hello there.' } } });
    lastCallbacks?.onmessage({ serverContent: { turnComplete: true } });

    const binaryFrame = await nextMessage();
    expect(binaryFrame.equals(Buffer.from([9, 9]))).toBe(true);
    expect(JSON.parse((await nextMessage()).toString())).toEqual({ type: 'transcript', role: 'assistant', text: 'Hello there.', final: false });
    expect(JSON.parse((await nextMessage()).toString())).toEqual({ type: 'turn_complete' });

    ws.close();
    await vi.waitFor(() =>
      expect(persist).toHaveBeenCalledWith(
        expect.objectContaining({ conversationId: 'test-1' }),
        expect.objectContaining({ $push: { messages: { role: 'assistant', text: 'Hello there.', at: expect.any(Date) } } }),
        expect.anything(),
      ),
    );
  });

  it('clears the client playback queue on interruption', async () => {
    const { nextMessage } = await openClient('/ws/voice?conversationId=test-2');
    await nextMessage(); // ready

    lastCallbacks?.onmessage({ serverContent: { interrupted: true } });
    expect(JSON.parse((await nextMessage()).toString())).toEqual({ type: 'interrupted' });
  });

  it('rejects connections once MAX_VOICE_SESSIONS concurrent sessions are open', async () => {
    const clients = await Promise.all(Array.from({ length: 4 }, (_, i) => openClient(`/ws/voice?conversationId=session-${i}`)));
    for (const client of clients) await client.nextMessage();

    const overflow = await openClient('/ws/voice?conversationId=overflow');
    const message = await overflow.nextMessage();
    expect(JSON.parse(message.toString())).toMatchObject({ type: 'error', code: 'rate_limited' });
    await waitFor(overflow.ws, 'close');
  });

  it('closes the newly created session if the client disconnects mid-handshake', async () => {
    const { ws } = await openClient('/ws/voice?conversationId=early-close');
    ws.close(); // server-side connect() is still pending (CONNECT_DELAY_MS)
    await sleep(CONNECT_DELAY_MS + 25);
    expect(closeSession).toHaveBeenCalled();
  });

  it('sends an unavailable error and closes if the upstream connection fails', async () => {
    connectShouldFail = true;
    const { nextMessage } = await openClient('/ws/voice?conversationId=fails');
    const message = await nextMessage();
    expect(JSON.parse(message.toString())).toMatchObject({ type: 'error', code: 'unavailable' });
  });
});
