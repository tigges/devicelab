import type { APIRoute } from 'astro';

export const prerender = false;

interface Body {
  deviceId?: number;
  merchantSlug?: string;
  source?: string;
  personaId?: string | null;
  category?: string | null;
  ts?: number;
  path?: string;
}

/**
 * POST /api/track-click
 *
 * Records an outbound retail click for attribution. Deliberately
 * lightweight — no validation of merchant slug or persona, since the
 * whole point is to learn what actually converts.
 *
 * Storage: Cloudflare KV when the `CLICK_KV` binding is present;
 * stub-logged and dropped otherwise (local dev / preview without
 * provisioning). Keys are timestamp-prefixed so a range scan gives you
 * events in chronological order.
 *
 * TODO(analytics): swap KV for Cloudflare Analytics Engine — much
 * better fit for high-volume append-only events with SQL queries.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return new Response(null, { status: 204 });
  }

  // Minimal shape check; skip malformed events silently.
  if (typeof body.deviceId !== 'number' || !body.merchantSlug || !body.source) {
    return new Response(null, { status: 204 });
  }

  const record = {
    deviceId: body.deviceId,
    merchantSlug: body.merchantSlug,
    source: body.source,
    personaId: body.personaId ?? null,
    category: body.category ?? null,
    path: body.path ?? null,
    ts: body.ts ?? Date.now(),
    ua: request.headers.get('user-agent') ?? null,
    country: request.headers.get('cf-ipcountry') ?? null,
    ip: clientAddress ?? null,
  };

  const kv = locals.runtime?.env?.CLICK_KV;
  if (kv) {
    const key = `click:${record.ts}:${record.deviceId}:${record.merchantSlug}:${Math.floor(
      Math.random() * 1e6,
    )}`;
    await kv.put(key, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 90, // 90 days
    });
    return new Response(null, { status: 204 });
  }

  // No binding — log to worker stdout and drop. Local dev / preview.
  console.log('[track-click] KV not bound; stub-logged:', record);
  return new Response(null, { status: 204 });
};
