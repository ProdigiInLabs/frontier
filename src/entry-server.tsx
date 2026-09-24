/**
 * Build-time only. Consumed by scripts/prerender.mjs to render every route to
 * static HTML. Never deployed and never executed in a browser or on a server.
 */
import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import { App } from '@/app/App';
import { config } from '@/core/config/env';
import { buildHead, renderHeadToString } from '@/core/seo/head';
import { buildLlmsTxt, buildRobots, buildSitemap } from '@/core/seo/site-files';
import { notFoundRoute, redirects, resolveRoute, routes } from '@/routing/manifest';
import { pageModules } from '@/routing/page-modules';
import { pages } from '@/routing/routes';

export { redirects };
export const siteUrl = config.siteUrl;

export const prerenderPaths = [...routes.map((route) => route.path), notFoundRoute.path];

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let html = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
  }
  return html + decoder.decode();
}

export async function render(path: string): Promise<{ html: string; head: string; routePath: string; shell: string; pageModule: string }> {
  const route = resolveRoute(path);
  await pages[route.page].preload();
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={path}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  return {
    html: await streamToString(prelude),
    head: renderHeadToString(buildHead(route, path)),
    routePath: route.path,
    shell: route.shell,
    /** Source module of the page, for manifest lookup (CSS + modulepreload). */
    pageModule: pageModules[route.page].replace(/^\//, ''),
  };
}

export function siteFiles(lastmod: string) {
  return {
    'sitemap.xml': buildSitemap(config.siteUrl, lastmod),
    'robots.txt': buildRobots(config.siteUrl),
    'llms.txt': buildLlmsTxt(config.siteUrl),
  };
}
