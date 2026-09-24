import styles from './Logo.module.css';

interface LogoProps {
  /** Show the Product · Digital · Intelligence descriptor. */
  descriptor?: boolean;
  className?: string;
}

/**
 * The Prodigi mark: three nodes — Product, Digital, Intelligence — joined by
 * one continuous line. The wordmark is live text for crispness and SEO.
 */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.mark}>
      <path d="M4 18 L12 6 L20 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="18" r="2.6" className={styles.product} />
      <circle cx="12" cy="6" r="2.6" className={styles.digital} />
      <circle cx="20" cy="18" r="2.6" className={styles.intelligence} />
    </svg>
  );
}

export function Logo({ descriptor = false, className }: LogoProps) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(' ')}>
      <LogoMark />
      <span className={styles.word}>prodigi</span>
      {descriptor && <span className={styles.descriptor}>Product · Digital · Intelligence</span>}
    </span>
  );
}
