import { useId, useState } from 'react';
import styles from './ProductArchitecture.module.css';

const layers = [
  { id: 'experience', label: 'Experience', parts: ['Web app', 'Mobile app', 'Admin', 'Design system'], detail: 'What users touch. Typed components, accessible patterns and performance budgets keep it fast and consistent across web and mobile.' },
  { id: 'edge', label: 'API gateway', parts: ['Auth', 'Rate limits', 'Versioning', 'Caching'], detail: 'One controlled entry point. Authentication, throttling and versioning live here so services stay simple and clients stay stable.' },
  { id: 'services', label: 'Services', parts: ['Accounts', 'Billing', 'Core domain', 'Notifications', 'AI'], detail: 'Business logic, split along domain boundaries only where it reduces complexity. Background jobs and scheduled processing run here too.' },
  { id: 'data', label: 'Data', parts: ['Database', 'Search index', 'Cache', 'Queue', 'Analytics'], detail: 'Schemas and indexes designed for real query patterns. Events feed analytics — and later, intelligence.' },
  { id: 'platform', label: 'Platform', parts: ['Cloud', 'CI/CD', 'Observability', 'Security'], detail: 'Repeatable environments, automated delivery, monitoring and least-privilege access — so the product can change safely.' },
] as const;

/** Interactive product architecture: select a layer to see what it is responsible for. */
export function ProductArchitecture() {
  const [active, setActive] = useState<string>('services');
  const panelId = useId();
  const current = layers.find((layer) => layer.id === active)!;

  return (
    <div className={styles.wrap}>
      <ul className={styles.stack} aria-label="Product architecture layers">
        {layers.map((layer) => (
          <li key={layer.id}>
            <button type="button" className={styles.layer} aria-pressed={layer.id === active} aria-controls={panelId} onClick={() => setActive(layer.id)}>
              <span className={styles.layerLabel}>{layer.label}</span>
              <span className={styles.parts}>
                {layer.parts.map((part) => (
                  <span key={part} className={styles.part}>
                    {part}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div id={panelId} className={styles.panel} aria-live="polite">
        <p className={styles.panelLabel}>Layer</p>
        <p className={styles.panelTitle}>{current.label}</p>
        <p className={styles.panelText}>{current.detail}</p>
      </div>
    </div>
  );
}
