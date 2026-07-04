import { useState } from 'react';
import type { Device } from '../data/schema';
import { href } from '../lib/href';
import { formatGBP } from '../lib/format';
import { historicalLow } from '../lib/urgency';

interface Props {
  deviceId: string;
  /**
   * Optional device context. When supplied, the form shows the current
   * price + 8-week low as a suggested target, and computes the £ delta
   * between the user's target and the current price as they type.
   */
  device?: Device;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'ok' }
  | { kind: 'err'; msg: string };

/**
 * Email capture for price alerts. POSTs to `/api/track-price` which
 * persists to `TRACK_PRICE_KV`; endpoint returns a stubbed 200 in
 * local/preview when the binding is missing.
 *
 * TODO(alerts): once the price pipeline lands, a scheduled consumer
 * diffs incoming priceHistory against saved targets and sends a
 * one-shot alert.
 */
export function TrackPriceForm({ deviceId, device }: Props) {
  const low = device ? historicalLow(device.hist) : null;
  const suggestedTarget = low !== null ? String(low) : '';

  const [email, setEmail] = useState('');
  const [target, setTarget] = useState(suggestedTarget);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const targetNum = target ? Number(target) : null;
  const currentPrice = device?.price ?? null;
  const deltaFromCurrent =
    targetNum !== null && currentPrice !== null ? currentPrice - targetNum : null;

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
    } catch (err) {
      setStatus({ kind: 'err', msg: err instanceof Error ? err.message : 'Failed' });
    }
  }

  return (
    <form className="dl-track-form" onSubmit={onSubmit} noValidate>
      {device && (
        <div className="dl-track-context">
          <span className="dl-track-context-cell">
            <span className="k">CURRENT</span>
            <span className="v">{formatGBP(device.price)}</span>
          </span>
          {low !== null && low < device.price && (
            <span className="dl-track-context-cell">
              <span className="k">8-WK LOW</span>
              <span className="v">{formatGBP(low)}</span>
            </span>
          )}
        </div>
      )}
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
      {deltaFromCurrent !== null && targetNum !== null && targetNum > 0 && (
        <div className="dl-track-hint">
          {deltaFromCurrent > 0
            ? `Notify at ${formatGBP(targetNum)} — ${formatGBP(deltaFromCurrent)} below current.`
            : deltaFromCurrent < 0
              ? `Target is above the current price — you'll be notified straight away.`
              : `Target matches the current price.`}
        </div>
      )}
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
