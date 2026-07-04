import { useState } from 'react';
import { href } from '../lib/href';

interface Props {
  deviceId: string;
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'err'; msg: string };

/**
 * Minimal email capture. Posts to `/api/track-price` which persists to
 * Cloudflare KV when the binding is available, and no-ops (with a 200)
 * otherwise so dev/preview environments stay simple.
 *
 * TODO(alerts): once the price pipeline lands, wire this up to a scheduled
 * job that checks the user's target vs. incoming `priceHistory` deltas.
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
        body: JSON.stringify({ deviceId, email, targetPrice: target ? Number(target) : null }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Not available in this deployment (static-only host).');
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
    <form onSubmit={onSubmit} noValidate>
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
        placeholder="Target $ (optional)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        aria-label="Target price"
        style={{
          width: 160,
          padding: '12px 14px',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--rule-strong)',
          fontFamily: 'var(--mono)',
          fontSize: 14,
          background: 'var(--bg)',
          color: 'var(--ink)',
        }}
      />
      <button className="btn accent" type="submit" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'Saving…' : 'Track price'}
      </button>
      {status.kind === 'ok' && (
        <div className="status ok">✓ TRACKED — WE'LL EMAIL WHEN IT DROPS</div>
      )}
      {status.kind === 'err' && <div className="status err">✗ {status.msg}</div>}
    </form>
  );
}
