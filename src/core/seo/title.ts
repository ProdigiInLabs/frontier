import type { RouteEntry } from '@/routing/manifest';

export const BRAND_SUFFIX = ' | Prodigi';

/** Kept separate from head.ts so the client can set titles without loading schema content. */
export function formatTitle(route: RouteEntry): string {
  return route.page === 'home' ? route.meta.title : `${route.meta.title}${BRAND_SUFFIX}`;
}
