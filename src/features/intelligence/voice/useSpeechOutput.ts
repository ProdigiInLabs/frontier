import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

const noop = () => () => {};
const detect = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** Speaks replies: backend audio when provided, otherwise the browser's speech synthesis. */
export function useSpeechOutput() {
  const synthesisSupported = useSyncExternalStore(noop, detect, () => false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (detect()) window.speechSynthesis.cancel();
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const speak = useCallback(
    (text: string, audioUrl?: string) =>
      new Promise<void>((resolve) => {
        stop();
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
          return;
        }
        if (!detect()) return resolve();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = document.documentElement.lang || 'en';
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      }),
    [stop],
  );

  return { synthesisSupported, speak, stop };
}
