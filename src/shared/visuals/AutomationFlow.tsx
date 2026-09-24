import { automationFlow } from '@/content/intelligence';
import styles from './AutomationFlow.module.css';

/** Application → AI → Business data → Decision → Action, with flowing connectors. */
export function AutomationFlow() {
  return (
    <ol className={styles.flow} aria-label="AI automation flow">
      {automationFlow.map((stage, index) => (
        <li key={stage.label} className={styles.stage} data-kind={index === 1 ? 'ai' : index === 3 ? 'decision' : undefined}>
          <p className={styles.label}>{stage.label}</p>
          <p className={styles.detail}>{stage.detail}</p>
        </li>
      ))}
    </ol>
  );
}
