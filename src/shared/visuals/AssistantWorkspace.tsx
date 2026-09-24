import styles from './AssistantWorkspace.module.css';

/** Illustration of an assistant grounded in documents. Decorative; described by the page copy. */
export function AssistantWorkspace() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.doc}>
        <p className={styles.kicker}>Source · Policy handbook v4</p>
        <span className={styles.line} style={{ width: '92%' }} />
        <span className={[styles.line, styles.highlight].join(' ')} style={{ width: '78%' }} />
        <span className={[styles.line, styles.highlight].join(' ')} style={{ width: '64%' }} />
        <span className={styles.line} style={{ width: '88%' }} />
        <span className={styles.line} style={{ width: '70%' }} />
      </div>
      <div className={styles.assistant}>
        <p className={styles.kicker}>Assistant</p>
        <p className={styles.bubble}>Summarize what changed in the travel policy.</p>
        <p className={[styles.bubble, styles.reply].join(' ')}>
          Two changes: client-visit travel now needs manager approval in advance, and the hotel limit was updated. <span className={styles.cite}>[1]</span>
        </p>
        <div className={styles.chips}>
          <span>Draft email</span>
          <span>Create checklist</span>
        </div>
      </div>
    </div>
  );
}
