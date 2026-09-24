export type AnalyticsEventName =
  | 'page_view'
  | 'cta_click'
  | 'demo_start'
  | 'chat_message_sent'
  | 'agent_run'
  | 'search_query'
  | 'voice_session'
  | 'contact_step'
  | 'contact_submit';

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

/** A provider adapter. Implementations load their own script lazily. */
export interface AnalyticsAdapter {
  init(): Promise<void>;
  page(path: string, title: string): void;
  track(event: AnalyticsEventName, props?: AnalyticsProps): void;
}

export type ConsentState = 'granted' | 'denied' | 'unset';
