/**
 * Typed, validated runtime configuration.
 *
 * All values come from VITE_* variables and are therefore PUBLIC — they are
 * compiled into the client bundle. This module is the only place that reads
 * import.meta.env; everything else depends on `config`.
 */

export type AnalyticsProvider = 'none' | 'ga4' | 'clarity' | 'posthog';

export interface AppConfig {
  siteUrl: string;
  /** True when AI experiences run on the local demo engine. */
  demoMode: boolean;
  /** Backend base URL, without trailing slash. Empty in demo mode. */
  apiUrl: string;
  contactEndpoint: string;
  contactEmail: string;
  analytics: {
    provider: AnalyticsProvider;
    gaMeasurementId: string;
    clarityProjectId: string;
    posthogKey: string;
    posthogHost: string;
  };
}

const env = import.meta.env;

const trimSlash = (value: string) => value.replace(/\/+$/, '');
const flag = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === '' ? fallback : value === 'true';

function parseProvider(value: string | undefined): AnalyticsProvider {
  return value === 'ga4' || value === 'clarity' || value === 'posthog' ? value : 'none';
}

function httpsUrlOrEmpty(value: string | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.hostname === 'localhost' ? trimSlash(url.toString()) : '';
  } catch {
    return '';
  }
}

const apiUrl = httpsUrlOrEmpty(env.VITE_API_URL);

export const config: AppConfig = {
  siteUrl: trimSlash(env.VITE_SITE_URL || 'https://prodiginl.com'),
  // Demo mode cannot be disabled without an API to talk to.
  demoMode: flag(env.VITE_DEMO_MODE, true) || apiUrl === '',
  apiUrl,
  contactEndpoint: httpsUrlOrEmpty(env.VITE_CONTACT_ENDPOINT),
  contactEmail: env.VITE_CONTACT_EMAIL || 'info@prodiginl.com',
  analytics: {
    provider: parseProvider(env.VITE_ANALYTICS_PROVIDER),
    gaMeasurementId: env.VITE_GA_MEASUREMENT_ID ?? '',
    clarityProjectId: env.VITE_CLARITY_PROJECT_ID ?? '',
    posthogKey: env.VITE_POSTHOG_KEY ?? '',
    posthogHost: trimSlash(env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'),
  },
};
