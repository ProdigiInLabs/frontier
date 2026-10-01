import { beforeEach, describe, expect, it, vi } from 'vitest';

const embedContent = vi.fn();
vi.mock('../providers/gemini/client.js', () => ({ gemini: { models: { embedContent: (...args: unknown[]) => embedContent(...args) } } }));
vi.mock('../knowledge/index.js', () => ({
  flattenKnowledge: () => [
    { id: 'a', title: 'A', path: '/a', category: 'faq', text: 'alpha' },
    { id: 'b', title: 'B', path: '/b', category: 'faq', text: 'beta' },
  ],
}));

describe('search index resilience', () => {
  beforeEach(() => {
    vi.resetModules();
    embedContent.mockReset();
  });

  it('recovers on the next call after the index build fails, instead of staying broken forever', async () => {
    // Regression test: the index builder used to cache a failed build
    // permanently (`indexing ??= …`), so a single transient embedding
    // error (rate limit, cold-start blip) would 503 every chat/search
    // request for the rest of the process's life.
    embedContent.mockRejectedValueOnce(new Error('503 upstream unavailable'));
    embedContent.mockResolvedValueOnce({ embeddings: [{ values: [1, 0] }, { values: [0, 1] }] }); // index build, retry
    embedContent.mockResolvedValueOnce({ embeddings: [{ values: [1, 0] }] }); // query embedding

    const { semanticSearch } = await import('../providers/gemini/search-index.js');

    await expect(semanticSearch('alpha')).rejects.toThrow();
    const results = await semanticSearch('alpha');
    expect(results[0]?.doc.id).toBe('a');
  });

  it('builds the index only once across multiple successful calls', async () => {
    embedContent.mockResolvedValueOnce({ embeddings: [{ values: [1, 0] }, { values: [0, 1] }] }); // index build
    embedContent.mockResolvedValue({ embeddings: [{ values: [1, 0] }] }); // every query

    const { semanticSearch } = await import('../providers/gemini/search-index.js');
    await semanticSearch('alpha');
    await semanticSearch('alpha again');

    // One call to build the index, plus one per query — never rebuilt.
    expect(embedContent).toHaveBeenCalledTimes(3);
  });
});
