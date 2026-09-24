import type { KnowledgeDoc } from './knowledge';

/**
 * Small BM25 retriever with light stemming and synonym expansion.
 * Stands in for a vector store; a production backend would use embeddings.
 */

const STOPWORDS = new Set(
  'a an and are as at be by can do does for from how i in is it its me my of on or our so that the their them this to us we what when where which who why will with you your about into than then there these those should would could also just any all get got has have having been being was were'.split(' '),
);

const SYNONYMS: Record<string, string[]> = {
  ai: ['intelligence', 'artificial'],
  bot: ['chat', 'chatbot'],
  chatbot: ['chat', 'conversational'],
  llm: ['model', 'language'],
  gpt: ['model'],
  claude: ['model'],
  rag: ['retrieval', 'augmented', 'generation'],
  crm: ['customer', 'system'],
  erp: ['system', 'operations'],
  app: ['application'],
  apps: ['application'],
  website: ['web', 'site'],
  site: ['web', 'website'],
  ecommerce: ['commerce', 'store'],
  shop: ['commerce', 'store'],
  legacy: ['modernization', 'existing'],
  modernise: ['modernization'],
  modernize: ['modernization'],
  seo: ['search', 'visibility'],
  aeo: ['answer', 'engine'],
  geo: ['generative', 'engine'],
  price: ['cost'],
  pricing: ['cost'],
  cost: ['price'],
  start: ['begin', 'discovery'],
  begin: ['start'],
  secure: ['security'],
  safe: ['security'],
  voice: ['speech', 'spoken'],
  agent: ['agents', 'task'],
  automate: ['automation', 'workflow'],
  integrate: ['integration', 'connect'],
  connect: ['integration'],
};

export function stem(token: string): string {
  if (token.length <= 3) return token;
  let t = token;
  if (t.endsWith('ies') && t.length > 4) t = `${t.slice(0, -3)}y`;
  else if (t.endsWith('sses')) t = t.slice(0, -2);
  else if (t.endsWith('s') && !t.endsWith('ss') && !t.endsWith('us')) t = t.slice(0, -1);
  t = t.replace(/(ization|isation)$/, 'ize').replace(/ation$/, 'ate').replace(/ated$/, 'ate');
  if (t.length > 5) t = t.replace(/ing$/, '');
  return t;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function expand(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const t of tokens) {
    out.add(stem(t));
    for (const s of SYNONYMS[t] ?? []) out.add(stem(s));
  }
  return [...out];
}

interface Indexed {
  doc: KnowledgeDoc;
  tf: Map<string, number>;
  titleTerms: Set<string>;
  length: number;
}

export interface Ranked {
  doc: KnowledgeDoc;
  score: number;
  matched: string[];
}

export class Retriever {
  private readonly items: Indexed[];
  private readonly df = new Map<string, number>();
  private readonly avgLength: number;

  constructor(docs: KnowledgeDoc[]) {
    this.items = docs.map((doc) => {
      const terms = tokenize(doc.body).map(stem);
      const tf = new Map<string, number>();
      for (const term of terms) tf.set(term, (tf.get(term) ?? 0) + 1);
      for (const term of tf.keys()) this.df.set(term, (this.df.get(term) ?? 0) + 1);
      return { doc, tf, titleTerms: new Set(tokenize(doc.title).map(stem)), length: terms.length };
    });
    this.avgLength = this.items.reduce((sum, item) => sum + item.length, 0) / Math.max(this.items.length, 1);
  }

  search(query: string, { limit = 8, category }: { limit?: number; category?: string } = {}): Ranked[] {
    const raw = tokenize(query);
    const terms = expand(raw);
    if (!terms.length) return [];
    const N = this.items.length;
    const k1 = 1.4;
    const b = 0.72;
    const ranked: Ranked[] = [];

    for (const item of this.items) {
      if (category && item.doc.category !== category) continue;
      let score = 0;
      const matched: string[] = [];
      for (const term of terms) {
        const f = item.tf.get(term);
        if (!f) continue;
        const df = this.df.get(term) ?? 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * item.length) / this.avgLength)));
        if (item.titleTerms.has(term)) score += idf * 0.9;
        matched.push(term);
      }
      if (score > 0) ranked.push({ doc: item.doc, score, matched });
    }

    ranked.sort((a, b2) => b2.score - a.score);
    return ranked.slice(0, limit);
  }
}
