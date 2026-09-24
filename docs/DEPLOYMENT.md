# Deployment

## Build

```bash
npm ci
npm run build        # → dist/
```

`dist/` is the complete website. It contains only static files:

```
dist/
├── index.html                    # /
├── 404.html                      # not found (status 404) — also a full SPA fallback
├── product.html                  # /product
├── product/index.html            # /product (directory form, for hosts that prefer it)
├── product/engineering.html
├── intelligence/chat.html        # product-mode experience, prerendered shell
├── demo/ai-chat.html             # redirect page → /intelligence/chat
├── assets/                       # hashed JS, CSS, fonts (cache forever)
├── sitemap.xml  robots.txt  llms.txt
├── _redirects                    # Netlify / Cloudflare Pages
├── staticwebapp.config.json      # Azure Static Web Apps
├── .htaccess                     # Apache
└── CNAME  .nojekyll              # GitHub Pages
```

### Why each route is written twice

Static hosts map `/product` differently: some look for `product.html`, some for `product/index.html` and 301 to `/product/`. Writing both means every host serves the canonical, slash-less URL without a redirect.

### SPA fallback

No rewrite is required for any real route — each one is a file. `404.html` is the full application: when served for an unknown URL it renders the 404 page; if a host is configured to serve it for *every* missing file (a classic "SPA fallback"), it detects that the URL is a real client route and renders that route instead. So both configurations work.

Avoid configuring a fallback that returns `index.html` **with status 200** for unknown URLs: it creates soft-404s for search engines.

## Hosts

### GitHub Pages (current production: prodiginl.com)

1. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
2. Merge to `main`. `.github/workflows/deploy-pages.yml` runs tests, builds and publishes `dist/`.
3. `public/CNAME` keeps the custom domain; `public/.nojekyll` disables Jekyll processing.

> The previous site was a single `index.html` served from the repository root. After this change the repository root contains the **source** template, so Pages must deploy the built `dist/` via Actions — switch the Pages source *before* merging.

Optional repository **variables** (public values): `VITE_API_URL`, `VITE_DEMO_MODE`, `VITE_CONTACT_ENDPOINT`.

### Azure Static Web Apps

- App location: `/` · Output location: `dist` · Build command: `npm run build`
- `dist/staticwebapp.config.json` is generated: 301 redirects, `trailingSlash: never`, 404 override, security headers.

### Azure Blob Storage static website

- Enable *Static website*; index document `index.html`, error document `404.html`.
- Upload: `az storage blob upload-batch -s dist -d '$web' --overwrite`.
- Set `Cache-Control: public, max-age=31536000, immutable` on `assets/*` and `no-cache` on `*.html` (via `--content-cache-control` in two uploads, or Azure CDN / Front Door rules).

### Cloudflare Pages / Netlify

- Build command `npm run build`, output directory `dist`.
- `dist/_redirects` provides 301s; `404.html` is used automatically.

### Vercel

- `vercel.json` configures build, `outputDirectory: dist`, `cleanUrls`, `trailingSlash: false`, redirects and asset caching.

### Nginx

- `deploy/nginx.conf` — `try_files $uri $uri.html $uri/index.html =404; error_page 404 /404.html;`, 301 aliases, asset caching.

### Apache

- `dist/.htaccess` is generated (requires `mod_rewrite`; `mod_headers` for caching). `AllowOverride All` (or at least `FileInfo`) must be enabled for the document root.

## Environment per deployment

All configuration is build-time (`VITE_*`) and public. Set variables in the host's build settings or a `.env.production.local` file:

- Demo only (default): nothing to set.
- Real AI backend: `VITE_DEMO_MODE=false` and `VITE_API_URL=https://api.example.com`. The backend must allow CORS from the site origin (with credentials, if it uses session cookies).
- Contact endpoint: `VITE_CONTACT_ENDPOINT=https://…` (receives JSON). Without it the form composes an email to `VITE_CONTACT_EMAIL`.

## Local production preview

```bash
npm run build
node scripts/serve-dist.mjs     # behaves like a correctly configured static host
npm run test:a11y               # accessibility + console-error audit of every route
```
