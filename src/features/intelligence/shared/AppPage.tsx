import type { ReactNode } from 'react';
import styles from './AppPage.module.css';

/** Scrolling application page: max-width workspace with generous padding. */
export function AppPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.page, className].filter(Boolean).join(' ')}>{children}</div>;
}
