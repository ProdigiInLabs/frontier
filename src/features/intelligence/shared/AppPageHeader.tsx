import type { ReactNode } from 'react';
import styles from './AppPageHeader.module.css';

interface Props {
  /** Shown as "Prodigi Intelligence · {eyebrow}". */
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  /** Compact header for full-height app views (chat). */
  compact?: boolean;
  id?: string;
}

/** The single h1 of an application page, with product eyebrow and status badges. */
export function AppPageHeader({ eyebrow, title, lead, badges, actions, compact = false, id }: Props) {
  return (
    <header className={styles.header} data-compact={compact}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          <span>Prodigi Intelligence</span>
          <span aria-hidden="true" className={styles.sep}>
            ·
          </span>
          <span className={styles.section}>{eyebrow}</span>
        </p>
        <div className={styles.titleRow}>
          <h1 id={id} className={styles.title}>
            {title}
          </h1>
          {badges && <div className={styles.badges}>{badges}</div>}
        </div>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
