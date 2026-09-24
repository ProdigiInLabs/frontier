import type { ReactNode } from 'react';
import { getFaqs } from '@/content/faqs';
import { findRoute } from '@/routing/manifest';
import { AppLink } from '@/shared/components/AppLink';
import { ButtonLink } from '@/shared/components/Button';
import { Definition } from '@/shared/components/Definition';
import { FaqList } from '@/shared/components/FaqList';
import { Icon } from '@/shared/components/Icon';
import styles from './AboutExperience.module.css';

interface LinkItem {
  label: string;
  to: string;
}

interface Props {
  /** Route path; its manifest `faqIds` are rendered here (and drive FAQPage schema). */
  path: string;
  intro?: ReactNode;
  links?: LinkItem[];
  cta?: LinkItem;
  id?: string;
}

/**
 * Server-rendered explanation beneath every AI experience:
 * a direct-answer definition (the route's first FAQ) followed by the
 * remaining FAQs, related links and a next step.
 */
export function AboutExperience({ path, intro, links = [], cta, id = 'about' }: Props) {
  const ids = findRoute(path)?.faqIds;
  const [definition, ...rest] = getFaqs(Array.isArray(ids) ? ids : []);
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={styles.about}>
      <div className={styles.head}>
        <p className={styles.kicker}>Learn</p>
        <h2 id={headingId} className={styles.title}>
          About this experience
        </h2>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>

      {definition && (
        <div id={`faq-${definition.id}`}>
          <Definition question={definition.question} answer={definition.answer} headingLevel="h3" />
        </div>
      )}

      {rest.length > 0 && (
        <div className={styles.faqs}>
          <FaqList faqs={rest} headingLevel="h3" />
        </div>
      )}

      {(links.length > 0 || cta) && (
        <div className={styles.next}>
          {links.length > 0 && (
            <ul className={styles.links} aria-label="Related">
              {links.map((link) => (
                <li key={link.to}>
                  <AppLink to={link.to} className={styles.link}>
                    {link.label}
                    <Icon name="arrowRight" size={16} />
                  </AppLink>
                </li>
              ))}
            </ul>
          )}
          {cta && (
            <ButtonLink to={cta.to} variant="accent" icon="arrowRight">
              {cta.label}
            </ButtonLink>
          )}
        </div>
      )}
    </section>
  );
}
