import { demos } from '@/content/demos';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';
import { Icon } from '@/shared/components/Icon';
import type { IconName } from '@/shared/components/Icon';
import styles from './DemoGrid.module.css';

const icons: Record<string, IconName> = { chat: 'chat', agent: 'agent', search: 'search', voice: 'voice', enterprise: 'flow' };

export function DemoGrid({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  return (
    <ul className={styles.grid}>
      {demos.map((demo) => (
        <li key={demo.id}>
          <Card
            as="div"
            to={demo.to}
            cta={demo.cta}
            headingLevel={headingLevel}
            eyebrow={
              <span className={styles.eyebrow}>
                <Icon name={icons[demo.id] ?? 'sparkle'} size={16} />
                <Badge tone="intelligence">Interactive</Badge>
              </span>
            }
            title={demo.name}
          >
            <p>{demo.description}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
