import { Router } from 'express';
import { z } from 'zod';
import { semanticSearch } from '../providers/gemini/search-index.js';
import { flattenKnowledge } from '../knowledge/index.js';
import { SearchLog } from '../db/models/search-log.js';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

const bodySchema = z.object({
  query: z.string().min(1).max(300),
  category: z.string().max(60).optional(),
  limit: z.number().int().min(1).max(20).optional(),
});

const categories = [...new Set(flattenKnowledge().map((doc) => doc.category))];

export const searchRouter = Router();

searchRouter.post('/search', async (req, res, next) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return next(AppError.badRequest('Invalid search request.'));
  const { query, category, limit } = parsed.data;

  const started = Date.now();
  try {
    const scored = await semanticSearch(query, { limit, category });
    const top = scored[0];
    const hits = scored.map((item) => ({
      id: item.doc.id,
      title: item.doc.title,
      url: item.doc.path,
      category: item.doc.category,
      snippet: item.doc.text.length > 260 ? `${item.doc.text.slice(0, 257).trimEnd()}…` : item.doc.text,
      score: Math.round(item.score * 100) / 100,
      matchedTerms: [],
    }));
    const answer = top && top.score >= 0.6 ? { text: top.doc.text, citations: hits.filter((hit) => hit.score >= 0.5).slice(0, 3).map((hit) => hit.id) } : null;
    const tookMs = Date.now() - started;

    res.json({ query, answer, hits, categories, tookMs });

    await SearchLog.create({ query, category, resultCount: hits.length, tookMs }).catch((error: unknown) =>
      logger.error({ err: error }, 'Failed to log search'),
    );
  } catch (error) {
    next(AppError.fromUnknown(error));
  }
});
