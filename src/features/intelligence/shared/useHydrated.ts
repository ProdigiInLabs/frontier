import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during prerender and the hydration pass, true afterwards.
 * Use it to gate output that depends on browser-only state (URL query,
 * storage, feature detection) so hydration always matches the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
