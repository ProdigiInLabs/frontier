import { gemini } from './client.js';
import { env } from '../../config/env.js';
import { flattenKnowledge } from '../../knowledge/index.js';
import type { KnowledgeDoc } from '../../knowledge/index.js';
import { logger } from '../../lib/logger.js';
import { AppError } from '../../lib/app-error.js';

/**
 * Real semantic search over Prodigi's own content: embeddings are computed
 * once at startup (the knowledge base is small and static) and compared by
 * cosine similarity at request time. No vector database needed at this scale.
 */

interface IndexedDoc extends KnowledgeDoc {
  embedding: number[];
}

let index: IndexedDoc[] | null = null;
let indexing: Promise<IndexedDoc[]> | null = null;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await gemini.models.embedContent({ model: env.GEMINI_EMBEDDING_MODEL, contents: texts });
  const embeddings = response.embeddings;
  if (!embeddings || embeddings.length !== texts.length) throw AppError.fromUnknown(new Error('Embedding response shape mismatch'));
  return embeddings.map((embedding) => embedding.values ?? []);
}

async function buildIndex(): Promise<IndexedDoc[]> {
  const docs = flattenKnowledge();
  // Small, fixed corpus (tens of docs) — one batch is well within free-tier limits.
  const vectors = await embedBatch(docs.map((doc) => doc.text));
  const built = docs.map((doc, i) => ({ ...doc, embedding: vectors[i] ?? [] }));
  logger.info({ count: built.length }, 'Search index built');
  return built;
}

/**
 * Builds the index once, lazily, and reuses it for the life of the process.
 * If the build fails (a transient Gemini error, a rate limit during cold
 * start), the failed attempt is never cached — the next call retries from
 * scratch instead of every request 503ing forever until the process restarts.
 */
async function getIndex(): Promise<IndexedDoc[]> {
  if (index) return index;
  indexing ??= buildIndex()
    .then((built) => {
      index = built;
      return built;
    })
    .catch((error: unknown) => {
      indexing = null;
      throw error;
    });
  return indexing;
}

/** Pre-warms the index at boot so the first visitor doesn't pay for it. */
export function warmSearchIndex(): void {
  getIndex().catch((error) => logger.error({ err: error }, 'Failed to warm search index'));
}

export interface ScoredDoc {
  doc: KnowledgeDoc;
  score: number;
}

export async function semanticSearch(query: string, options: { limit?: number; category?: string } = {}): Promise<ScoredDoc[]> {
  const docs = await getIndex();
  const [queryVector] = await embedBatch([query]);
  if (!queryVector) return [];
  const scored = docs
    .filter((doc) => !options.category || doc.category === options.category)
    .map((doc) => ({ doc, score: cosineSimilarity(queryVector, doc.embedding) }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, options.limit ?? 8);
}
