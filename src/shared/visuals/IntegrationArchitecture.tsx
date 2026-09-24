import { integrationLayers } from '@/content/intelligence';
import type { IntegrationLayerId } from '@/content/intelligence';
import styles from './IntegrationArchitecture.module.css';

const chips: Partial<Record<IntegrationLayerId, string[]>> = {
  tools: ['APIs', 'RAG', 'Functions', 'Policies'],
  systems: ['CRM', 'ERP', 'Databases', 'E-commerce', 'Documents', 'Internal tools'],
  model: ['Claude', 'OpenAI', 'Gemini', 'Azure AI', 'Open models'],
};

interface Props {
  /** Highlights one layer (used by the interactive demo). */
  activeLayer?: IntegrationLayerId | null;
  /** Layers already traversed in the demo. */
  completed?: readonly IntegrationLayerId[];
  /** Ambient data-flow animation along the connector. */
  flowing?: boolean;
  headingLevel?: 'h3' | 'h4';
}

/**
 * USER → PRODIGI INTELLIGENCE → AI MODEL → TOOLS/APIs/RAG → BUSINESS SYSTEMS → RESULT/ACTION.
 * An ordered list, so the architecture is readable without the visuals.
 */
export function IntegrationArchitecture({ activeLayer = null, completed = [], flowing = true, headingLevel: Heading = 'h3' }: Props) {
  return (
    <ol className={styles.stack} data-flowing={flowing} aria-label="Enterprise AI integration architecture">
      {integrationLayers.map((layer, index) => {
        const state = layer.id === activeLayer ? 'active' : completed.includes(layer.id) ? 'done' : 'idle';
        return (
          <li key={layer.id} className={styles.layer} data-layer={layer.id} data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
            <span className={styles.index} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className={styles.node}>
              <Heading className={styles.label}>{layer.label}</Heading>
              <p className={styles.detail}>{layer.detail}</p>
              {chips[layer.id] && (
                <ul className={styles.chips} aria-label={`${layer.label} examples`}>
                  {chips[layer.id]!.map((chip) => (
                    <li key={chip}>{chip}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
