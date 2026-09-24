import styles from './VoiceOrb.module.css';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'responding' | 'error';

const BARS = 7;

/** Decorative visualizer. State is conveyed in text next to it, never by the orb alone. */
export function VoiceOrb({ state }: { state: VoiceState }) {
  return (
    <div className={styles.orb} data-state={state} aria-hidden="true">
      <span className={styles.ring} />
      <span className={styles.ring} />
      <span className={styles.ring} />
      <span className={styles.arc} />
      <span className={styles.core}>
        {Array.from({ length: BARS }, (_, index) => (
          <span key={index} className={styles.bar} />
        ))}
      </span>
    </div>
  );
}
