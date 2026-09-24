import type { ReactNode } from 'react';
import type { Pillar } from '@/content/types';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { Container, Eyebrow } from '@/shared/components/Layout';
import styles from './PageHero.module.css';

interface PageHeroProps {
  eyebrow: string;
  pillar?: Pillar;
  title: ReactNode;
  lead: ReactNode;
  actions?: ReactNode;
  visual?: ReactNode;
  children?: ReactNode;
}

/** Hero for every marketing page below the homepage. Owns the page's only <h1>. */
export function PageHero({ eyebrow, pillar, title, lead, actions, visual, children }: PageHeroProps) {
  return (
    <section className={styles.hero} data-pillar={pillar} aria-labelledby="page-title">
      <Container size="wide">
        <Breadcrumbs />
        <div className={[styles.grid, visual ? styles.withVisual : ''].join(' ')}>
          <div className={styles.copy}>
            <Eyebrow pillar={pillar}>{eyebrow}</Eyebrow>
            <h1 id="page-title" className={styles.title}>
              {title}
            </h1>
            <p className={styles.lead}>{lead}</p>
            {actions && <div className={styles.actions}>{actions}</div>}
            {children}
          </div>
          {visual && <div className={styles.visual}>{visual}</div>}
        </div>
      </Container>
    </section>
  );
}
