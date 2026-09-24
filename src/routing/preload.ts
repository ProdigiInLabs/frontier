import { resolveRoute } from './manifest';
import type { PageKey } from './manifest';

type Preloader = (page: PageKey) => Promise<void>;

let preloader: Preloader | null = null;

/** routes.tsx registers the chunk loaders here (avoids an import cycle with links). */
export function registerPreloader(fn: Preloader): void {
  preloader = fn;
}

export function preloadRoute(to: string): Promise<void> {
  if (!preloader) return Promise.resolve();
  const path = to.split(/[?#]/)[0] || '/';
  return preloader(resolveRoute(path).page).catch(() => {
    /* a failed prefetch is retried on navigation */
  });
}
