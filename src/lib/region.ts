/**
 * Amazon region localisation.
 *
 * Runtime detects the visitor country (Cloudflare `cf-ipcountry`
 * header via a small `/api/geo` endpoint) and swaps the Amazon
 * domain + affiliate tag on the buy buttons accordingly.
 *
 * Progressive enhancement: prerendered HTML always emits the UK
 * default URL and label; a client-side pass rewrites them after
 * the geo fetch resolves. UK visitors see no change; US visitors
 * get their local domain + tag; anyone else falls back to UK.
 */

export interface Region {
  /** ISO-3166-1 alpha-2. */
  country: string;
  domain: string;
  tag: string;
  /** Display label on the buy button, e.g. "Amazon UK". */
  label: string;
  /** Stable slug used in click-tracking + button `data-merchant-slug`. */
  slug: string;
}

export const REGIONS: Record<string, Region> = {
  GB: { country: 'GB', domain: 'amazon.co.uk', tag: 'gtaviai-21', label: 'Amazon UK', slug: 'amazon-uk' },
  US: { country: 'US', domain: 'amazon.com',   tag: 'gtaviai-20', label: 'Amazon US', slug: 'amazon-us' },
};

export const DEFAULT_REGION: Region = REGIONS.GB!;

const CACHE_KEY = 'dl-region';

/**
 * Ask the server for the visitor's country. Caches the result in
 * sessionStorage so subsequent page loads skip the round-trip.
 * Falls back to the default region on any failure — the endpoint
 * isn't available in every deploy target (e.g. static-only hosts
 * without the `cf-ipcountry` header) and that's fine.
 *
 * A `?region=US` URL override is honoured for manual testing +
 * for hosts without server-side geo detection.
 */
export async function detectRegion(): Promise<Region> {
  if (typeof window === 'undefined') return DEFAULT_REGION;

  const params = new URLSearchParams(window.location.search);
  const override = params.get('region');
  if (override && REGIONS[override.toUpperCase()]) {
    const r = REGIONS[override.toUpperCase()]!;
    try { sessionStorage.setItem(CACHE_KEY, r.country); } catch {}
    return r;
  }

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached && REGIONS[cached]) return REGIONS[cached]!;
  } catch { /* private mode */ }

  try {
    const res = await fetch('/api/geo', { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error();
    const body = (await res.json()) as { country?: string };
    const key = (body.country ?? '').toUpperCase();
    const region = REGIONS[key] ?? DEFAULT_REGION;
    try { sessionStorage.setItem(CACHE_KEY, region.country); } catch {}
    return region;
  } catch {
    return DEFAULT_REGION;
  }
}

/**
 * Rewrite an Amazon URL for the given region.
 *
 *  - amazon.<other>/dp/<ASIN>?... → amazon.<region>/dp/<ASIN>?tag=<region.tag>
 *  - amazon.<other>/s?k=<q>&...   → amazon.<region>/s?k=<q>&tag=<region.tag>
 *  - amzn.to short links stay as-is (they redirect through Amazon's own
 *    localisation; safest to leave alone).
 *  - Anything else we don't recognise: returned unchanged.
 *
 * When the incoming URL already targets `region.domain`, it's returned
 * unchanged — no need to churn the query string and lose the SiteStripe
 * `linkId` reporting metadata for that region's own links.
 */
export function rewriteAmazonUrl(url: string, region: Region): string {
  if (!url) return url;
  if (url.includes('amzn.to/')) return url;
  if (url.includes(region.domain + '/')) return url;

  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (asinMatch) {
    return `https://${region.domain}/dp/${asinMatch[1]}?tag=${region.tag}`;
  }

  // Search-URL rewrite: preserve the `k=` term, swap domain + tag.
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('amazon.') && parsed.pathname === '/s') {
      const k = parsed.searchParams.get('k');
      if (k) {
        return `https://${region.domain}/s?k=${encodeURIComponent(k)}&tag=${region.tag}`;
      }
    }
  } catch {
    /* not a parseable URL — fall through */
  }

  return url;
}
