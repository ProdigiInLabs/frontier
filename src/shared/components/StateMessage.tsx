import type { ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import styles from './StateMessage.module.css';

/** Shared empty / error / info state. Never renders raw error details. */
export function StateMessage({
  tone = 'empty',
  title,
  children,
  action,
  icon,
}: {
  tone?: 'empty' | 'error' | 'info';
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  icon?: IconName;
}) {
  const iconName: IconName = icon ?? (tone === 'error' ? 'alert' : tone === 'info' ? 'info' : 'sparkle');
  return (
    <div className={[styles.state, styles[tone]].join(' ')} role={tone === 'error' ? 'alert' : undefined}>
      <span className={styles.icon}>
        <Icon name={iconName} size={20} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {children && <div className={styles.body}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
