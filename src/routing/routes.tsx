import type { ComponentType } from 'react';
import { Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import { ApplicationShell } from '@/layout/application-shell/ApplicationShell';
import { MarketingShell } from '@/layout/marketing-shell/MarketingShell';
import { lazyPage } from './lazy-page';
import type { LazyPage } from './lazy-page';
import { redirects, routes } from './manifest';
import type { PageKey, Shell } from './manifest';
import { pageModules } from './page-modules';
import { registerPreloader } from './preload';

/**
 * Page key → lazily loaded feature (one chunk per page).
 * Future products plug in the same way, e.g. an authenticated workspace:
 *   manifest.ts:     { path: '/app/dashboard', page: 'workspace', shell: 'app', … }
 *   page-modules.ts: workspace: '/src/features/workspace/DashboardPage.tsx'
 * Dynamic collections (/products/:product, /solutions/:solution) follow the
 * capability pattern: content entries generate manifest entries.
 */
const modules = import.meta.glob<{ default: ComponentType }>('/src/features/**/*Page.tsx');

export const pages = Object.fromEntries(
  (Object.entries(pageModules) as [PageKey, string][]).map(([key, path]) => {
    const loader = modules[path];
    if (!loader) throw new Error(`Page module not found: ${path}`);
    return [key, lazyPage(loader)];
  }),
) as Record<PageKey, LazyPage>;

registerPreloader((page) => pages[page].preload());

const childrenFor = (shell: Shell): RouteObject[] =>
  routes
    .filter((route) => route.shell === shell)
    .map((route) => {
      const Page = pages[route.page];
      return { path: route.path, element: <Page /> };
    });

const NotFound = pages['not-found'];

export const routeObjects: RouteObject[] = [
  {
    element: <MarketingShell />,
    children: [
      ...childrenFor('marketing'),
      ...redirects.map((redirect) => ({ path: redirect.from, element: <Navigate to={redirect.to} replace /> })),
      { path: '*', element: <NotFound /> },
    ],
  },
  { element: <ApplicationShell />, children: childrenFor('app') },
];
