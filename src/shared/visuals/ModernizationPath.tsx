import styles from './ModernizationPath.module.css';

/** Illustrative only: how legacy share shrinks as capabilities move behind APIs. */
const stages = [
  { title: 'Assess', legacy: 100 },
  { title: 'Stabilize', legacy: 100 },
  { title: 'Wrap', legacy: 85 },
  { title: 'Replace', legacy: 45 },
  { title: 'Retire', legacy: 10 },
];

export function ModernizationPath() {
  return (
    <figure className={styles.figure}>
      <ol className={styles.path}>
        {stages.map((stage) => (
          <li key={stage.title} className={styles.stage}>
            <div className={styles.bar} aria-hidden="true">
              <span className={styles.legacy} style={{ height: `${stage.legacy}%` }} />
              <span className={styles.modern} style={{ height: `${100 - stage.legacy}%` }} />
            </div>
            <p className={styles.title}>{stage.title}</p>
          </li>
        ))}
      </ol>
      <figcaption className={styles.caption}>
        <span><i className={styles.keyLegacy} aria-hidden="true" /> Legacy components</span>
        <span><i className={styles.keyModern} aria-hidden="true" /> Modern components behind stable APIs</span>
        <span className={styles.note}>Illustrative — the system stays shippable at every step.</span>
      </figcaption>
    </figure>
  );
}
