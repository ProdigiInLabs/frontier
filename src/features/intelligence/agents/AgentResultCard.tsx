import { aiClient } from '@/core/services/ai/ai-client';
import type { AgentResult } from '@/core/services/ai/types';
import { Tooltip } from '@/shared/components/Tooltip';
import styles from './AgentResultCard.module.css';

const unavailable =
  aiClient.mode === 'demo' ? 'Available when connected to your systems' : 'Actions are carried out in your connected workspace';

export function AgentResultCard({ result, headingId }: { result: AgentResult; headingId: string }) {
  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <p className={styles.kicker}>Result</p>
      <h3 id={headingId} className={styles.title}>
        {result.title}
      </h3>
      <p className={styles.summary}>{result.summary}</p>

      {result.sections.length > 0 && (
        <div className={styles.sections}>
          {result.sections.map((section) => (
            <section key={section.heading} className={styles.section}>
              <h4 className={styles.heading}>{section.heading}</h4>
              <ul className={styles.items}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {result.nextActions.length > 0 && (
        <div className={styles.next}>
          <h4 className={styles.heading}>Next actions</h4>
          <ul className={styles.actions}>
            {result.nextActions.map((action) => (
              <li key={action}>
                <Tooltip content={unavailable}>
                  <button type="button" className={styles.action} aria-disabled="true" onClick={(event) => event.preventDefault()}>
                    {action}
                  </button>
                </Tooltip>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
