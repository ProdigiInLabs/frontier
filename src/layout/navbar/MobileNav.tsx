import { primaryNav } from '@/content/navigation';
import { AppLink } from '@/shared/components/AppLink';
import { Badge } from '@/shared/components/Badge';
import { ButtonLink } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import styles from './MobileNav.module.css';

/**
 * Mobile navigation is its own design, not the desktop menu shrunk:
 * a full-height sheet, grouped disclosure sections and a fixed CTA.
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Menu" variant="sheet">
      <nav aria-label="Mobile" className={styles.nav}>
        <ul className={styles.groups}>
          {primaryNav.map((group) =>
            group.children ? (
              <li key={group.label}>
                <details className={styles.group} data-pillar={group.pillar}>
                  <summary className={styles.summary}>
                    <span className={styles.dot} aria-hidden="true" />
                    {group.label}
                  </summary>
                  <ul className={styles.links}>
                    {group.children.map((child) => (
                      <li key={child.to}>
                        <AppLink to={child.to} className={styles.link} onClick={onClose}>
                          {child.label}
                          {child.interactive && <Badge tone="intelligence">Interactive</Badge>}
                        </AppLink>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ) : (
              <li key={group.label}>
                <AppLink to={group.to} className={styles.top} onClick={onClose}>
                  {group.label}
                </AppLink>
              </li>
            ),
          )}
        </ul>
        <div className={styles.footer}>
          <ButtonLink to="/intelligence/chat" variant="secondary" icon="arrowRight" onClick={onClose}>
            Experience Prodigi Intelligence
          </ButtonLink>
          <ButtonLink to="/contact" onClick={onClose}>
            Start a Conversation
          </ButtonLink>
        </div>
      </nav>
    </Modal>
  );
}
