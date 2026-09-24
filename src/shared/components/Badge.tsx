import type { ReactNode } from 'react';
import type { Pillar } from '@/content/types';
import styles from './Badge.module.css';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'demo' | 'success' | 'danger' | Pillar;
}) {
  return <span className={[styles.badge, styles[tone]].join(' ')}>{children}</span>;
}
