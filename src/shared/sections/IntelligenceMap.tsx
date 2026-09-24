import { intelligenceCapabilities } from '@/content/intelligence';
import { AppLink } from '@/shared/components/AppLink';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';
import styles from './IntelligenceMap.module.css';

/** The Intelligence capability map: one card per capability with examples and a route. */
export function IntelligenceMap({ headingLevel: Heading = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  return (
    <ul className={styles.map}>
      {intelligenceCapabilities.map((capability) => (
        <li key={capability.id} className={styles.card} data-interactive={capability.interactive}>
          <div className={styles.head}>
            <Heading className={styles.name}>
              <AppLink to={capability.to} className={styles.link}>
                {capability.name}
              </AppLink>
            </Heading>
            {capability.interactive && <Badge tone="intelligence">Interactive</Badge>}
          </div>
          <p className={styles.summary}>{capability.summary}</p>
          <ul className={styles.examples} aria-label={`${capability.name} examples`}>
            {capability.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
          <p className={styles.cta} aria-hidden="true">
            {capability.cta}
            <Icon name="arrowRight" size={16} />
          </p>
        </li>
      ))}
    </ul>
  );
}
