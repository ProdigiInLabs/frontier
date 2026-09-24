import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { analytics } from './analytics-service';

/** Sends a page view on every client-side route change. */
export function usePageViews(): void {
  const { pathname } = useLocation();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    // Wait a frame so RouteHead has updated document.title.
    const frame = requestAnimationFrame(() => analytics.page(pathname, document.title));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
}
