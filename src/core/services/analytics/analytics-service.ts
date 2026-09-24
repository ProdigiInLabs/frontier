import { config } from '@/core/config/env';
import { readJson, writeJson } from '@/shared/utils/storage';
import { createAdapter } from './providers';
import type { AnalyticsAdapter, AnalyticsEventName, AnalyticsProps, ConsentState } from './types';

const CONSENT_KEY = 'prodigi.consent.analytics';

/**
 * Provider-agnostic analytics facade.
 *
 * - Components call `analytics.track(...)` and never know the provider.
 * - Nothing is loaded or sent until the visitor grants consent.
 * - Events before initialization are queued (bounded) and flushed on consent.
 */
class AnalyticsService {
  private adapter: AnalyticsAdapter | null = null;
  private ready = false;
  private queue: (() => void)[] = [];
  private listeners = new Set<() => void>();

  get enabled(): boolean {
    return config.analytics.provider !== 'none' && createAdapter(config.analytics) !== null;
  }

  get consent(): ConsentState {
    return readJson<ConsentState>(CONSENT_KEY, 'unset');
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Called once on the client. Starts the provider only if consent exists. */
  start(): void {
    if (this.enabled && this.consent === 'granted') void this.init();
  }

  setConsent(state: Exclude<ConsentState, 'unset'>): void {
    writeJson(CONSENT_KEY, state);
    if (state === 'granted') void this.init();
    else this.queue = [];
    this.listeners.forEach((listener) => listener());
  }

  page(path: string, title: string): void {
    this.dispatch(() => this.adapter?.page(path, title));
  }

  track(event: AnalyticsEventName, props?: AnalyticsProps): void {
    this.dispatch(() => this.adapter?.track(event, props));
  }

  private dispatch(send: () => void): void {
    if (!this.enabled || this.consent === 'denied') return;
    if (this.ready) {
      try {
        send();
      } catch {
        /* analytics must never break the product */
      }
      return;
    }
    if (this.queue.length < 50) this.queue.push(send);
  }

  private async init(): Promise<void> {
    if (this.adapter || typeof window === 'undefined') return;
    this.adapter = createAdapter(config.analytics);
    if (!this.adapter) return;
    try {
      await this.adapter.init();
      this.ready = true;
      this.queue.splice(0).forEach((send) => send());
    } catch {
      // Blocked by an extension or network: fail silently.
      this.adapter = null;
    }
  }
}

export const analytics = new AnalyticsService();
