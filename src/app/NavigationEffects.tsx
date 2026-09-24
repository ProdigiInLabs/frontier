import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/**
 * Accessible client-side navigation:
 * - scrolls to top (or to the #hash target) after a route change
 * - moves focus to <main> so keyboard/screen-reader users start at the content
 * - announces the new page title through a polite live region
 */
export function NavigationEffects() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (target) {
        target.scrollIntoView();
      } else {
        window.scrollTo({ top: 0 });
        document.getElementById('main')?.focus({ preventScroll: true });
      }
      setAnnouncement(document.title);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
