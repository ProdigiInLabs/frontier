import { createElement, lazy } from 'react';
import type { ComponentType } from 'react';

export interface LazyPage {
  (): React.ReactElement;
  preload: () => Promise<void>;
}

/**
 * Route-level code splitting with preloading.
 * Once a chunk has been preloaded (before hydration, or on link hover), the
 * page renders synchronously — no Suspense flash and no hydration mismatch.
 */
export function lazyPage(loader: () => Promise<{ default: ComponentType }>): LazyPage {
  let loaded: ComponentType | undefined;
  let pending: Promise<void> | undefined;

  const preload = () =>
    (pending ??= loader().then((mod) => {
      loaded = mod.default;
    }));

  const Lazy = lazy(async () => {
    await preload();
    return { default: loaded! };
  });

  const Page = (() => (loaded ? createElement(loaded) : createElement(Lazy))) as LazyPage;
  Page.preload = preload;
  return Page;
}
