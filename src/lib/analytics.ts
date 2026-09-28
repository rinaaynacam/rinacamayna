'use client';

export const ANALYTICS_EVENTS = ['quote_prepare', 'whatsapp_click'] as const;
export type AnalyticsEvent = typeof ANALYTICS_EVENTS[number];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Yalnız olay adı gönderilir; müşteri girdisi, telefon, URL veya mesaj parametresi kabul edilmez. */
export function trackAnalyticsEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event);
}

