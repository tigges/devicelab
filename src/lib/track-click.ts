import { href } from './href';

export interface ClickEvent {
  deviceId: number;
  merchantSlug: string;
  /** UI surface that emitted the click, e.g. 'detail-sheet' or 'device-page'. */
  source: 'detail-sheet' | 'device-page' | 'board-row';
  personaId?: string | null;
  category?: string | null;
}

/**
 * Fire-and-forget outbound-click beacon. Uses `sendBeacon` when
 * available so the request survives page unload / new-tab navigation;
 * falls back to `fetch({ keepalive: true })` on older browsers.
 *
 * All calls are best-effort — if the endpoint is missing or the
 * network fails, we swallow the error. Never block the navigation.
 */
export function trackClick(evt: ClickEvent): void {
  if (typeof window === 'undefined') return;
  const url = href('/api/track-click');
  const body = JSON.stringify({ ...evt, ts: Date.now(), path: window.location.pathname });
  try {
    if ('sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop — tracking is never load-bearing */
  }
}
