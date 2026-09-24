import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { aiClient } from '@/core/services/ai/ai-client';
import { isAbort, userMessage } from '@/core/services/ai/errors';
import type { SearchResponse } from '@/core/services/ai/types';
import { analytics } from '@/core/services/analytics/analytics-service';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { StateMessage } from '@/shared/components/StateMessage';
import { AboutExperience } from '../shared/AboutExperience';
import { AppPage } from '../shared/AppPage';
import { AppPageHeader } from '../shared/AppPageHeader';
import { formatMs } from '../shared/format';
import { ModeBadge } from '../shared/ModeBadge';
import { useHydrated } from '../shared/useHydrated';
import { exampleQueries, MAX_QUERY_LENGTH } from './examples';
import { SearchResults } from './SearchResults';
import styles from './SearchPage.module.css';

interface Settled {
  key: string;
  response?: SearchResponse;
  error?: string;
}

const corpus =
  aiClient.mode === 'demo'
    ? {
        title: 'Demo knowledge base: Prodigi’s published pages and answers',
        body: 'Search runs in your browser over this website’s pages, capabilities and FAQ answers. Results are ranked by relevance, and strong matches are summarized into a direct answer that cites its sources.',
      }
    : {
        title: 'Knowledge connected to Prodigi Intelligence',
        body: 'Results are ranked by relevance, and strong matches are summarized into a direct answer that cites its sources.',
      };

export default function SearchPage() {
  // The URL is the source of truth (?q=…&category=…), read only after hydration
  // so the prerendered initial state always matches.
  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();
  const query = hydrated ? (params.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH) : '';
  const category = hydrated && query ? (params.get('category') ?? '') : '';
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<'input' | 'example' | 'filter' | 'url'>('url');

  const key = query ? `${query}\u0000${category}\u0000${attempt}` : '';

  // Keep the field in step with the URL (initial load, back/forward).
  useEffect(() => {
    const input = inputRef.current;
    if (input && input.value !== query) input.value = query;
  }, [query]);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    aiClient.search({ query, limit: 8, ...(category ? { category } : {}) }, { signal: controller.signal }).then(
      (response) => {
        setSettled({ key, response });
        analytics.track('search_query', {
          mode: aiClient.mode,
          source: sourceRef.current,
          category: category || 'all',
          results: response.hits.length,
          answered: Boolean(response.answer),
        });
      },
      (error: unknown) => {
        if (!isAbort(error)) setSettled({ key, error: userMessage(error) });
      },
    );
    return () => controller.abort();
  }, [query, category, key]);

  const go = (next: string, nextCategory: string, source: typeof sourceRef.current) => {
    const q = next.trim().slice(0, MAX_QUERY_LENGTH);
    sourceRef.current = source;
    if (q === query && nextCategory === category) {
      if (q) setAttempt((n) => n + 1);
      return;
    }
    const search = new URLSearchParams();
    if (q) search.set('q', q);
    if (q && nextCategory) search.set('category', nextCategory);
    setParams(search);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    go(inputRef.current?.value ?? '', category, 'input');
  };

  const status = !query ? 'initial' : settled?.key !== key ? 'loading' : settled.error ? 'error' : settled.response?.hits.length ? 'results' : 'empty';
  const response = settled?.response;
  const categories = response?.categories ?? [];
  const current = status === 'results' ? response : undefined;

  const announcement =
    status === 'loading'
      ? 'Searching…'
      : status === 'results' && current
        ? `${current.hits.length} results${current.answer ? ' and an AI answer' : ''} for ${query}.`
        : status === 'empty'
          ? `No results for ${query}.`
          : '';

  return (
    <AppPage>
      <AppPageHeader eyebrow="Search" title="AI Search" lead="Turn business knowledge into answers." badges={<ModeBadge />} />

      <form role="search" aria-label="Knowledge base" className={styles.form} onSubmit={onSubmit}>
        <label htmlFor="ai-search-input" className={styles.label}>
          Search the knowledge base
        </label>
        <div className={styles.field}>
          <Icon name="search" size={20} className={styles.fieldIcon} />
          <input
            ref={inputRef}
            id="ai-search-input"
            type="search"
            name="q"
            className={styles.input}
            placeholder="Ask a question or search a topic"
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            enterKeyHint="search"
            defaultValue=""
          />
          <Button type="submit" variant="accent" className={styles.submit}>
            Search
          </Button>
        </div>
        <div className={styles.examples}>
          <span className={styles.examplesLabel} id="search-examples-label">
            Try
          </span>
          <ul className={styles.chips} aria-labelledby="search-examples-label">
            {exampleQueries.map((example) => (
              <li key={example}>
                <button type="button" className={styles.chip} onClick={() => go(example, '', 'example')}>
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div className={styles.output} aria-busy={status === 'loading'}>
        {categories.length > 0 && status !== 'initial' && (
          <div className={styles.toolbar}>
            <div role="group" aria-label="Filter by category" className={styles.filters}>
              {['', ...categories].map((value) => (
                <button
                  key={value || 'all'}
                  type="button"
                  className={styles.filter}
                  aria-pressed={category === value}
                  onClick={() => go(query, value, 'filter')}
                >
                  {value || 'All'}
                </button>
              ))}
            </div>
            {current && (
              <p className={styles.took}>
                {current.hits.length} {current.hits.length === 1 ? 'result' : 'results'} · {formatMs(current.tookMs)}
              </p>
            )}
          </div>
        )}

        {status === 'initial' && (
          <StateMessage tone="info" icon="book" title={corpus.title}>
            {corpus.body}
          </StateMessage>
        )}

        {status === 'loading' && (
          <div className={styles.skeleton} aria-hidden="true">
            <span className={styles.skeletonAnswer} />
            <span />
            <span />
            <span />
          </div>
        )}

        {status === 'error' && (
          <StateMessage
            tone="error"
            title="Something went wrong. Please try again."
            action={
              <Button variant="secondary" size="sm" icon="refresh" iconPosition="start" onClick={() => setAttempt((n) => n + 1)}>
                Retry
              </Button>
            }
          >
            {settled?.error}
          </StateMessage>
        )}

        {status === 'empty' && (
          <StateMessage
            title={`No results for “${query}”${category ? ` in ${category}` : ''}`}
            icon="search"
            action={
              category ? (
                <Button variant="secondary" size="sm" onClick={() => go(query, '', 'filter')}>
                  Search all categories
                </Button>
              ) : undefined
            }
          >
            Try fewer or more general words, check the spelling, or start from one of the example searches above.
          </StateMessage>
        )}

        {current && <SearchResults response={current} />}
      </div>

      <AboutExperience
        path="/intelligence/search"
        intro="AI search combines retrieval with a generated answer. Here, a lightweight ranking engine stands in for vector search; a production backend implements the same response shape."
        links={[
          { label: 'Connect AI to your knowledge', to: '/intelligence/integrations' },
          { label: 'Prodigi Intelligence', to: '/intelligence' },
        ]}
        cta={{ label: 'Talk to Prodigi about AI search', to: '/contact?topic=integrate-ai' }}
      />
    </AppPage>
  );
}
