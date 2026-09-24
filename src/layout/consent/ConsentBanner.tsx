import { useSyncExternalStore } from 'react';
import { analytics } from '@/core/services/analytics/analytics-service';
import { Button } from '@/shared/components/Button';
import styles from './ConsentBanner.module.css';

/**
 * Shown only when an analytics provider is configured and the visitor has
 * not decided yet. Rendered after mount, so prerendered HTML never contains it.
 */
export function ConsentBanner() {
  const visible = useSyncExternalStore(
    (listener) => analytics.subscribe(listener),
    () => analytics.enabled && analytics.consent === 'unset',
    () => false,
  );

  if (!visible) return null;
  return (
    <section className={styles.banner} aria-label="Analytics consent">
      <p className={styles.text}>
        We’d like to use analytics to understand which pages help visitors. Nothing is loaded unless you agree.
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={() => analytics.setConsent('denied')}>
          Decline
        </Button>
        <Button size="sm" onClick={() => analytics.setConsent('granted')}>
          Allow analytics
        </Button>
      </div>
    </section>
  );
}
