/**
 * Awin affiliate URL wrapping.
 *
 * Awin's shape: `https://www.awin1.com/cread.php?awinmid=<MERCHANT>&awinaffid=<PUBLISHER>&clickref=<label>&p=<encoded target URL>`
 *
 * `awinaffid` is our (single) publisher ID. `awinmid` is per-merchant
 * and only known once we've been approved for that merchant's
 * programme in the Awin dashboard.
 *
 * Behaviour:
 *   - If we don't have a merchant ID for the brand yet, `awinWrap()`
 *     returns the URL unchanged (no commission, but the link works).
 *   - When the merchant ID lands in the map below, every manufacturer
 *     URL for that brand — direct overrides + search-URL fallbacks —
 *     automatically wraps. No per-device change needed.
 *
 * Any URL that already targets `awin1.com` (e.g. a user pasted an
 * Awin-wrapped short link into the overrides file) is returned as-is.
 */

const AWIN_PUBLISHER_ID = '2972385';

/**
 * Awin merchant (advertiser) IDs per brand. Filled in from the Awin
 * publisher dashboard once each brand's programme is approved.
 *
 * How to find: Awin → Publisher dashboard → Advertisers → find brand
 * → the "Advertiser ID" (a.k.a. MID) shown in the details panel.
 * Brands with no entry stay unwrapped.
 */
const AWIN_MERCHANTS: Record<string, number> = {
  // Lenovo: 0,
  // Dell: 0,
  // HP: 0,
  // ASUS: 0,
  // MSI: 0,
  // Razer: 0,
  // LG: 0,
  // Samsung: 0,
  // Microsoft: 0,
  // Huawei: 0,
  // Acer: 0,
  // Framework: 0,
};

/**
 * Wrap a URL with the Awin affiliate redirector when we have a merchant
 * ID for the brand. Returns the URL unchanged otherwise.
 * `clickref` is an arbitrary label surfaced in Awin's reporting — we
 * use the device slug so we can see which devices actually convert.
 */
export function awinWrap(url: string, brand: string, clickref?: string): string {
  if (!url) return url;
  if (url.includes('awin1.com/')) return url; // already wrapped
  const mid = AWIN_MERCHANTS[brand];
  if (!mid) return url;
  const params = new URLSearchParams({
    awinmid: String(mid),
    awinaffid: AWIN_PUBLISHER_ID,
    ...(clickref ? { clickref } : {}),
    p: url,
  });
  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * True when we have a merchant ID for the brand and therefore wrap
 * outbound clicks. Useful for UI hints (e.g. "commissionable via Awin").
 */
export function isAwinCommissionable(brand: string): boolean {
  return Boolean(AWIN_MERCHANTS[brand]);
}
