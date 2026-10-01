import { useCallback, useEffect, useRef, useState } from 'react';
import { config } from '@/core/config/env';
import { createId } from '@/shared/utils/id';
import { MicCapture, MicError, isRealtimeVoiceSupported } from './mic-capture';
import { RealtimePlaybackQueue } from './playback-queue';
import { isServerMessage } from './protocol';

export type CallState = 'idle' | 'connecting' | 'listening' | 'responding' | 'error';

export interface RealtimeTranscriptEvent {
  role: 'user' | 'assistant';
  text: string;
  final: boolean;
}

const friendlyMicError: Record<MicError['reason'], string> = {
  unsupported: 'This browser can’t stream microphone audio. Try a recent version of Chrome, Edge or Firefox.',
  denied: 'Microphone access is blocked. Allow microphone access for this site, then try again.',
  unavailable: 'The microphone couldn’t be started. Check that one is connected and not in use elsewhere.',
};

/** Server error codes (see server/src/lib/app-error.ts) mapped to visitor-facing text. */
const serverErrorMessage: Record<string, string> = {
  rate_limited: 'Prodigi Intelligence is busy right now. Please try again in a moment.',
  unavailable: 'Prodigi Intelligence is temporarily unavailable. Please try again shortly.',
  bad_request: 'That request couldn’t be processed.',
};

/**
 * Realtime, interruptible voice: opens the WebSocket relay, streams the
 * microphone continuously, and plays back model audio as it arrives — with
 * barge-in (speaking again stops the model's playback immediately, same as
 * a phone call). Only used outside demo mode, when config.realtimeVoiceUrl
 * is set; see VoicePage for the fallback ladder.
 */
export function useRealtimeVoice() {
  const [state, setState] = useState<CallState>('idle');
  const [error, setError] = useState('');
  const [userCaption, setUserCaption] = useState('');
  const [assistantCaption, setAssistantCaption] = useState('');

  const socketRef = useRef<WebSocket | null>(null);
  const micRef = useRef<MicCapture | null>(null);
  const playbackRef = useRef<RealtimePlaybackQueue | null>(null);
  const conversationIdRef = useRef<string>(createId('voice'));
  const endedByUserRef = useRef(false);
  const failedRef = useRef(false);
  /** Set via onTranscriptEvent; not component state, since it only drives an external list, not this hook's own render. */
  const transcriptListenerRef = useRef<((event: RealtimeTranscriptEvent) => void) | null>(null);

  const supported = isRealtimeVoiceSupported();

  const teardown = useCallback(() => {
    micRef.current?.stop();
    micRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
    void playbackRef.current?.close();
    playbackRef.current = null;
  }, []);

  useEffect(() => teardown, [teardown]);

  const fail = useCallback(
    (message: string) => {
      failedRef.current = true;
      teardown();
      setError(message);
      setState('error');
    },
    [teardown],
  );

  const start = useCallback(async () => {
    if (!supported) return fail(friendlyMicError.unsupported);
    if (!config.realtimeVoiceUrl) return fail('Voice isn’t configured for this environment.');

    endedByUserRef.current = false;
    failedRef.current = false;
    setError('');
    setUserCaption('');
    setAssistantCaption('');
    setState('connecting');

    const playback = new RealtimePlaybackQueue();
    playbackRef.current = playback;
    await playback.resume().catch(() => {});

    const url = `${config.realtimeVoiceUrl}?conversationId=${encodeURIComponent(conversationIdRef.current)}`;
    const socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';
    socketRef.current = socket;

    socket.onmessage = (event: MessageEvent<ArrayBuffer | string>) => {
      if (event.data instanceof ArrayBuffer) {
        playback.enqueue(event.data);
        setState('responding');
        return;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!isServerMessage(parsed)) return;

      if (parsed.type === 'error') {
        fail(serverErrorMessage[parsed.code] ?? 'Something went wrong. Please try again.');
        return;
      }
      if (parsed.type === 'ready') {
        setState('listening');
        return;
      }
      if (parsed.type === 'transcript') {
        if (parsed.role === 'user') setUserCaption((current) => (parsed.final ? '' : current + parsed.text));
        else setAssistantCaption((current) => current + parsed.text);
        transcriptListenerRef.current?.({ role: parsed.role, text: parsed.text, final: parsed.final });
        return;
      }
      if (parsed.type === 'interrupted') {
        playback.clear();
        setAssistantCaption('');
        setState('listening');
        return;
      }
      if (parsed.type === 'turn_complete') {
        setState('listening');
      }
    };

    socket.onerror = () => {
      if (!endedByUserRef.current && !failedRef.current) fail('We couldn’t reach Prodigi Intelligence. Check your connection and try again.');
    };
    socket.onclose = () => {
      if (!endedByUserRef.current && !failedRef.current) fail('The voice session ended unexpectedly. Please try again.');
    };

    try {
      const mic = new MicCapture();
      micRef.current = mic;
      await mic.start((chunk) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(chunk);
      });
      setState('listening');
    } catch (micError) {
      const reason = micError instanceof MicError ? micError.reason : 'unavailable';
      fail(friendlyMicError[reason]);
    }
  }, [fail, supported]);

  const stop = useCallback(() => {
    endedByUserRef.current = true;
    try {
      socketRef.current?.send(JSON.stringify({ type: 'end' }));
    } catch {
      /* socket already closing */
    }
    teardown();
    setState('idle');
    setUserCaption('');
    setAssistantCaption('');
  }, [teardown]);

  const onTranscriptEvent = useCallback((listener: ((event: RealtimeTranscriptEvent) => void) | null) => {
    transcriptListenerRef.current = listener;
  }, []);

  return { supported, state, error, userCaption, assistantCaption, start, stop, onTranscriptEvent };
}
