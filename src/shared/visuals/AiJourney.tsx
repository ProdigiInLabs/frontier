import { aiJourney } from '@/content/intelligence';
import styles from './AiJourney.module.css';

/** "Where do I start?" — 01 DISCOVER … 07 OPTIMIZE. */
export function AiJourney({ headingLevel: Heading = 'h3' }: { headingLevel?: 'h3' | 'h4' }) {
  return (
    <ol className={styles.journey}>
      {aiJourney.map((step, index) => (
        <li key={step.title} className={styles.step} style={{ ['--i' as string]: index }}>
          <span className={styles.num} aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <Heading className={styles.title}>{step.title}</Heading>
          <p className={styles.text}>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
