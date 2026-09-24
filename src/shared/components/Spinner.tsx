import styles from './Spinner.module.css';

export function Spinner({ label }: { label?: string }) {
  return (
    <span className={styles.spinner} role={label ? 'status' : undefined}>
      <span className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
