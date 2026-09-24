import type { ReactNode } from 'react';
import styles from './JsonBlock.module.css';

/** Compact monospace block for tool inputs and sample payloads. Wraps instead of scrolling. */
export function JsonBlock({ value, label, meta }: { value: unknown; label?: ReactNode; meta?: ReactNode }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return (
    <figure className={styles.block}>
      {(label || meta) && (
        <figcaption className={styles.caption}>
          {label && <span>{label}</span>}
          {meta}
        </figcaption>
      )}
      <pre className={styles.pre}>
        <code>{text}</code>
      </pre>
    </figure>
  );
}
