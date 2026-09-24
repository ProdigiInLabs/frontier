import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { aiClient } from '@/core/services/ai/ai-client';
import { isAbort, userMessage } from '@/core/services/ai/errors';
import type { VoiceTurnRequest } from '@/core/services/ai/types';
import { analytics } from '@/core/services/analytics/analytics-service';
import { Icon } from '@/shared/components/Icon';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { createId } from '@/shared/utils/id';
import { AboutExperience } from '../shared/AboutExperience';
import { AppPage } from '../shared/AppPage';
import { AppPageHeader } from '../shared/AppPageHeader';
import { DemoNotice } from '../shared/DemoNotice';
import { ModeBadge } from '../shared/ModeBadge';
import { LISTEN_MS, MAX_RECORDING_MS, MAX_TYPED_LENGTH, sampleQuestions } from './samples';
import { useSpeechOutput } from './useSpeechOutput';
import { RecorderError, recorderMessages, useVoiceRecorder } from './useVoiceRecorder';
import { VoiceOrb } from './VoiceOrb';
import type { VoiceState } from './VoiceOrb';
import styles from './VoicePage.module.css';

interface Turn {
  id: string;
  transcript: string;
  reply: string;
}

const demo = aiClient.mode === 'demo';

const stateLabel: Record<VoiceState, string> = {
  idle: 'Ready',
  listening: 'Listening',
  processing: 'Processing',
  responding: 'Responding',
  error: 'Something went wrong',
};

export default function VoicePage() {
  const [state, setState] = useState<VoiceState>('idle');
  const [caption, setCaption] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(0);
  const [typed, setTyped] = useState('');
  const [readAloud, setReadAloud] = useState(!demo);

  const reduceMotion = usePrefersReducedMotion();
  const recorder = useVoiceRecorder();
  const speech = useSpeechOutput();

  const tokenRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const conversationRef = useRef<string | null>(null);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  /** Stops whatever is in flight and returns to idle. */
  const cancel = useCallback(() => {
    tokenRef.current += 1;
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    controllerRef.current?.abort();
    controllerRef.current = null;
    recorder.cancel();
    speech.stop();
    setCaption('');
    setState('idle');
  }, [recorder, speech]);

  useEffect(() => {
    const timers = timersRef;
    const controllers = controllerRef;
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      controllers.current?.abort();
    };
  }, []);

  const active = state === 'listening' || state === 'processing' || state === 'responding';

  // Escape cancels an active turn.
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, cancel]);

  const fail = (message: string) => {
    clearTimers();
    setCaption('');
    setError(message);
    setState('error');
  };

  const process = async (token: number, input: Pick<VoiceTurnRequest, 'audio' | 'transcript'>) => {
    setState('processing');
    const controller = new AbortController();
    controllerRef.current = controller;
    conversationRef.current ??= createId('voice');
    try {
      const response = await aiClient.voiceTurn({ conversationId: conversationRef.current, ...input }, { signal: controller.signal });
      if (tokenRef.current !== token) return;
      const transcript = response.transcript || input.transcript || '';
      setTurns((list) => [...list, { id: createId('turn'), transcript, reply: response.reply }]);
      setCaption(response.reply);
      setState('responding');
      if (readAloud) await speech.speak(response.reply, response.audioUrl);
      else await new Promise<void>((resolve) => later(resolve, reduceMotion ? 600 : 2400));
      if (tokenRef.current === token) {
        setCaption('');
        setState('idle');
      }
    } catch (caught) {
      if (tokenRef.current !== token || isAbort(caught)) return;
      fail(userMessage(caught));
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };

  /** Demo: simulate hearing the chosen question, then send its transcript. */
  const simulate = (text: string, source: 'sample' | 'typed') => {
    const token = ++tokenRef.current;
    clearTimers();
    speech.stop();
    setError('');
    analytics.track('voice_session', { mode: aiClient.mode, source });
    if (reduceMotion) {
      setCaption(text);
      void process(token, { transcript: text });
      return;
    }
    setState('listening');
    setCaption('');
    const words = text.split(/\s+/);
    const step = LISTEN_MS / words.length;
    words.forEach((_, index) => later(() => setCaption(words.slice(0, index + 1).join(' ')), step * (index + 1)));
    later(() => void process(token, { transcript: text }), LISTEN_MS + 200);
  };

  /** API mode: first press records, second press sends. */
  const record = async () => {
    if (state === 'listening') {
      const token = tokenRef.current;
      clearTimers();
      try {
        const audio = await recorder.stop();
        if (tokenRef.current === token) void process(token, { audio });
      } catch {
        if (tokenRef.current === token) fail(recorderMessages.unavailable);
      }
      return;
    }
    const token = ++tokenRef.current;
    speech.stop();
    setError('');
    setCaption('');
    try {
      await recorder.start();
      if (tokenRef.current !== token) return recorder.cancel();
      analytics.track('voice_session', { mode: aiClient.mode, source: 'microphone' });
      setState('listening');
      later(() => void record(), MAX_RECORDING_MS);
    } catch (caught) {
      if (tokenRef.current !== token) return;
      fail(caught instanceof RecorderError ? recorderMessages[caught.reason] : recorderMessages.unavailable);
    }
  };

  const typedText = typed.trim();
  const question = typedText || sampleQuestions[selected] || sampleQuestions[0];

  const onMic = () => {
    if (demo) {
      if (active) cancel();
      else simulate(question, typedText ? 'typed' : 'sample');
      return;
    }
    if (state === 'processing' || state === 'responding') cancel();
    else void record();
  };

  const onTypedSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!active && typedText) simulate(typedText, 'typed');
  };

  const micLabel = demo
    ? active
      ? 'Cancel'
      : 'Ask the selected question (simulated voice)'
    : state === 'listening'
      ? 'Stop recording and send'
      : state === 'processing' || state === 'responding'
        ? 'Cancel'
        : 'Start talking';

  const liveText =
    state === 'idle'
      ? ''
      : state === 'listening'
        ? 'Listening…'
        : state === 'processing'
          ? 'Processing your question…'
          : state === 'responding'
            ? `Prodigi Intelligence: ${caption}`
            : error;

  const showReadAloud = !demo || speech.synthesisSupported;

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Voice"
        title="Talk to Prodigi Intelligence"
        lead="A voice interface for support lines, appointments and lead qualification: it listens, understands, answers and speaks back."
        badges={<ModeBadge />}
      />

      <DemoNotice>No microphone access. Spoken input is simulated with sample questions.</DemoNotice>

      <div className={styles.layout}>
        <section className={styles.stage} aria-labelledby="voice-stage-heading">
          <h2 id="voice-stage-heading" className="sr-only">
            Voice assistant
          </h2>
          <VoiceOrb state={state} />

          <div className={styles.state}>
            <p className={styles.stateLabel} data-state={state}>
              <span className={styles.stateDot} aria-hidden="true" />
              {stateLabel[state]}
            </p>
            <p className={styles.caption} data-state={state}>
              {state === 'error' ? error : caption || (state === 'idle' ? (demo ? `“${question}”` : 'Press the microphone and speak.') : ' ')}
            </p>
          </div>

          <button
            type="button"
            className={styles.mic}
            data-state={state}
            aria-pressed={state === 'listening' || state === 'processing'}
            aria-label={micLabel}
            onClick={onMic}
          >
            <Icon name={active ? 'stop' : 'mic'} size={26} />
          </button>
          <p className={styles.hint}>{active ? 'Press Escape to cancel.' : demo ? 'Press the microphone to ask the selected question.' : 'Press once to start, again to send.'}</p>

          <p role="status" aria-live="polite" className="sr-only">
            {liveText}
          </p>
        </section>

        <div className={styles.side}>
          {demo && (
            <section className={styles.panel} aria-labelledby="voice-say-heading">
              <h2 id="voice-say-heading" className={styles.panelTitle}>
                What to say
              </h2>
              <ul className={styles.samples}>
                {sampleQuestions.map((sample, index) => {
                  const pressed = !typedText && selected === index;
                  return (
                    <li key={sample}>
                      <button
                        type="button"
                        className={styles.sample}
                        aria-pressed={pressed}
                        disabled={active}
                        onClick={() => {
                          setSelected(index);
                          setTyped('');
                        }}
                      >
                        <Icon name={pressed ? 'check' : 'voice'} size={16} />
                        <span>{sample}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <form className={styles.typed} onSubmit={onTypedSubmit}>
                <label htmlFor="voice-typed" className={styles.typedLabel}>
                  Or type what you would say
                </label>
                <div className={styles.typedRow}>
                  <input
                    id="voice-typed"
                    className={styles.typedInput}
                    value={typed}
                    maxLength={MAX_TYPED_LENGTH}
                    disabled={active}
                    placeholder="e.g. Can AI answer our support calls?"
                    onChange={(event) => setTyped(event.target.value)}
                  />
                  <button type="submit" className={styles.typedSend} disabled={active || !typedText} aria-label="Ask this question">
                    <Icon name="send" size={18} />
                  </button>
                </div>
              </form>
            </section>
          )}

          {showReadAloud && (
            <label className={styles.toggle}>
              <input type="checkbox" role="switch" checked={readAloud} onChange={(event) => setReadAloud(event.target.checked)} />
              <span className={styles.switch} aria-hidden="true" />
              <span>
                Read replies aloud
                <span className={styles.toggleHint}>{demo ? 'Uses your browser’s built-in speech.' : 'Plays the spoken reply when one is returned.'}</span>
              </span>
            </label>
          )}

          <section className={styles.panel} aria-labelledby="voice-transcript-heading">
            <h2 id="voice-transcript-heading" className={styles.panelTitle}>
              Transcript
            </h2>
            {turns.length === 0 ? (
              <p className={styles.emptyTranscript}>Your conversation appears here.</p>
            ) : (
              <ol className={styles.turns}>
                {turns.map((turn) => (
                  <li key={turn.id} className={styles.turn}>
                    <p className={styles.you}>
                      <span className={styles.speaker}>You</span>
                      {turn.transcript}
                    </p>
                    <p className={styles.reply}>
                      <span className={styles.speaker}>Prodigi Intelligence</span>
                      {turn.reply}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <AboutExperience
        path="/intelligence/voice"
        intro="The interface shows each stage of a voice turn — listening, processing and responding. With a backend connected, it records audio and plays the spoken reply; in demo mode it never touches the microphone."
        links={[
          { label: 'Prodigi Intelligence', to: '/intelligence' },
          { label: 'Integrations', to: '/intelligence/integrations' },
        ]}
        cta={{ label: 'Talk to Prodigi about AI voice', to: '/contact?topic=integrate-ai' }}
      />
    </AppPage>
  );
}
