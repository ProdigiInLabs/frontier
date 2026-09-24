import { useId } from 'react';
import styles from './Definition.module.css';

/**
 * AEO definition block: a question heading followed immediately by a
 * direct, self-contained answer that can be quoted on its own.
 */
export function Definition({ question, answer, headingLevel: Heading = 'h2' }: { question: string; answer: string; headingLevel?: 'h2' | 'h3' }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={styles.definition}>
      <p className={styles.kicker} aria-hidden="true">
        Definition
      </p>
      <Heading id={id} className={styles.question}>
        {question}
      </Heading>
      <p className={styles.answer}>{answer}</p>
    </section>
  );
}
