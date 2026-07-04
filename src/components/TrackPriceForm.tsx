import { useState } from 'react';
import { href } from '../lib/href';

interface Props {
  deviceId: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'ok' }
  | { kind: 'err'; msg: string };

/**
 * Minimal email capture. Posts to `/api/track-price` which persists to
 * Cloudflare KV when the binding is available, and no-ops (with a 200)
 * otherwise so dev/preview environments stay simple.
 *
 * TODO(alerts): once the price pipeline lands, wire this up to a
 * scheduled job that checks the user's target vs. incoming `priceHistory`
 * deltas and sends one alert email per target.
 */
export function TrackPriceForm({ deviceId }: Props) {
  const [email, setEmail] = useState('');
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch(href('/api/track-price'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          email,
          targetPrice: target ? Number(target) : null,
        }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Not available in this deployment.');
        }
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setStatus({ kind: 'ok' });
      setEmail('');
      setTarget('');
    } catch (err) {
      setStatus({ kind: 'err', msg: err instanceof Error ? err.message : 'Failed' });
    }
  }

  return (
    <form className="dl-track-form" onSubmit={onSubmit} noValidate>
      <div className="dl-track-inputs">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Your email"
        />
        <input
          type="number"
          inputMode="decimal"
          placeholder="Target £"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          aria-label="Target price"
        />
      </div>
      <button className="dl-done" type="submit" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'Saving…' : 'Notify me on target'}
      </button>
      {status.kind === 'ok' && (
        <div className="dl-track-status ok">✓ TRACKED — WE'LL EMAIL WHEN IT DROPS</div>
      )}
      {status.kind === 'err' && (
        <div className="dl-track-status err">✗ {status.msg}</div>
      )}
    </form>
  );
}
