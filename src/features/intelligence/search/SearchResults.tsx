import type { SearchResponse } from '@/core/services/ai/types';
import { AppLink } from '@/shared/components/AppLink';
import { Badge } from '@/shared/components/Badge';
import { MarkdownLite } from '../shared/MarkdownLite';
import { Highlight } from './Highlight';
import styles from './SearchResults.module.css';

export const hitAnchor = (id: string) => `hit-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

export function SearchResults({ response }: { response: SearchResponse }) {
  const { answer, hits } = response;
  const citations = (answer?.citations ?? [])
    .map((id) => ({ id, index: hits.findIndex((hit) => hit.id === id) }))
    .filter((c) => c.index >= 0);

  return (
    <div className={styles.results}>
      {answer && (
        <section className={styles.answer} aria-labelledby="search-answer-heading">
          <h2 id="search-answer-heading" className={styles.answerLabel}>
            AI answer
          </h2>
          <MarkdownLite text={answer.text} className={styles.answerText} />
          {citations.length > 0 && (
            <p className={styles.citations}>
              <span className={styles.citationsLabel}>Based on</span>
              {citations.map(({ id, index }) => (
                <a key={id} href={`#${hitAnchor(id)}`} className={styles.citation} aria-label={`Source ${index + 1}: ${hits[index]!.title}`}>
                  [{index + 1}]
                </a>
              ))}
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="search-hits-heading">
        <h2 id="search-hits-heading" className={styles.hitsLabel}>
          Ranked results
        </h2>
        <ol className={styles.hits}>
          {hits.map((hit, index) => {
            const score = Math.max(0, Math.min(1, hit.score));
            return (
              <li key={hit.id} id={hitAnchor(hit.id)} className={styles.hit}>
                <span className={styles.rank} aria-hidden="true">
                  {index + 1}
                </span>
                <div className={styles.hitBody}>
                  <div className={styles.hitHead}>
                    <h3 className={styles.hitTitle}>
                      <AppLink to={hit.url}>
                        <Highlight text={hit.title} terms={hit.matchedTerms} />
                      </AppLink>
                    </h3>
                    <Badge>{hit.category}</Badge>
                  </div>
                  <p className={styles.snippet}>
                    <Highlight text={hit.snippet} terms={hit.matchedTerms} />
                  </p>
                  <div className={styles.meta}>
                    <span className={styles.url}>{hit.url}</span>
                    <span className={styles.relevance}>
                      <span className={styles.bar} aria-hidden="true">
                        <span style={{ width: `${Math.round(score * 100)}%` }} />
                      </span>
                      <span>Relevance {score.toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
