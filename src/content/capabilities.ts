import type { CapabilityPage } from './types';

/**
 * Detail pages rendered by the shared CapabilityPage template.
 * Adding a page here adds its route, navigation eligibility, metadata,
 * Service + Breadcrumb + FAQ schema and sitemap entry.
 */
export const capabilityPages: CapabilityPage[] = [
  // ======================= PRODUCT =======================
  {
    path: '/product/engineering',
    pillar: 'product',
    navLabel: 'Product engineering',
    eyebrow: 'Product · Engineering',
    title: 'Engineering that holds up after launch.',
    lead: 'Web and mobile applications, SaaS platforms and APIs — designed around how the product will grow, not just how it will demo.',
    seo: {
      title: 'Product Engineering — Web, Mobile, SaaS, APIs & Cloud',
      description:
        'Prodigi engineers web applications, mobile apps, SaaS platforms, APIs and cloud backends with architecture, security and performance designed in from the start.',
    },
    serviceType: 'Software product engineering',
    definition: {
      question: 'What is product engineering?',
      answer:
        'Product engineering is designing and building software as a product that will keep evolving — covering user experience, architecture, backend, infrastructure, security and delivery together — rather than delivering a one-off project. The goal is software that stays fast, safe and changeable as users and requirements grow.',
    },
    offerings: {
      title: 'What we engineer',
      items: [
        { title: 'Web applications', description: 'Complex, data-heavy interfaces in Angular or React with typed, testable architecture.' },
        { title: 'Mobile applications', description: 'React Native apps for iOS and Android with native integrations, deep linking and over-the-air release strategies.' },
        { title: 'SaaS platforms', description: 'Multi-tenant architecture, subscriptions, roles and permissions, dashboards and usage analytics.' },
        { title: 'API platforms', description: 'REST and event-driven APIs with versioning, authentication, rate limiting and documentation.' },
        { title: 'Backend engineering', description: 'Node.js and Python services, background jobs, scheduled processing and data pipelines.' },
        { title: 'Cloud architecture', description: 'Infrastructure sized to real load, with environments, secrets management and cost visibility.' },
        { title: 'Microservices', description: 'Service boundaries drawn around the business domain — only where they reduce complexity.' },
        { title: 'DevOps', description: 'CI/CD pipelines, containerization, automated testing and repeatable deployments.' },
        { title: 'Security', description: 'Authentication, authorization, input validation, dependency hygiene and least-privilege access.' },
        { title: 'Performance', description: 'Query and index optimization, caching strategy, bundle budgets and Core Web Vitals.' },
      ],
    },
    visual: 'product-architecture',
    process: {
      title: 'How a product gets built',
      steps: [
        { title: 'Discover', description: 'Clarify users, the core job the product does and what success looks like.' },
        { title: 'Shape', description: 'UX flows, architecture decisions and a delivery plan sized to the first release.' },
        { title: 'Build', description: 'Short iterations with working software reviewed every cycle.' },
        { title: 'Launch', description: 'Production hardening: monitoring, security review, performance and rollback plans.' },
        { title: 'Evolve', description: 'Measure real usage, then prioritize what the data says matters.' },
      ],
    },
    secondaryAction: { label: 'See what we build', to: '/work' },
    faqIds: ['can-prodigi-work-with-existing-systems', 'how-does-an-engagement-start', 'how-much-does-it-cost'],
    related: ['/product/modernization', '/intelligence/integrations', '/digital/web'],
    cta: { title: 'Have an idea that needs to become a product?', text: 'Tell us what it should do and who it is for.', topic: 'build-product' },
  },
  {
    path: '/product/modernization',
    pillar: 'product',
    navLabel: 'Modernization',
    eyebrow: 'Product · Modernization',
    title: 'Modernize without starting over.',
    lead: 'Most systems are worth more than their code suggests. We keep what works, replace what holds you back and move you forward without a risky big-bang rewrite.',
    seo: {
      title: 'Application Modernization — Incremental, Low-Risk Upgrades',
      description:
        'Prodigi modernizes legacy applications step by step: architecture assessment, API layers, framework upgrades, cloud migration and performance improvements without a full rewrite.',
    },
    serviceType: 'Application modernization',
    definition: {
      question: 'What is application modernization?',
      answer:
        'Application modernization is improving an existing system’s architecture, technology and user experience so it becomes easier to change, cheaper to run and ready to integrate — usually incrementally, by wrapping old parts in APIs and replacing them one at a time, rather than rewriting everything at once.',
    },
    offerings: {
      title: 'What modernization covers',
      items: [
        { title: 'Architecture assessment', description: 'A clear map of what the system does, where it hurts and what is worth keeping.' },
        { title: 'API enablement', description: 'Put stable APIs in front of legacy components so new products and AI can use them.' },
        { title: 'Incremental migration', description: 'Replace components one at a time behind the same interface — the strangler pattern.' },
        { title: 'Framework and platform upgrades', description: 'Move to supported framework and runtime versions with test coverage as a safety net.' },
        { title: 'Cloud migration', description: 'Move workloads to managed infrastructure where it lowers cost or operational risk.' },
        { title: 'Data modernization', description: 'Schema redesign, indexing and migration of data into structures that serve current needs.' },
        { title: 'UX modernization', description: 'Redesign high-friction workflows without retraining everyone on a new product at once.' },
        { title: 'Performance recovery', description: 'Find and fix the bottlenecks that users and infrastructure bills are feeling.' },
      ],
    },
    visual: 'modernization-path',
    process: {
      title: 'A modernization path that limits risk',
      steps: [
        { title: 'Assess', description: 'Inventory components, dependencies, data and pain points.' },
        { title: 'Stabilize', description: 'Add tests, monitoring and a deployment pipeline before changing anything important.' },
        { title: 'Wrap', description: 'Expose legacy capabilities through clean APIs.' },
        { title: 'Replace', description: 'Rebuild the highest-value components behind those APIs, one at a time.' },
        { title: 'Retire', description: 'Switch off what is no longer used, and keep the system continuously shippable.' },
      ],
    },
    secondaryAction: { label: 'Enterprise AI integration', to: '/intelligence/integrations' },
    faqIds: ['can-prodigi-work-with-existing-systems', 'what-is-ai-integration', 'how-does-an-engagement-start'],
    related: ['/product/engineering', '/intelligence/integrations', '/intelligence/automation'],
    cta: { title: 'Is your application slowing the business down?', text: 'Describe the system and where it hurts. We’ll suggest where to begin.', topic: 'modernize' },
  },

  // ======================= DIGITAL =======================
  {
    path: '/digital/web',
    pillar: 'digital',
    navLabel: 'Websites & e-commerce',
    eyebrow: 'Digital · Web',
    title: 'Websites that do a job.',
    lead: 'Corporate sites, e-commerce and product marketing that load fast, explain clearly and move visitors toward a decision.',
    seo: {
      title: 'Websites & E-commerce — Fast, Accessible, Built to Convert',
      description:
        'Prodigi designs and builds business websites, e-commerce stores and landing pages with strong information architecture, accessibility, performance and conversion in mind.',
    },
    serviceType: 'Website and e-commerce development',
    definition: {
      question: 'What makes a business website effective?',
      answer:
        'An effective business website makes it obvious within seconds what the business does and for whom, answers the questions a buyer has in the order they have them, loads quickly on a phone, is accessible to everyone and gives every visitor a clear next step. Visual design supports those goals; it does not replace them.',
    },
    offerings: {
      title: 'What we build',
      items: [
        { title: 'Business websites', description: 'Clear positioning, structured content and a site that can grow with the business.' },
        { title: 'E-commerce', description: 'Product discovery, catalogue structure, checkout flow and integration with inventory and payments.' },
        { title: 'Landing pages', description: 'Focused pages for campaigns and launches, built to be measured and iterated.' },
        { title: 'UX/UI design', description: 'Information architecture, interaction design and a reusable design system.' },
        { title: 'Headless and static architectures', description: 'Pre-rendered, cache-friendly sites that can be hosted almost anywhere.' },
        { title: 'Accessibility', description: 'Semantic markup, keyboard support, contrast and screen-reader testing as standard.' },
        { title: 'Digital transformation', description: 'Move manual customer-facing processes — enquiries, bookings, onboarding — online.' },
      ],
    },
    process: {
      title: 'How a site comes together',
      steps: [
        { title: 'Positioning', description: 'Agree what the site must communicate and who it is for.' },
        { title: 'Architecture', description: 'Pages, navigation and content model mapped to buyer questions.' },
        { title: 'Design system', description: 'Typography, components and patterns that keep every page consistent.' },
        { title: 'Build', description: 'Performance budgets, SEO foundations and accessibility built in.' },
        { title: 'Measure', description: 'Analytics and experiments that show what to improve next.' },
      ],
    },
    faqIds: ['what-is-seo', 'seo-vs-aeo-vs-geo', 'how-much-does-it-cost'],
    related: ['/digital/seo', '/digital/marketing', '/product/engineering'],
    cta: { title: 'Does your website explain what you do?', text: 'Share the site and what you need it to achieve.', topic: 'improve-website' },
  },
  {
    path: '/digital/seo',
    pillar: 'digital',
    navLabel: 'SEO',
    eyebrow: 'Digital · SEO',
    title: 'Be found by the people already looking.',
    lead: 'Technical foundations, content architecture and measurement that make a site easy to crawl, understand and rank.',
    seo: {
      title: 'SEO Services — Technical SEO, Content Architecture & Measurement',
      description:
        'Prodigi improves search visibility with technical SEO, site architecture, structured data, content strategy and Core Web Vitals performance, measured against business outcomes.',
    },
    serviceType: 'Search engine optimization',
    definition: {
      question: 'What is SEO?',
      answer:
        'SEO (search engine optimization) is the work of making a website easy for search engines to crawl, understand and rank for the searches that matter to a business. It combines technical foundations, content that answers real questions and authority earned through relevance.',
    },
    offerings: {
      title: 'What SEO work includes',
      items: [
        { title: 'Technical audit', description: 'Crawlability, indexation, rendering, redirects, canonicalization and site speed.' },
        { title: 'Information architecture', description: 'URL structure, internal linking and topic clusters that reflect how customers search.' },
        { title: 'Structured data', description: 'Organization, Service, Product, Breadcrumb and FAQ schema where they are accurate.' },
        { title: 'Content strategy', description: 'Pages planned around real search intent, not keyword density.' },
        { title: 'Core Web Vitals', description: 'Loading, interactivity and layout stability tuned on real devices.' },
        { title: 'Measurement', description: 'Search Console and analytics reporting tied to leads and revenue, not just rankings.' },
      ],
    },
    visual: 'visibility-stack',
    secondaryAction: { label: 'Clear answers, by example', to: '/resources' },
    faqIds: ['seo-vs-aeo-vs-geo', 'what-is-aeo'],
    related: ['/digital/aeo', '/digital/geo', '/digital/web'],
    cta: { title: 'Want to be found for the right searches?', text: 'Tell us which customers you need to reach.', topic: 'visibility' },
  },
  {
    path: '/digital/aeo',
    pillar: 'digital',
    navLabel: 'AEO',
    eyebrow: 'Digital · AEO',
    title: 'Become the answer, not just a result.',
    lead: 'Answer engine optimization structures your expertise so featured snippets, voice assistants and AI answers can quote you directly.',
    seo: {
      title: 'AEO — Answer Engine Optimization for Snippets, Voice & AI Answers',
      description:
        'Answer engine optimization (AEO) by Prodigi: question-led content, clear definitions, FAQ and structured data that help answer engines extract and cite your business.',
    },
    serviceType: 'Answer engine optimization',
    definition: {
      question: 'What is AEO (answer engine optimization)?',
      answer:
        'AEO (answer engine optimization) is structuring content so that answer engines — featured snippets, voice assistants and AI answers — can extract a direct, correct answer from it. It relies on question-led headings, concise definitions, consistent terminology and structured data.',
    },
    offerings: {
      title: 'How we approach AEO',
      items: [
        { title: 'Question research', description: 'Find the exact questions customers ask before they buy.' },
        { title: 'Answer-first content', description: 'Lead every section with a direct, self-contained answer, then add depth.' },
        { title: 'Definitions and glossaries', description: 'Define your category and terms clearly and consistently.' },
        { title: 'FAQ and HowTo structure', description: 'Structured Q&A with matching schema where it reflects real content.' },
        { title: 'Voice readiness', description: 'Short, speakable answers for voice assistant queries.' },
        { title: 'Internal linking', description: 'Connect answers to deeper pages so engines understand relationships.' },
      ],
    },
    visual: 'visibility-stack',
    faqIds: ['seo-vs-aeo-vs-geo', 'what-is-geo'],
    related: ['/digital/geo', '/digital/seo', '/resources'],
    cta: { title: 'Do answer engines know what you do?', text: 'We’ll review how your expertise appears in answers today.', topic: 'visibility' },
  },
  {
    path: '/digital/geo',
    pillar: 'digital',
    navLabel: 'GEO',
    eyebrow: 'Digital · GEO',
    title: 'Be understood by generative AI.',
    lead: 'Generative engines compose answers from many sources. GEO makes sure your business is described correctly, consistently and citably.',
    seo: {
      title: 'GEO — Generative Engine Optimization for AI Search & Assistants',
      description:
        'Generative engine optimization (GEO) by Prodigi: clear entity definition, consistent descriptions, factual structured content and llms.txt so AI systems understand and cite your business.',
    },
    serviceType: 'Generative engine optimization',
    definition: {
      question: 'What is GEO (generative engine optimization)?',
      answer:
        'GEO (generative engine optimization) is making a business understandable and citable by generative AI systems that compose answers from many sources. It focuses on a clearly defined entity — who you are, what you do and for whom — described consistently, with factual content that models can trust and attribute.',
    },
    offerings: {
      title: 'What GEO involves',
      items: [
        { title: 'Entity definition', description: 'One precise statement of who you are, your category, capabilities and audience.' },
        { title: 'Consistency audit', description: 'Align how your business is described across your site, profiles and listings.' },
        { title: 'Citable content', description: 'Factual, specific pages with clear claims that can be attributed to you.' },
        { title: 'Structured data', description: 'Organization, Service and relationship markup that makes facts machine-readable.' },
        { title: 'AI-readable summaries', description: 'Machine-friendly site summaries such as llms.txt alongside your sitemap.' },
        { title: 'Monitoring', description: 'Track how AI assistants currently describe you and correct gaps at the source.' },
      ],
    },
    visual: 'visibility-stack',
    faqIds: ['seo-vs-aeo-vs-geo', 'what-is-aeo'],
    related: ['/digital/aeo', '/digital/seo', '/about'],
    cta: { title: 'How do AI assistants describe you today?', text: 'We’ll show you, and what to change.', topic: 'visibility' },
  },
  {
    path: '/digital/marketing',
    pillar: 'digital',
    navLabel: 'Growth & analytics',
    eyebrow: 'Digital · Growth',
    title: 'Growth you can measure.',
    lead: 'Content, social, digital marketing and marketing automation — connected to analytics and conversion work, so effort goes where it pays back.',
    seo: {
      title: 'Digital Marketing, Content, Analytics & Conversion Optimization',
      description:
        'Prodigi connects content, social media, digital marketing and marketing automation to analytics and conversion rate optimization, so growth decisions are based on evidence.',
    },
    serviceType: 'Digital marketing and conversion optimization',
    definition: {
      question: 'What is conversion rate optimization?',
      answer:
        'Conversion rate optimization (CRO) is improving the share of visitors who take a meaningful action — an enquiry, a sign-up, a purchase — by finding where people hesitate or drop off, forming a hypothesis, changing the experience and measuring the result.',
    },
    offerings: {
      title: 'What growth work covers',
      items: [
        { title: 'Content', description: 'Useful, specific content planned around what buyers need to decide.' },
        { title: 'Social media', description: 'Channel strategy and consistent publishing where your audience actually is.' },
        { title: 'Digital marketing', description: 'Paid and organic campaigns with clear targets and honest reporting.' },
        { title: 'Marketing automation', description: 'Lifecycle emails, lead routing and nurturing connected to your CRM.' },
        { title: 'Analytics', description: 'Event tracking, dashboards and attribution that answer real questions, with consent built in.' },
        { title: 'Conversion optimization', description: 'Funnel analysis, experiments and UX changes that remove friction.' },
      ],
    },
    faqIds: ['seo-vs-aeo-vs-geo', 'how-does-an-engagement-start'],
    related: ['/digital/web', '/digital/seo', '/intelligence/automation'],
    cta: { title: 'Want to know which channels actually work?', text: 'Tell us what you measure today.', topic: 'visibility' },
  },

  // ======================= INTELLIGENCE =======================
  {
    path: '/intelligence/ai-strategy',
    pillar: 'intelligence',
    navLabel: 'AI strategy',
    eyebrow: 'Intelligence · Strategy',
    title: 'Find where AI actually belongs.',
    lead: 'The business problem comes first. AI comes second. We help you find the few places where AI changes the outcome — and say so when it doesn’t.',
    seo: {
      title: 'AI Strategy & Discovery — Where Should AI Fit Your Business?',
      description:
        'Prodigi AI strategy: discover AI opportunities, prioritize use cases, choose architecture and models, and validate quality, cost, security and reliability before production.',
    },
    serviceType: 'AI strategy consulting',
    definition: {
      question: 'Where should a business start with AI?',
      answer:
        'Start with the business, not the model. List the decisions and repetitive tasks that cost the most time or money, check which have the data and risk tolerance for AI assistance, and pick one narrow, measurable use case. Prove it on quality, cost, security and reliability before expanding.',
    },
    offerings: {
      title: 'What an AI discovery covers',
      items: [
        { title: 'Opportunity mapping', description: 'Walk through workflows and find where language, judgement or scale are the bottleneck.' },
        { title: 'Use-case prioritization', description: 'Score opportunities on value, feasibility, data readiness and risk.' },
        { title: 'Architecture selection', description: 'Assistant, agent, search or automation — and which model and hosting fit.' },
        { title: 'Data readiness', description: 'Check that the knowledge and systems the AI needs are accessible and trustworthy.' },
        { title: 'Evaluation plan', description: 'Define how quality, cost, latency and safety will be measured before launch.' },
        { title: 'Roadmap', description: 'A sequenced plan from first prototype to production and scale.' },
      ],
    },
    visual: 'ai-journey',
    secondaryAction: { label: 'Explore Intelligence', to: '/intelligence' },
    faqIds: ['does-every-business-need-ai', 'which-ai-models', 'is-ai-data-secure'],
    related: ['/intelligence', '/intelligence/integrations', '/intelligence/automation'],
    cta: { title: 'Not sure where AI fits?', text: 'Describe your business and the work that slows it down. We’ll help you find the opportunity.', topic: 'integrate-ai' },
  },
  {
    path: '/intelligence/assistants',
    pillar: 'intelligence',
    navLabel: 'AI assistants',
    eyebrow: 'Intelligence · Assistants',
    title: 'AI that helps people work.',
    lead: 'Assistants that research, draft, summarize and report from your own knowledge — with people staying in control of the outcome.',
    seo: {
      title: 'AI Assistants for Research, Documents, Reporting & Knowledge',
      description:
        'Prodigi builds AI assistants grounded in your own documents and data for research, drafting, reporting, knowledge access and business insight, with access controls and sources.',
    },
    serviceType: 'AI assistant development',
    definition: {
      question: 'What is an AI assistant?',
      answer:
        'An AI assistant is an AI tool that helps a person do their own work — drafting, summarizing, researching, reporting or finding knowledge — while the person stays in control of the result. Assistants are usually grounded in a business’s own documents and data.',
    },
    offerings: {
      title: 'Where assistants help',
      items: [
        { title: 'Research', description: 'Gather and compare information across sources and summarize what matters.' },
        { title: 'Documents', description: 'Draft, review and extract from contracts, proposals, policies and reports.' },
        { title: 'Reporting', description: 'Turn structured data into readable summaries and recurring reports.' },
        { title: 'Knowledge', description: 'Answer internal questions from handbooks, wikis and past work, with sources.' },
        { title: 'Business insights', description: 'Ask questions of business data in plain language.' },
      ],
    },
    visual: 'assistant-workspace',
    useCases: {
      title: 'Design principles',
      items: [
        { title: 'Grounded', description: 'Answers cite the documents they came from.' },
        { title: 'Permissioned', description: 'People only see what they are already allowed to see.' },
        { title: 'Reviewable', description: 'Drafts are suggestions; people approve what leaves the building.' },
      ],
    },
    secondaryAction: { label: 'Try AI Chat', to: '/intelligence/chat' },
    faqIds: ['what-is-rag', 'is-ai-data-secure'],
    related: ['/intelligence/search', '/intelligence/chat', '/intelligence/agents'],
    cta: { title: 'Where does your team lose the most time?', text: 'We’ll show what an assistant could take off their plate.', topic: 'integrate-ai' },
  },
  {
    path: '/intelligence/automation',
    pillar: 'intelligence',
    navLabel: 'AI automation',
    eyebrow: 'Intelligence · Automation',
    title: 'Connect intelligence to the work itself.',
    lead: 'Rules handle what is predictable. AI handles what needs judgement. People approve what carries risk. Automation connects all three to your systems.',
    seo: {
      title: 'AI Automation — Intelligent Workflows Connected to Your Systems',
      description:
        'Prodigi designs AI automation that classifies, extracts and decides inside real business workflows, then triggers actions in existing systems with human approval where it matters.',
    },
    serviceType: 'AI workflow automation',
    definition: {
      question: 'What is AI automation?',
      answer:
        'AI automation uses AI inside a business workflow to make or support a decision that previously needed a person — classifying a request, extracting data from a document, choosing the next step — and then triggers the action through existing systems.',
    },
    offerings: {
      title: 'What gets automated',
      items: [
        { title: 'Intake and triage', description: 'Classify and route emails, tickets, forms and enquiries.' },
        { title: 'Document processing', description: 'Extract structured data from invoices, orders, contracts and forms.' },
        { title: 'Lead handling', description: 'Enrich, qualify and route leads into the CRM with context.' },
        { title: 'Reporting', description: 'Assemble, summarize and distribute recurring reports.' },
        { title: 'Scheduled processing', description: 'Background jobs that monitor data and act on changes.' },
        { title: 'Human-in-the-loop approvals', description: 'AI proposes, a person approves, the system executes.' },
      ],
    },
    visual: 'automation-flow',
    secondaryAction: { label: 'Run an agent', to: '/intelligence/agents' },
    faqIds: ['what-is-an-ai-agent', 'does-every-business-need-ai'],
    related: ['/intelligence/agents', '/intelligence/integrations', '/product/modernization'],
    cta: { title: 'Which workflow would you automate first?', text: 'Describe it step by step. We’ll show where AI fits and where it shouldn’t.', topic: 'automate' },
  },
  {
    path: '/intelligence/integrations',
    pillar: 'intelligence',
    navLabel: 'Enterprise integration',
    eyebrow: 'Intelligence · Enterprise integration',
    title: 'Connect intelligence to the systems you already use.',
    lead: 'AI should not live separately from the business. It should read from and act through your applications, data and tools — with the same controls as everything else.',
    seo: {
      title: 'Enterprise AI Integration — Connect AI to CRM, ERP, APIs & Data',
      description:
        'Prodigi connects AI models to CRMs, ERPs, databases, e-commerce platforms, internal tools, documents and knowledge bases through secure APIs, RAG and permissioned tools.',
    },
    serviceType: 'Enterprise AI integration',
    definition: {
      question: 'What is AI integration?',
      answer:
        'AI integration is connecting an AI model to the applications, data and workflows a business already runs, so it can use real context and take real actions. The AI reaches systems such as a CRM, ERP, database or knowledge base through controlled APIs and returns answers or actions inside existing tools.',
    },
    offerings: {
      title: 'What AI can connect to',
      items: [
        { title: 'APIs', description: 'Internal and third-party APIs exposed to the AI as permissioned tools.' },
        { title: 'CRM', description: 'Customer history, deals and activities as context — and as actions.' },
        { title: 'ERP', description: 'Orders, inventory, finance and operations data.' },
        { title: 'Databases', description: 'Read-only, query-scoped access to operational and analytical data.' },
        { title: 'Business applications', description: 'Line-of-business apps via their APIs or a new integration layer.' },
        { title: 'E-commerce', description: 'Catalogue, orders, customers and fulfilment.' },
        { title: 'Internal tools', description: 'Ticketing, messaging, scheduling and project tools.' },
        { title: 'Documents and knowledge bases', description: 'Policies, manuals, contracts and wikis via retrieval (RAG).' },
      ],
    },
    visual: 'integration-architecture',
    process: {
      title: 'Controls that come with every integration',
      steps: [
        { title: 'Server-side keys', description: 'Model and system credentials never reach a browser or device.' },
        { title: 'Least privilege', description: 'Each tool exposes only the operations the use case needs.' },
        { title: 'Human approval', description: 'Actions with consequences wait for a person.' },
        { title: 'Audit trail', description: 'Every request, tool call and result is logged.' },
        { title: 'Evaluation', description: 'Quality, cost and latency are measured continuously.' },
      ],
    },
    secondaryAction: { label: 'See the integration flow', to: '/demo/enterprise-ai' },
    faqIds: ['how-does-ai-integration-work', 'what-is-enterprise-ai', 'is-ai-data-secure', 'which-ai-models'],
    related: ['/demo/enterprise-ai', '/intelligence/agents', '/product/modernization'],
    cta: { title: 'Need AI connected to your systems?', text: 'Tell us which systems and what the AI should do with them.', topic: 'integrate-ai' },
  },
];

export const capabilityByPath = new Map(capabilityPages.map((page) => [page.path, page]));
