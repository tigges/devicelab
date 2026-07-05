import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * GET /api/geo
 *
 * Returns `{ country: 'GB' | 'US' | … }`, sourced from Cloudflare's
 * `cf-ipcountry` header. Defaults to `'GB'` (our home market) when
 * the header is missing — same as when the caller can't fetch the
 * endpoint at all.
 *
 * Kept trivially cacheable at the edge (varies by IP country) so
 * repeat visitors from the same country hit CF's cache, not the
 * Worker. The client also caches per-session in sessionStorage.
 */
export const GET: APIRoute = ({ request }) => {
  const country =
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-country') ??
    'GB';
  return new Response(JSON.stringify({ country: country.toUpperCase() }), {
    headers: {
      'content-type': 'application/json',
      // Small edge cache — country-per-IP is stable enough to cache
      // for a minute; keeps the Worker cold-start out of every visit.
      'cache-control': 'public, max-age=60',
      vary: 'CF-IPCountry',
    },
  });
};
