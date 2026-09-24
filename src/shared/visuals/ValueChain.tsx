import { useId, useState } from 'react';
import { valueChain } from '@/content/home';
import { AppLink } from '@/shared/components/AppLink';
import { Icon } from '@/shared/components/Icon';
import styles from './ValueChain.module.css';

/**
 * PRODUCT → DIGITAL EXPERIENCE → DATA → INTELLIGENCE → AUTOMATION → BUSINESS IMPACT.
 * Select a stage to see what "starting here" means. Every stage's text is in
 * the DOM for crawlers; selection only changes emphasis and the detail panel.
 */
export function ValueChain() {
  const [active, setActive] = useState(0);
  const detailId = useId();
  const stage = valueChain[active]!;

  return (
    <div className={styles.wrap}>
      <ol className={styles.chain}>
        {valueChain.map((item, index) => (
          <li key={item.title} className={styles.stage} data-active={index === active} data-past={index < active}>
            <button type="button" className={styles.button} aria-pressed={index === active} aria-controls={detailId} onClick={() => setActive(index)}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.title}>{item.title}</span>
            </button>
            <p className={styles.desc}>{item.description}</p>
          </li>
        ))}
      </ol>
      <div id={detailId} className={styles.detail} aria-live="polite">
        <p className={styles.detailLabel}>Starting at</p>
        <p className={styles.detailTitle}>{stage.title}</p>
        <p className={styles.detailText}>{stage.description}</p>
        <AppLink to={stage.to} className={styles.detailLink}>
          {index2Label(active)}
          <Icon name="arrowRight" size={16} />
        </AppLink>
      </div>
    </div>
  );
}

function index2Label(index: number) {
  return index === valueChain.length - 1 ? 'Talk about the outcome you need' : `Explore ${valueChain[index]!.title.toLowerCase()}`;
}
