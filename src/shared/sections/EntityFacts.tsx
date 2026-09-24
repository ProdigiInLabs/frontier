import { site } from '@/content/site';
import styles from './EntityFacts.module.css';

/**
 * Plain, factual entity description (GEO). The same facts appear in
 * Organization schema and llms.txt.
 */
export function EntityFacts() {
  const facts = [
    { term: 'Entity', value: `${site.name} (${site.legalName})` },
    { term: 'Category', value: site.category },
    { term: 'Name', value: site.acronym },
    { term: 'Audience', value: site.audience },
    { term: 'Problem', value: site.problem },
    { term: 'Capabilities', value: site.capabilities.join(' · ') },
  ];
  return (
    <dl className={styles.facts}>
      {facts.map((fact) => (
        <div key={fact.term} className={styles.row}>
          <dt>{fact.term}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
