# Prodigi — Product · Digital · Intelligence

The Prodigi web platform: a premium corporate site, a technology showcase and interactive AI product experiences — one statically hosted React application on one domain.

- **Marketing mode** — `/`, `/product`, `/digital`, `/intelligence`, `/solutions`, `/work`, `/about`, `/resources`, `/contact` and the capability pages.
- **Product mode** — `/intelligence/chat`, `/intelligence/agents`, `/intelligence/search`, `/intelligence/voice`, `/demo/enterprise-ai`, inside a dedicated application shell.

Every route is **prerendered to static HTML at build time**, then hydrated by React. No Node.js server is needed in production.

## Quick start

```bash
npm ci
npm run dev          # http://localhost:5173 (client-rendered dev server)
```

Requires Node.js ≥ 20.19.

## Build

```bash
npm run build
```

```
npm run build
  ├─ vite build                    → dist/  (index.html template + hashed assets)
  ├─ vite build --ssr              → dist-ssr/  (build-time renderer, deleted afterwards)
  └─ node scripts/prerender.mjs    → dist/**/index.html for every route
                                     dist/404.html, redirect pages
                                     dist/sitemap.xml, robots.txt, llms.txt
                                     dist/_redirects, staticwebapp.config.json, .htaccess
```

Deploy the **`dist/`** folder. Its root is `dist/index.html`; each route is written as both `dist/<route>.html` and `dist/<route>/index.html` (e.g. `dist/intelligence/chat.html`), so every host serves the slash-less canonical URL directly.

Preview the production build exactly as a static host serves it:

```bash
node scripts/serve-dist.mjs      # http://localhost:4173
```

## Hosting

| Host | What to do |
| --- | --- |
| **GitHub Pages** (current: `prodiginl.com`) | `.github/workflows/deploy-pages.yml` builds and publishes `dist/`. One-time: *Settings → Pages → Source: GitHub Actions*. `CNAME` is in `public/`. |
| **Azure Static Web Apps** | App location `/`, output location `dist`, build command `npm run build`. `dist/staticwebapp.config.json` is generated (redirects, 404, headers). |
| **Azure Blob static website** | Upload `dist/` to `$web`. Index document `index.html`, error document `404.html`. |
| **Cloudflare Pages** / **Netlify** | Build `npm run build`, output `dist`. `dist/_redirects` is generated; `404.html` is picked up automatically. |
| **Vercel** | `vercel.json` sets build, output, clean URLs and redirects. |
| **Nginx** | See `deploy/nginx.conf` (`try_files $uri $uri.html $uri/index.html =404; error_page 404 /404.html`). |
| **Apache** | `dist/.htaccess` is generated (clean URLs, 301s, 404, caching). Requires `mod_rewrite`. |
| **Any other static host** | Serve `dist/`. Directory index `index.html`; set the 404 page to `404.html`. |

**SPA fallback.** Because every route is a real file, most hosts need no rewrite at all. `404.html` is also a full app shell: if a host serves it for a valid client route it renders that route instead of hydrating the 404 markup. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Configuration

Copy `.env.example` to `.env.local`. All `VITE_*` values are **public** (compiled into JavaScript) — never put secrets there.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_SITE_URL` | `https://prodiginl.com` | Canonical URLs, Open Graph, sitemap, schema |
| `VITE_DEMO_MODE` | `true` | AI experiences use the local demo engine |
| `VITE_API_URL` | *(empty)* | Backend implementing `POST /api/ai/{chat,agent,search,voice}`; required to leave demo mode |
| `VITE_CONTACT_ENDPOINT` | *(empty)* | JSON endpoint for the contact form; otherwise it composes an email |
| `VITE_CONTACT_EMAIL` | `info@prodiginl.com` | Contact address |
| `VITE_ANALYTICS_PROVIDER` | `none` | `ga4` \| `clarity` \| `posthog` — loaded only after consent |

## Quality checks

```bash
npm run typecheck    # TypeScript (strict)
npm run lint         # ESLint incl. jsx-a11y and React hooks rules
npm test             # Vitest: routes, links, SEO/schema, demo engine, API adapter
npm run build
npm run test:a11y    # axe-core (WCAG 2.1 AA) + console errors on every route, desktop & mobile
```

`npm run check` runs typecheck, lint, tests and build together.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — audit of the previous site, framework decision, structure, routing, design system, SEO/AEO/GEO.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — build output and per-host setup.
- [docs/AI-API.md](docs/AI-API.md) — the contract a production AI backend implements.
