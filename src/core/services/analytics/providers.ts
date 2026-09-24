import type { AppConfig } from '@/core/config/env';
import type { AnalyticsAdapter } from './types';

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  posthog?: { capture: (e: string, p?: object) => void; init: (k: string, o: object) => void };
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function ga4(id: string): AnalyticsAdapter {
  const w = window as Win;
  return {
    async init() {
      w.dataLayer = w.dataLayer || [];
      w.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
      w.gtag('js', new Date());
      // SPA: page views are sent explicitly on route change.
      w.gtag('config', id, { send_page_view: false, anonymize_ip: true });
      await loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
    },
    page(path, title) {
      w.gtag?.('event', 'page_view', { page_path: path, page_title: title, page_location: window.location.href });
    },
    track(event, props) {
      w.gtag?.('event', event, props);
    },
  };
}

function clarity(id: string): AnalyticsAdapter {
  const w = window as Win;
  return {
    async init() {
      const queue = function clarityQueue(...args: unknown[]) {
        (queue.q = queue.q || []).push(args);
      } as NonNullable<Win['clarity']>;
      w.clarity = w.clarity || queue;
      await loadScript(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`);
    },
    page() {
      /* Clarity records navigation automatically. */
    },
    track(event) {
      w.clarity?.('event', event);
    },
  };
}

function posthog(key: string, host: string): AnalyticsAdapter {
  const w = window as Win;
  return {
    async init() {
      await loadScript(`${host.replace('.i.posthog.com', '-assets.i.posthog.com')}/static/array.js`);
      w.posthog?.init(key, { api_host: host, capture_pageview: false, persistence: 'localStorage' });
    },
    page(path, title) {
      w.posthog?.capture('$pageview', { $current_url: window.location.href, path, title });
    },
    track(event, props) {
      w.posthog?.capture(event, props);
    },
  };
}

/** Returns null when no provider is configured — nothing loads, nothing tracks. */
export function createAdapter(analytics: AppConfig['analytics']): AnalyticsAdapter | null {
  switch (analytics.provider) {
    case 'ga4':
      return analytics.gaMeasurementId ? ga4(analytics.gaMeasurementId) : null;
    case 'clarity':
      return analytics.clarityProjectId ? clarity(analytics.clarityProjectId) : null;
    case 'posthog':
      return analytics.posthogKey ? posthog(analytics.posthogKey, analytics.posthogHost) : null;
    default:
      return null;
  }
}
