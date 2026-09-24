# Architecture

## 1. Audit of the previous site

| Area | Found | Decision |
| --- | --- | --- |
| Framework / build | None. One hand-written `index.html` (≈38 KB, inline CSS + JS, canvas starfield). | Replace with a typed, componentized app. |
| Routing | Single page with `#hash` sections. | Real URLs per page, prerendered. |
| Hosting | GitHub Pages from the repository root, `CNAME` → `prodiginl.com`. | Kept: `CNAME` moved to `public/`; Pages now deploys `dist/` through Actions. |
| Analytics | GA4 tag loaded unconditionally on every visit. | Kept the same property, now behind a provider-agnostic service and loaded **only after consent**. |
| Contact | Every CTA was `mailto:info@prodiginl.com`. | Kept as the fallback channel of the new contact flow; an optional JSON endpoint can be configured. |
| Products | ProdigiOne and G-One described as flagship products. | Kept on `/work`, with claims about status, customers or scale removed. |
| Industries | Chip list of eight industries. | Kept as "technology patterns we can apply", not claimed experience. |
| SEO | Title, description, keywords meta only. No canonical, OG, schema, sitemap or robots. | Full technical SEO, AEO and GEO (below). |
| APIs / auth / env | None. | Service abstractions and typed env config, demo mode by default. |

## 2. Framework decision

**React 19 + TypeScript + Vite, with build-time prerendering.** There was no framework to preserve, so the choice was made on merit:

- The core requirement is static hosting with excellent SEO. Prerendering every route to HTML and hydrating gives crawlers and answer engines full content with no server.
- React's `react-dom/static` `prerender()` waits for lazy route chunks, so route-level code splitting and prerendering work together with a ~100-line script instead of a meta-framework.
- Smallest runtime of the options considered, and a mature ecosystem for the AI UI patterns (streaming, abort, portals).

Angular (with `@angular/ssr` static output) would also meet the requirements; it was not chosen because nothing in the repository depended on it and its baseline bundle is larger for a content-led site.

## 3. Structure

```
src/
├── app/                 App root, accessible navigation effects
├── core/
│   ├── config/          env.ts — the only reader of import.meta.env
│   ├── auth/            AuthProvider — authentication-ready seam (anonymous today)
│   ├── seo/             head builder, structured data, sitemap/robots/llms.txt, <RouteHead>
│   └── services/
│       ├── ai/          AI contracts, aiClient, http adapter, demo engine
│       ├── analytics/   consent-gated, provider-agnostic analytics
│       └── contact/     contact submission (endpoint or email)
├── routing/             manifest (all URLs + metadata), routes, lazy pages, preloading
├── layout/              navbar, footer, marketing-shell, application-shell, consent
├── shared/
│   ├── components/      design system: Button, Card, Badge, Tabs, Tooltip, Modal, Field, …
│   ├── sections/        reusable page sections: PageHero, ProblemNavigation, FaqSection, …
│   ├── visuals/         data-flow diagrams: SystemDiagram, IntegrationArchitecture, …
│   ├── hooks/  utils/
├── features/            one folder per page / experience (each is its own chunk)
│   ├── home  product  digital  capability  demos  solutions  work  about  resources  contact  not-found
│   └── intelligence/{overview, chat, agents, search, voice, integrations, shared}
├── content/             all copy and structured content (single source of truth)
└── styles/              tokens.css, base.css, utilities.css
```

## 4. Routing

- `src/routing/manifest.ts` lists every URL with its page key, shell, metadata, breadcrumb label, schema type and FAQ ids. It is pure data, consumed by the router, head management, prerenderer, sitemap and tests.
- Capability pages (`/product/engineering`, `/digital/seo`, `/intelligence/automation`, …) are generated from `src/content/capabilities.ts` and rendered by one template.
- Aliases (`/demo/ai-chat` → `/intelligence/chat`, …) are client redirects, static redirect pages and host 301 rules generated from the same list.
- **Adding a future product** (`/app/*`, `/products/:product`, `/solutions/:solution`): add manifest entries (or generate them from a content collection) and map the page key in `page-modules.ts`. Authenticated areas use the `app` shell and the `AuthProvider` seam; `robots.txt` already disallows `/app/`.

## 5. Two shells, one system

| | Marketing shell | Application shell |
| --- | --- | --- |
| Used by | Home, Product, Digital, Intelligence overview, capability pages, Solutions, Work, About, Resources, Contact, Demos | Chat, Agents, Search, Voice, Enterprise integration demo |
| Theme | Light (follows system dark mode) | Always dark — entering the product is a visible transition |
| Navigation | Global header with mega-menus; full-screen mobile sheet | Contextual Prodigi Intelligence sidebar; off-canvas on mobile; "Back to Prodigi" |
| Shared | Tokens, type, components, focus styles, analytics, head management, auth seam |

`/intelligence` includes an experience launcher styled like the app shell, so the move into `/intelligence/chat` is continuous.

## 6. Design system

- `src/styles/tokens.css` defines typography, spacing, containers, radius, borders, shadows, motion, z-index and colour (light + dark). Components use tokens only.
- Components use CSS Modules, co-located; there are no global component styles.
- Brand motif: three nodes — **Product** (build), **Digital** (connect), **Intelligence** (understand and automate) — joined by one line (logo, eyebrows, pillar accents, diagrams).
- Motion communicates data flow and progress only (diagram pulses, agent timeline, integration trace) and is disabled under `prefers-reduced-motion`.

## 7. SEO, AEO and GEO

- **Per route:** title, description, canonical, robots, Open Graph, Twitter card — built by `core/seo/head.ts` and written into static HTML at build time; updated on client navigation.
- **Structured data (JSON-LD `@graph`):** Organization and WebSite on every page; WebPage; Service on service pages; BreadcrumbList on nested pages; FAQPage built from the exact FAQ ids the page renders.
- **Files:** `sitemap.xml`, `robots.txt`, and `llms.txt` (a plain-language entity summary for generative engines).
- **AEO:** question-led headings, direct-answer-first definitions (`<Definition>`), FAQs rendered as native `<details>` (content always in the DOM), a central answer hub at `/resources`.
- **GEO:** one entity definition (`content/site.ts`) reused verbatim in copy, footer, Organization schema and `llms.txt`: entity, category, capabilities, audience, problem.

## 8. Performance

- Every page is a separate chunk; the current page's JS is preloaded and its CSS linked in the static HTML (no flash of unstyled content). Links prefetch on hover/focus.
- AI adapters are separate chunks loaded only inside AI experiences.
- Self-hosted variable fonts (`font-display: swap`, Latin subset preloaded). No third-party scripts load without consent. No images on the critical path — visuals are inline SVG/CSS.

## 9. Accessibility

Semantic landmarks, one `h1` per page, skip links, visible focus, WAI-ARIA tabs and disclosure menus, native `<dialog>`, labelled form fields with inline errors, live-region announcements for route changes and streaming AI output, reduced motion. `npm run test:a11y` runs axe-core on every route at desktop and mobile widths.

## 10. Analytics

`core/services/analytics` exposes `analytics.track()` / `page()`. Providers (GA4, Clarity, PostHog) are adapters selected by `VITE_ANALYTICS_PROVIDER`. Nothing loads until the visitor grants consent; events carry no message content or personal data.

## 11. Security

- No secrets in the frontend; all `VITE_*` values are public by definition and documented as such.
- AI provider credentials live only on the backend behind `VITE_API_URL`; the UI never renders raw errors.
- Demo code (`core/services/ai/demo/`) is isolated from the production adapter and from UI code.
- Contact form: honeypot, client validation; server-side validation belongs to the configured endpoint.
