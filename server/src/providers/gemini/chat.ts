import type { Content } from '@google/genai';
import { gemini } from './client.js';
import { env } from '../../config/env.js';
import { buildSystemInstruction } from '../../knowledge/index.js';
import { semanticSearch } from './search-index.js';
import { AppError } from '../../lib/app-error.js';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Matches the frontend's ChatStreamEvent union (src/core/services/ai/types.ts). */
export type ChatStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'sources'; sources: { id: string; title: string; url: string; snippet?: string }[] }
  | { type: 'follow_ups'; suggestions: string[] }
  | { type: 'done' };

const toContent = (turns: ChatTurn[]): Content[] =>
  turns.map((turn) => ({ role: turn.role === 'user' ? 'user' : 'model', parts: [{ text: turn.content }] }));

/**
 * Grounded chat: retrieve relevant Prodigi content for the latest question,
 * give it to the model as context, stream the reply, then suggest follow-ups
 * drawn from the same retrieved set (so suggestions always lead somewhere real).
 */
export async function* streamChatReply(turns: ChatTurn[]): AsyncGenerator<ChatStreamEvent> {
  const latest = turns.at(-1)?.content.trim();
  if (!latest) throw AppError.badRequest('No message to respond to.');

  const hits = await semanticSearch(latest, { limit: 5 }).catch(() => []);
  const relevant = hits.filter((hit) => hit.score >= 0.55);
  const context = relevant.length
    ? `Relevant Prodigi content for this question:\n${relevant.map((hit) => `- ${hit.doc.title}: ${hit.doc.text}`).join('\n')}`
    : 'No closely matching Prodigi content was found for this question — answer only from the system instruction, or say you do not have that information.';

  const contents: Content[] = [...toContent(turns.slice(0, -1)), { role: 'user', parts: [{ text: `${context}\n\nVisitor question: ${latest}` }] }];

  let full = '';
  try {
    const stream = await gemini.models.generateContentStream({
      model: env.GEMINI_TEXT_MODEL,
      contents,
      config: { systemInstruction: buildSystemInstruction(), temperature: 0.4, maxOutputTokens: 600 },
    });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        full += text;
        yield { type: 'delta', text };
      }
    }
  } catch (error) {
    throw AppError.fromUnknown(error);
  }

  if (!full.trim()) throw new AppError('bad_response', 502, 'Empty response from model.');

  const seen = new Set<string>();
  const sources = relevant
    .filter((hit) => (seen.has(hit.doc.path) ? false : (seen.add(hit.doc.path), true)))
    .slice(0, 3)
    .map((hit) => ({ id: hit.doc.id, title: hit.doc.title, url: hit.doc.path, snippet: hit.doc.text.slice(0, 180) }));
  if (sources.length) yield { type: 'sources', sources };

  const followUps = relevant
    .filter((hit) => hit.doc.category === 'faq' && hit.doc.title !== latest)
    .slice(0, 3)
    .map((hit) => hit.doc.title);
  if (followUps.length) yield { type: 'follow_ups', suggestions: followUps };

  yield { type: 'done' };
}
