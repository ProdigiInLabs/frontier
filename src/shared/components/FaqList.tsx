import type { Faq } from '@/content/types';
import { AppLink } from './AppLink';
import styles from './FaqList.module.css';

/**
 * Question-led FAQ. Answers are always in the DOM (native <details>), so
 * crawlers and answer engines read them; FAQPage schema mirrors this list.
 */
export function FaqList({ faqs, headingLevel: Heading = 'h3', openFirst = false }: { faqs: Faq[]; headingLevel?: 'h2' | 'h3'; openFirst?: boolean }) {
  return (
    <div className={styles.list}>
      {faqs.map((faq, index) => (
        <details key={faq.id} className={styles.item} open={openFirst && index === 0} id={`faq-${faq.id}`}>
          <summary className={styles.summary}>
            <Heading className={styles.question}>{faq.question}</Heading>
            <span className={styles.marker} aria-hidden="true" />
          </summary>
          <div className={styles.answer}>
            <p>{faq.answer}</p>
            {faq.links && (
              <p className={styles.links}>
                {faq.links.map((link) => (
                  <AppLink key={link.to} to={link.to}>
                    {link.label}
                  </AppLink>
                ))}
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
