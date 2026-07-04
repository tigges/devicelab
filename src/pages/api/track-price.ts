import type { APIRoute } from 'astro';
import { DEVICES } from '../../data/devices';

// The endpoint is dynamic — opt out of the site-wide static prerender.
export const prerender = false;

interface Body {
  deviceId?: string;
  email?: string;
  targetPrice?: number | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/track-price
 *
 * Persists (deviceId, email, targetPrice, createdAt) to Cloudflare KV. If
 * the `TRACK_PRICE_KV` binding isn't configured (local dev, unbound preview
 * deploy) the endpoint still returns 200 so the UI is testable — it logs
 * the record and calls that the stub path.
 *
 * TODO(alerts): once the n8n price ingestion job lands, a scheduled
 * consumer will diff incoming `priceHistory` against saved targets in KV
 * and email a one-shot alert. Kept out of this port on purpose.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const { deviceId, email, targetPrice } = body;

  if (!deviceId || typeof deviceId !== 'string') {
    return json({ error: 'deviceId required' }, 400);
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return json({ error: 'valid email required' }, 400);
  }
  if (targetPrice != null && (typeof targetPrice !== 'number' || targetPrice < 0)) {
    return json({ error: 'targetPrice must be a positive number' }, 400);
  }
  if (!DEVICES.some((d) => d.id === deviceId)) {
    return json({ error: 'unknown device' }, 404);
  }

  const record = {
    deviceId,
    email: email.toLowerCase(),
    targetPrice: targetPrice ?? null,
    createdAt: new Date().toISOString(),
    ua: request.headers.get('user-agent') ?? null,
  };

  const kv = locals.runtime?.env?.TRACK_PRICE_KV;
  if (kv) {
    // Namespaced key: track:<deviceId>:<email>:<epoch>. Overwrites collapse
    // by (device, email) so a user can update their target without piling
    // up records.
    const key = `track:${deviceId}:${record.email}`;
    await kv.put(key, JSON.stringify(record), {
      // TTL guards against forgotten subscriptions.
      expirationTtl: 60 * 60 * 24 * 365, // 1 year
    });
    return json({ ok: true, stored: 'kv' });
  }

  // Stub path — KV binding not attached. In dev/preview this is normal.
  console.log('[track-price] KV not bound; stub-stored record:', record);
  return json({ ok: true, stored: 'stub' });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
