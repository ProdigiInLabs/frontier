import type { ReactNode } from 'react';
import { aiClient } from '@/core/services/ai/ai-client';
import { Badge } from '@/shared/components/Badge';
import styles from './DemoNotice.module.css';

/** Small, honest disclosure of what demo mode does. Renders nothing in API mode unless `always`. */
export function DemoNotice({ children, label = 'Demo mode', always = false, compact = false }: { children: ReactNode; label?: string; always?: boolean; compact?: boolean }) {
  if (aiClient.mode !== 'demo' && !always) return null;
  return (
    <p className={styles.notice} data-compact={compact}>
      <Badge tone="demo">{label}</Badge>
      <span>{children}</span>
    </p>
  );
}
