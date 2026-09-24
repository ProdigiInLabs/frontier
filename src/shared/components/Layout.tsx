import type { ElementType, ReactNode } from 'react';
import type { Pillar } from '@/content/types';
import styles from './Layout.module.css';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

export function Container({
  children,
  size = 'default',
  className,
}: {
  children: ReactNode;
  size?: 'default' | 'narrow' | 'wide';
  className?: string;
}) {
  return <div className={cx(styles.container, size !== 'default' && styles[size], className)}>{children}</div>;
}

interface SectionProps {
  children: ReactNode;
  id?: string;
  tone?: 'default' | 'sunken' | 'inverse';
  spacing?: 'default' | 'compact' | 'none';
  labelledBy?: string;
  className?: string;
  as?: ElementType;
}

/** Page section. Pass `labelledBy` with the id of its heading for landmark naming. */
export function Section({ children, id, tone = 'default', spacing = 'default', labelledBy, className, as: Tag = 'section' }: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cx(styles.section, tone !== 'default' && styles[tone], spacing !== 'default' && styles[`spacing-${spacing}`], className)}
      {...(tone === 'inverse' ? { 'data-theme': 'dark' } : {})}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, pillar, as: Tag = 'p' }: { children: ReactNode; pillar?: Pillar; as?: ElementType }) {
  return (
    <Tag className={styles.eyebrow} data-pillar={pillar}>
      {pillar && <span className={styles.eyebrowDot} aria-hidden="true" />}
      {children}
    </Tag>
  );
}

interface SectionHeaderProps {
  id?: string;
  eyebrow?: ReactNode;
  pillar?: Pillar;
  title: ReactNode;
  lead?: ReactNode;
  level?: 'h1' | 'h2' | 'h3';
  align?: 'start' | 'center';
  actions?: ReactNode;
  size?: 'default' | 'large';
}

export function SectionHeader({
  id,
  eyebrow,
  pillar,
  title,
  lead,
  level: Heading = 'h2',
  align = 'start',
  actions,
  size = 'default',
}: SectionHeaderProps) {
  return (
    <header className={cx(styles.header, align === 'center' && styles.center, size === 'large' && styles.large)}>
      {eyebrow && <Eyebrow pillar={pillar}>{eyebrow}</Eyebrow>}
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>
      {lead && <p className={styles.lead}>{lead}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export function Grid({
  children,
  columns = 3,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cx(styles.grid, styles[`cols-${columns}`], className)}>{children}</Tag>;
}

export function Actions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.actionsRow, className)}>{children}</div>;
}
