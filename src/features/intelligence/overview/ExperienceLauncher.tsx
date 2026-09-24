import { intelligenceCapabilities } from '@/content/intelligence';
import { AppLink } from '@/shared/components/AppLink';
import { Icon } from '@/shared/components/Icon';
import type { IconName } from '@/shared/components/Icon';
import { LogoMark } from '@/shared/components/Logo';
import styles from './ExperienceLauncher.module.css';

const icons: Partial<Record<string, IconName>> = { chat: 'chat', agents: 'agent', search: 'search', voice: 'voice' };

/**
 * A window into product mode. It uses the application shell's dark theme so
 * the move from /intelligence into /intelligence/chat feels continuous.
 */
export function ExperienceLauncher() {
  const experiences = [
    ...intelligenceCapabilities.filter((capability) => capability.interactive),
    { id: 'flow', name: 'Integration flow', summary: 'Follow a request from user to AI to business systems.', to: '/demo/enterprise-ai' },
  ];
  return (
    <nav className={styles.launcher} data-theme="dark" aria-label="Prodigi Intelligence experiences">
      <div className={styles.bar}>
        <LogoMark size={16} />
        <span className={styles.title}>Prodigi Intelligence</span>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <p className={styles.prompt}>Choose an experience</p>
      <ul className={styles.list}>
        {experiences.map((experience) => (
          <li key={experience.id}>
            <AppLink to={experience.to} className={styles.item}>
              <span className={styles.icon}>
                <Icon name={icons[experience.id] ?? 'flow'} size={18} />
              </span>
              <span className={styles.text}>
                <span className={styles.name}>{experience.name}</span>
                <span className={styles.summary}>{experience.summary}</span>
              </span>
              <Icon name="arrowRight" size={16} className={styles.arrow} />
            </AppLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
