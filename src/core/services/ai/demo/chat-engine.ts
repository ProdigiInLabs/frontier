import type { ChatTurn, Source } from '../types';
import type { KnowledgeDoc } from './knowledge';
import type { Retriever } from './retrieval';
import { tokenize } from './retrieval';

export interface ComposedAnswer {
  text: string;
  sources: Source[];
  followUps: string[];
}

const DEFAULT_FOLLOW_UPS = [
  'What does Prodigi do?',
  'Where should a business start with AI?',
  'How does AI integration work?',
  'What is the difference between SEO, AEO and GEO?',
];

const firstSentence = (text: string) => text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;

const toSource = (doc: KnowledgeDoc): Source => ({
  id: doc.id,
  title: doc.title,
  url: doc.url,
  snippet: firstSentence(doc.answer),
});

interface Intent {
  test: RegExp;
  reply: ComposedAnswer;
}

const intents: Intent[] = [
  {
    test: /^(hi|hello|hey|good (morning|afternoon|evening)|greetings)\b/i,
    reply: {
      text: 'Hello. I can answer questions about what Prodigi builds, how AI fits into a business, and where to start.\n\nAsk me anything — for example, how AI integration works, or what Prodigi can do with an existing application.',
      sources: [],
      followUps: DEFAULT_FOLLOW_UPS.slice(0, 3),
    },
  },
  {
    test: /\b(thanks|thank you|cheers)\b/i,
    reply: {
      text: 'You’re welcome. If you’d like to talk it through with the Prodigi team, the contact page asks a few questions so the first conversation is useful.',
      sources: [{ id: 'contact', title: 'Start a conversation', url: '/contact' }],
      followUps: ['How does working with Prodigi start?', 'What does Prodigi do?'],
    },
  },
  {
    test: /\b(who|what) are you\b|\bare you (real|an? ai|a bot|human)\b|\bwhich model\b|\bwhat model\b/i,
    reply: {
      text: 'I’m the **Prodigi Intelligence demo**. In demo mode I run entirely in your browser and answer only from the content published on this website — **no AI model is connected** and nothing you type leaves this page.\n\nThe interface uses the same contract a production AI backend would implement, so a real model can be connected without changing what you see.',
      sources: [{ id: 'faq:are-the-demos-real', title: 'Are the AI demos connected to a real AI model?', url: '/demo' }],
      followUps: ['How does AI integration work?', 'Which AI models does Prodigi work with?', 'How is business data kept secure when using AI?'],
    },
  },
  {
    test: /\b(talk to|speak to|contact|hire|call|email|reach) (someone|a human|a person|you|prodigi|the team|sales)\b|\bget in touch\b/i,
    reply: {
      text: 'The best way is the contact page. It asks what you’re trying to solve — a product, a modernization, a website, visibility, AI or automation — so the first conversation starts in the right place.',
      sources: [{ id: 'contact', title: 'Start a conversation', url: '/contact' }],
      followUps: ['How does working with Prodigi start?', 'How much does a project cost?'],
    },
  },
];

const VAGUE = /^(tell me more|more|go on|how|why|explain|example|examples|and\??|details)\W*$/i;

/**
 * Grounded answer composition: retrieve → lead with the best direct answer →
 * add one related point → cite sources → suggest follow-ups. Never invents
 * facts beyond the indexed site content.
 */
export function composeAnswer(retriever: Retriever, history: ChatTurn[]): ComposedAnswer {
  const userTurns = history.filter((turn) => turn.role === 'user');
  const latest = userTurns.at(-1)?.content.trim() ?? '';
  if (!latest) return { text: 'Ask a question to get started.', sources: [], followUps: DEFAULT_FOLLOW_UPS };

  const intent = intents.find((candidate) => candidate.test.test(latest));
  if (intent) return intent.reply;

  // Short follow-ups inherit the previous question's context.
  const previous = userTurns.at(-2)?.content ?? '';
  const query = VAGUE.test(latest) || tokenize(latest).length < 2 ? `${previous} ${latest}` : latest;

  const ranked = retriever.search(query, { limit: 8 });
  const top = ranked[0];
  const asked = new Set(userTurns.map((turn) => turn.content.trim().toLowerCase()));

  if (!top || top.score < 2.2) {
    return {
      text: 'I don’t have a good answer to that in the Prodigi content this demo uses — and I’d rather say so than guess.\n\nI can help with questions about building or modernizing products, websites and visibility (SEO, AEO, GEO), and how AI chat, assistants, agents, search, voice and automation fit into a business.',
      sources: [],
      followUps: DEFAULT_FOLLOW_UPS.filter((q) => !asked.has(q.toLowerCase())).slice(0, 3),
    };
  }

  const related = ranked.find(
    (candidate) => candidate.doc.url !== top.doc.url && candidate.score >= top.score * 0.55 && candidate.doc.answer !== top.doc.answer,
  );

  const paragraphs = [top.doc.answer];
  if (related) paragraphs.push(`**Related — ${related.doc.title.replace(/\?$/, '')}:** ${firstSentence(related.doc.answer)}`);

  const seen = new Set<string>();
  const sources = ranked
    .filter((candidate) => candidate.score >= top.score * 0.4)
    .map((candidate) => candidate.doc)
    .filter((doc) => (seen.has(doc.url) ? false : (seen.add(doc.url), true)))
    .slice(0, 3)
    .map(toSource);

  const followUps = ranked
    .map((candidate) => candidate.doc.question)
    .filter((question): question is string => Boolean(question))
    .filter((question) => !asked.has(question.toLowerCase()) && question !== top.doc.question)
    .filter((question, index, list) => list.indexOf(question) === index)
    .slice(0, 3);

  for (const fallback of DEFAULT_FOLLOW_UPS) {
    if (followUps.length >= 3) break;
    if (!followUps.includes(fallback) && !asked.has(fallback.toLowerCase())) followUps.push(fallback);
  }

  return { text: paragraphs.join('\n\n'), sources, followUps };
}
