import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { resolveRoute } from '@/routing/manifest';

/**
 * Keeps <head> in sync on client-side navigation. The prerendered HTML
 * already contains the right tags for the first page, so the head builder
 * (and the FAQ/schema content it needs) is loaded lazily on first navigation.
 */
export function RouteHead() {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      if (document.head.querySelector('[data-head="route"]')) return;
    }
    let cancelled = false;
    void import('./head').then(({ applyHeadToDocument, buildHead }) => {
      if (!cancelled) applyHeadToDocument(buildHead(resolveRoute(pathname), pathname));
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
