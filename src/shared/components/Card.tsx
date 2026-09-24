import type { ElementType, ReactNode } from 'react';
import type { Pillar } from '@/content/types';
import { AppLink } from './AppLink';
import { Icon } from './Icon';
import styles from './Card.module.css';

interface CardProps {
  title: ReactNode;
  children?: ReactNode;
  eyebrow?: ReactNode;
  /** When set, the whole card is one link (the title carries the link text). */
  to?: string;
  cta?: string;
  pillar?: Pillar;
  headingLevel?: 'h2' | 'h3' | 'h4';
  footer?: ReactNode;
  variant?: 'outline' | 'plain' | 'filled';
  as?: ElementType;
  className?: string;
}

export function Card({
  title,
  children,
  eyebrow,
  to,
  cta,
  pillar,
  headingLevel: Heading = 'h3',
  footer,
  variant = 'outline',
  as: Tag = 'article',
  className,
}: CardProps) {
  return (
    <Tag
      className={[styles.card, styles[variant], to && styles.interactive, className].filter(Boolean).join(' ')}
      data-pillar={pillar}
    >
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <Heading className={styles.title}>
        {to ? (
          <AppLink to={to} className={styles.link}>
            {title}
          </AppLink>
        ) : (
          title
        )}
      </Heading>
      {children && <div className={styles.body}>{children}</div>}
      {footer && <div className={styles.footer}>{footer}</div>}
      {to && cta && (
        <p className={styles.cta} aria-hidden="true">
          {cta}
          <Icon name="arrowRight" size={16} />
        </p>
      )}
    </Tag>
  );
}
