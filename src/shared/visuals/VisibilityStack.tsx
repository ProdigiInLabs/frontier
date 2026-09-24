import { AppLink } from '@/shared/components/AppLink';
import styles from './VisibilityStack.module.css';

const layers = [
  { id: 'geo', name: 'GEO', role: 'Be understood and cited by generative AI', to: '/digital/geo' },
  { id: 'aeo', name: 'AEO', role: 'Become the direct answer', to: '/digital/aeo' },
  { id: 'seo', name: 'SEO', role: 'Rank for the searches that matter', to: '/digital/seo' },
];

/** SEO, AEO and GEO share one foundation. */
export function VisibilityStack() {
  return (
    <div className={styles.stack}>
      <ul className={styles.layers}>
        {layers.map((layer, index) => (
          <li key={layer.id} className={styles.layer} style={{ ['--w' as string]: `${70 + index * 15}%` }}>
            <AppLink to={layer.to} className={styles.link}>
              <span className={styles.name}>{layer.name}</span>
              <span className={styles.role}>{layer.role}</span>
            </AppLink>
          </li>
        ))}
      </ul>
      <p className={styles.foundation}>Foundation: a fast, accessible, well-structured site with trustworthy content and a clearly defined entity</p>
    </div>
  );
}
