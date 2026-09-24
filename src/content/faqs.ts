import type { Faq, FaqGroup } from './types';

/**
 * Answer-engine content. Every answer leads with a direct, self-contained
 * sentence so it can be quoted without surrounding context. Pages reference
 * these by id; /resources renders all of them. FAQPage schema is generated
 * from whichever ids a page renders.
 */
export const faqs: Faq[] = [
  // ---- Prodigi ----
  {
    id: 'what-is-prodigi',
    group: 'prodigi',
    question: 'What is Prodigi?',
    answer:
      'Prodigi is a product, digital and intelligence company. The name combines the three things it works on: Product, Digital and Intelligence. Prodigi designs and engineers digital products, modernizes existing applications, improves how businesses are found and experienced online, and connects AI to the systems a business already uses.',
    links: [{ label: 'About Prodigi', to: '/about' }],
  },
  {
    id: 'what-does-prodigi-do',
    group: 'prodigi',
    question: 'What does Prodigi do?',
    answer:
      'Prodigi helps businesses build, improve, modernize, connect and automate. In practice that means product engineering (web, mobile, SaaS, APIs, cloud), digital experience and visibility (websites, e-commerce, SEO, AEO, GEO, analytics), and applied intelligence (AI strategy, chat, assistants, agents, voice, search, automation and enterprise AI integration).',
    links: [
      { label: 'Product', to: '/product' },
      { label: 'Digital', to: '/digital' },
      { label: 'Intelligence', to: '/intelligence' },
    ],
  },
  {
    id: 'who-is-prodigi-for',
    group: 'prodigi',
    question: 'Who does Prodigi work with?',
    answer:
      'Prodigi works with businesses, startups and enterprises: founders turning an idea into a product, technology leaders modernizing or extending existing systems, business owners improving a digital business, marketing teams improving visibility, and teams that want to use AI but are not sure where it belongs.',
    links: [{ label: 'Solutions', to: '/solutions' }],
  },
  {
    id: 'how-is-prodigi-different',
    group: 'prodigi',
    question: 'How is Prodigi different from an AI agency or a web development company?',
    answer:
      'Prodigi treats product, digital and intelligence as one connected system rather than separate services. A product produces a digital experience, the experience produces data, data makes intelligence possible and intelligence enables automation. Prodigi can start at any of those stages, and it starts with the business problem rather than a particular technology.',
    links: [{ label: 'How the pieces connect', to: '/#value-chain' }],
  },
  {
    id: 'what-is-prodigi-intelligence',
    group: 'intelligence',
    question: 'What is Prodigi Intelligence?',
    answer:
      'Prodigi Intelligence is Prodigi’s applied AI practice and the interactive experiences on this site. It covers AI strategy, AI chat, AI assistants, AI agents, AI voice, AI search, AI automation and enterprise AI integration — helping a business decide where AI belongs, then designing, connecting and operating it.',
    links: [{ label: 'Prodigi Intelligence', to: '/intelligence' }],
  },

  // ---- Intelligence ----
  {
    id: 'what-is-ai-integration',
    group: 'intelligence',
    question: 'What is AI integration?',
    answer:
      'AI integration is connecting an AI model to the applications, data and workflows a business already runs, so the AI can use real context and take real actions. Instead of a standalone chatbot, an integrated AI reads from systems such as a CRM, ERP, database or knowledge base through controlled APIs, and returns answers or actions inside the tools people already use.',
    links: [{ label: 'Enterprise AI integration', to: '/intelligence/integrations' }],
  },
  {
    id: 'how-does-ai-integration-work',
    group: 'intelligence',
    question: 'How does AI integration work?',
    answer:
      'AI integration works in layers. A user or application sends a request to an orchestration layer; the orchestration layer calls an AI model with instructions and permitted tools; the model uses those tools — APIs, database queries or retrieval over documents (RAG) — to fetch business context; the result is checked against rules and returned as an answer or passed on as an action. Credentials, permissions and logging stay on the server side.',
    links: [{ label: 'See the architecture', to: '/intelligence/integrations' }],
  },
  {
    id: 'what-is-an-ai-agent',
    group: 'intelligence',
    question: 'What is an AI agent?',
    answer:
      'An AI agent is software that uses an AI model to plan and carry out a multi-step task: it interprets a goal, decides which steps and tools it needs, calls those tools, evaluates the results and continues until the task is done or it needs a human. Good agents work within explicit permissions and show their steps so people can review them.',
    links: [{ label: 'Explore AI agents', to: '/intelligence/agents' }],
  },
  {
    id: 'what-is-an-ai-assistant',
    group: 'intelligence',
    question: 'What is an AI assistant?',
    answer:
      'An AI assistant is an AI tool that helps a person do their own work — drafting, summarizing, researching, reporting or finding knowledge — while the person stays in control of the outcome. Assistants are usually grounded in a business’s own documents and data, and they are the most common first step into applied AI.',
    links: [{ label: 'AI assistants', to: '/intelligence/assistants' }],
  },
  {
    id: 'what-is-an-ai-chatbot',
    group: 'intelligence',
    question: 'What is an AI chatbot?',
    answer:
      'An AI chatbot is a conversational interface that uses a language model to understand questions in natural language and respond helpfully. Unlike scripted chatbots, it can handle open-ended questions; when it is grounded in approved content and connected to business systems, it can answer accurately and hand over to a person when it should.',
    links: [{ label: 'Try AI chat', to: '/intelligence/chat' }],
  },
  {
    id: 'what-is-ai-voice',
    group: 'intelligence',
    question: 'What is AI voice?',
    answer:
      'AI voice is a spoken interface to an AI system: speech is transcribed, understood by a language model, answered or acted on, and spoken back with synthesized speech. It is used for customer support lines, appointment handling, lead qualification and hands-free assistants.',
    links: [{ label: 'AI voice', to: '/intelligence/voice' }],
  },
  {
    id: 'what-is-ai-search',
    group: 'intelligence',
    question: 'What is AI search?',
    answer:
      'AI search finds information by meaning rather than exact keywords, then uses a language model to turn the most relevant passages into a direct answer with its sources. It is typically built with semantic (vector) search and retrieval-augmented generation (RAG) over a business’s own documents, products or knowledge.',
    links: [{ label: 'AI search', to: '/intelligence/search' }],
  },
  {
    id: 'what-is-rag',
    group: 'intelligence',
    question: 'What is RAG (retrieval-augmented generation)?',
    answer:
      'Retrieval-augmented generation (RAG) is a pattern where relevant information is retrieved from a trusted source — documents, a database, a product catalogue — and given to a language model at the moment it answers. It keeps answers grounded in current business data and makes it possible to show where each answer came from.',
    links: [{ label: 'AI search', to: '/intelligence/search' }],
  },
  {
    id: 'what-is-ai-automation',
    group: 'intelligence',
    question: 'What is AI automation?',
    answer:
      'AI automation uses AI inside a business workflow to make or support a decision that previously needed a person — classifying a request, extracting data from a document, choosing the next step — and then triggers the action through existing systems. Rules handle what is predictable; AI handles what needs judgement; people approve what carries risk.',
    links: [{ label: 'AI automation', to: '/intelligence/automation' }],
  },
  {
    id: 'what-is-enterprise-ai',
    group: 'intelligence',
    question: 'What is enterprise AI?',
    answer:
      'Enterprise AI is AI deployed across an organization’s real systems with the controls a business needs: access permissions, data governance, security, audit trails, cost management and reliability monitoring. The model is only one part; most of the work is integrating it safely with existing applications and data.',
    links: [{ label: 'Enterprise AI integration', to: '/intelligence/integrations' }],
  },
  {
    id: 'where-to-start-with-ai',
    group: 'intelligence',
    question: 'Where should a business start with AI?',
    answer:
      'Start with the business, not the model. List the decisions and repetitive tasks that cost the most time or money, check which ones have the data and the tolerance for AI assistance, and pick one narrow, measurable use case. Prove it works on quality, cost, security and reliability before expanding.',
    links: [{ label: 'AI strategy', to: '/intelligence/ai-strategy' }],
  },
  {
    id: 'does-every-business-need-ai',
    group: 'intelligence',
    question: 'Does every business process need AI?',
    answer:
      'No. Many problems are better solved with a clearer process, a better interface or ordinary automation. AI is worth using where a task needs language understanding, judgement over unstructured information, or personalization at a scale people cannot provide. Prodigi recommends against AI where a simpler solution works.',
  },
  {
    id: 'is-ai-data-secure',
    group: 'intelligence',
    question: 'How is business data kept secure when using AI?',
    answer:
      'By keeping AI behind a backend the business controls. Provider keys and credentials live on the server, never in a browser or app; the AI only reaches data through permissioned APIs; sensitive fields can be filtered before they reach a model; and requests are logged for audit. Model and hosting choices can follow data-residency requirements.',
  },
  {
    id: 'which-ai-models',
    group: 'intelligence',
    question: 'Which AI models does Prodigi work with?',
    answer:
      'Prodigi designs model-independent architectures, so the model can be chosen per use case and changed later. Solutions can use models from providers such as Anthropic (Claude), OpenAI, Google (Gemini) or Azure AI, or open models, depending on quality, cost, latency and data requirements.',
  },

  // ---- Visibility ----
  {
    id: 'what-is-seo',
    group: 'visibility',
    question: 'What is SEO?',
    answer:
      'SEO (search engine optimization) is the work of making a website easy for search engines to crawl, understand and rank for the searches that matter to a business. It covers technical foundations (speed, structure, indexability), content that answers real questions, and authority built through relevance and links.',
    links: [{ label: 'SEO', to: '/digital/seo' }],
  },
  {
    id: 'what-is-aeo',
    group: 'visibility',
    question: 'What is AEO (answer engine optimization)?',
    answer:
      'AEO (answer engine optimization) is structuring content so that answer engines — featured snippets, voice assistants and AI answers — can extract a direct, correct answer from it. It relies on clear question-and-answer content, concise definitions, consistent terminology and structured data such as FAQ schema.',
    links: [{ label: 'AEO', to: '/digital/aeo' }],
  },
  {
    id: 'what-is-geo',
    group: 'visibility',
    question: 'What is GEO (generative engine optimization)?',
    answer:
      'GEO (generative engine optimization) is making a business understandable and citable by generative AI systems that compose answers from many sources. It focuses on a clearly defined entity — who you are, what you do, for whom — described consistently across your site and the web, with factual, well-structured content that models can trust.',
    links: [{ label: 'GEO', to: '/digital/geo' }],
  },
  {
    id: 'seo-vs-aeo-vs-geo',
    group: 'visibility',
    question: 'What is the difference between SEO, AEO and GEO?',
    answer:
      'SEO helps you rank in search results, AEO helps you become the direct answer, and GEO helps you be understood and cited by generative AI. They share the same foundation — a fast, well-structured site with trustworthy content — and are most effective when planned together.',
    links: [{ label: 'Digital visibility', to: '/digital' }],
  },

  // ---- Engagement ----
  {
    id: 'how-does-an-engagement-start',
    group: 'engagement',
    question: 'How does working with Prodigi start?',
    answer:
      'With a conversation about what you are trying to accomplish. Prodigi then proposes the smallest useful first step — a discovery sprint, a prototype, an audit or a scoped build — with clear outcomes, before any larger commitment.',
    links: [{ label: 'Start a conversation', to: '/contact' }],
  },
  {
    id: 'can-prodigi-work-with-existing-systems',
    group: 'engagement',
    question: 'Can Prodigi work with our existing technology?',
    answer:
      'Yes. Most work involves existing systems: extending an application, modernizing it step by step, integrating it with other platforms through APIs, or connecting AI to it. Prodigi assesses what is worth keeping before recommending anything is replaced.',
    links: [
      { label: 'Modernization', to: '/product/modernization' },
      { label: 'Enterprise AI integration', to: '/intelligence/integrations' },
    ],
  },
  {
    id: 'how-much-does-it-cost',
    group: 'engagement',
    question: 'How much does a project cost?',
    answer:
      'It depends on scope, and Prodigi does not publish fixed prices for custom work. After an initial conversation, Prodigi proposes a scoped first phase with a clear estimate, so the cost of the next decision is always known.',
    links: [{ label: 'Talk to Prodigi', to: '/contact' }],
  },
  {
    id: 'are-the-demos-real',
    group: 'engagement',
    question: 'Are the AI demos on this site connected to a real AI model?',
    answer:
      'Not by default. The chat, agent, search, voice and integration experiences run in demo mode on a local engine that uses this website’s own content and scripted steps, so they work without a backend and never touch real systems. The interfaces are built on the same service contracts a production AI backend would implement.',
    links: [{ label: 'Interactive demos', to: '/demo' }],
  },
];

const byId = new Map(faqs.map((faq) => [faq.id, faq]));

export function getFaqs(ids: readonly string[]): Faq[] {
  return ids.map((id) => {
    const faq = byId.get(id);
    if (!faq) throw new Error(`Unknown FAQ id: ${id}`);
    return faq;
  });
}

export const faqGroups: Record<FaqGroup, string> = {
  prodigi: 'About Prodigi',
  intelligence: 'AI and Prodigi Intelligence',
  visibility: 'Search, answer and generative visibility',
  engagement: 'Working with Prodigi',
};
