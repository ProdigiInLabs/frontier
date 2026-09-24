import { useLocation } from 'react-router';
import { resolveRoute } from './manifest';
import type { RouteEntry } from './manifest';

/** The manifest entry for the current URL — pages read their FAQ ids etc. from here. */
export function useRouteEntry(): RouteEntry {
  return resolveRoute(useLocation().pathname);
}
