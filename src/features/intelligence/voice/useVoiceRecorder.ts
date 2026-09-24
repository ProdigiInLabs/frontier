import { useCallback, useEffect, useRef } from 'react';

/**
 * Minimal microphone capture for API mode (never used in demo mode):
 * getUserMedia + MediaRecorder, returning one Blob per turn.
 */

export type RecorderFailure = 'unsupported' | 'denied' | 'unavailable';

export class RecorderError extends Error {
  readonly reason: RecorderFailure;
  constructor(reason: RecorderFailure) {
    super(reason);
    this.name = 'RecorderError';
    this.reason = reason;
  }
}

export const recorderMessages: Record<RecorderFailure, string> = {
  unsupported: 'This browser can’t record audio. Try a recent version of Chrome, Edge, Firefox or Safari.',
  denied: 'Microphone access is blocked. Allow microphone access for this site in your browser settings, then try again.',
  unavailable: 'The microphone couldn’t be started. Check that one is connected and not in use by another app.',
};

const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

export function isRecordingSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined';
}

export function useVoiceRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    chunksRef.current = [];
    release();
  }, [release]);

  useEffect(() => cancel, [cancel]);

  const start = useCallback(async () => {
    if (!isRecordingSupported()) throw new RecorderError('unsupported');
    cancel();
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      throw new RecorderError(denied ? 'denied' : 'unavailable');
    }
    try {
      const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported?.(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      throw new RecorderError('unavailable');
    }
  }, [cancel]);

  /** Stops recording and resolves with the captured audio. */
  const stop = useCallback(
    () =>
      new Promise<Blob>((resolve, reject) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') return reject(new RecorderError('unavailable'));
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          chunksRef.current = [];
          release();
          if (blob.size === 0) reject(new RecorderError('unavailable'));
          else resolve(blob);
        };
        recorder.stop();
      }),
    [release],
  );

  return { start, stop, cancel };
}
