import type { Device } from './schema';
import { slugify } from '../lib/slugify';
import overridesRaw from './amazon-overrides.json' with { type: 'json' };

/**
 * Amazon UK Associates tracking ID. Public info (visible in every
 * affiliate URL Amazon serves), so it's fine to keep in the repo.
 * Applied to search URLs so *every* device generates commissionable
 * traffic even before we have a per-device short link.
 */
const AMAZON_UK_TAG = 'gtaviai-21';

/**
 * Per-device overrides layered on top of the search-URL fallback.
 * File format (keyed by `slugify({brand, name})`):
 *
 *   {
 *     "apple-macbook-pro-14-m4-pro": {
 *       "amznShort": "https://amzn.to/…",   // preferred — SiteStripe short link
 *       "asin":      "B0DGHYDZXQ"           // fallback — we construct dp URL
 *     }
 *   }
 *
 * Precedence in `amazonUrl()`:
 *   1. `amznShort` — mobile-app-safe, tag baked into the redirect
 *   2. `asin`      — direct `/dp/<ASIN>?tag=…` link
 *   3. search      — tagged search-URL fallback
 *
 * Add entries at your own pace; anything unlisted keeps working via
 * (3). Editing the JSON is enough — no code change needed per device.
 */
interface AmazonOverride {
  amznShort?: string;
  asin?: string;
}
const OVERRIDES = overridesRaw as unknown as Record<string, AmazonOverride>;

export function amazonUrl(d: Device): string {
  const o = OVERRIDES[slugify(d)];
  if (o?.amznShort) return o.amznShort;
  if (o?.asin) {
    return `https://www.amazon.co.uk/dp/${o.asin}?tag=${AMAZON_UK_TAG}`;
  }
  const q = encodeURIComponent(`${d.brand} ${d.name}`);
  return `https://www.amazon.co.uk/s?k=${q}&tag=${AMAZON_UK_TAG}`;
}

/**
 * Manufacturer on-site search endpoints per brand. Keeps links
 * device-specific without maintaining per-SKU URLs. Search-endpoint
 * formats need one-time QA per brand; production replaces with
 * GTIN-matched affiliate deep links.
 */
const MFG_SEARCH: Record<string, (q: string) => string> = {
  Apple:     (q) => `https://www.apple.com/uk/search/${encodeURIComponent(q)}`,
  Lenovo:    (q) => `https://www.lenovo.com/gb/en/search?text=${encodeURIComponent(q)}`,
  Dell:      (q) => `https://www.dell.com/en-uk/search/${encodeURIComponent(q)}`,
  HP:        (q) => `https://www.hp.com/gb-en/shop/sitesearch?keyword=${encodeURIComponent(q)}`,
  ASUS:      (q) => `https://www.asus.com/uk/searchresult?searchType=products&searchKey=${encodeURIComponent(q)}`,
  Samsung:   (q) => `https://www.samsung.com/uk/search/?searchvalue=${encodeURIComponent(q)}`,
  Microsoft: (q) => `https://www.microsoft.com/en-gb/search/shop?q=${encodeURIComponent(q)}`,
  Acer:      (q) => `https://www.acer.com/gb-en/search?query=${encodeURIComponent(q)}`,
  MSI:       (q) => `https://www.msi.com/search/${encodeURIComponent(q)}`,
  Razer:     (q) => `https://www.razer.com/search?q=${encodeURIComponent(q)}`,
  LG:        (q) => `https://www.lg.com/uk/search?q=${encodeURIComponent(q)}`,
  Huawei:    (q) => `https://consumer.huawei.com/uk/search/?keyword=${encodeURIComponent(q)}`,
  Xiaomi:    (q) => `https://www.mi.com/uk/search?keyword=${encodeURIComponent(q)}`,
  Google:    (q) => `https://store.google.com/gb/search?q=${encodeURIComponent(q)}`,
  NZXT:      (q) => `https://nzxt.com/en-GB/search?q=${encodeURIComponent(q)}`,
};

/** Direct URLs for brands with tiny catalogues where search adds noise. */
const MFG_DIRECT: Record<string, Record<string, string>> = {
  Framework: { 'Framework Laptop 13': 'https://frame.work/gb/en/laptop13' },
};

/**
 * Brand's own store URL for a device. Returns null when the brand has
 * no known endpoint (we hide the button in that case).
 */
export function mfgUrl(d: Device): string | null {
  const direct = MFG_DIRECT[d.brand]?.[d.name];
  if (direct) return direct;

  // Strip generation suffixes ("(M4 Pro)", "Gen 13") — most on-site
  // search engines choke on them.
  const q = d.name
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+Gen\s+\d+/i, '')
    .trim();

  const fn = MFG_SEARCH[d.brand];
  return fn ? fn(q) : null;
}

/** Brand-tinted meta text on cards + detail hero. */
export const BRAND_COLORS: Record<string, string> = {
  Apple: '#1A1D21',
  Lenovo: '#D93025',
  Dell: '#1D4ED8',
  ASUS: '#7B1FA2',
  Microsoft: '#0F9D58',
  Samsung: '#0277BD',
  NZXT: '#5F6368',
  HP: '#00838F',
  Acer: '#7CB342',
  MSI: '#546E7A',
  Razer: '#2E7D32',
  LG: '#A50034',
  Huawei: '#8D6E63',
  Xiaomi: '#EF6C00',
  Google: '#4285F4',
  Framework: '#00897B',
};

export const COMPARE_COLORS = ['#FF5C00', '#1D4ED8', '#0F9D58'];

/**
 * A rendered offer, safe to bind directly to a buy button.
 * `merchantSlug` is the stable key used by click tracking + affiliate
 * attribution downstream.
 */
export interface RenderedOffer {
  merchant: string;
  merchantSlug: string;
  url: string;
  primary?: boolean;
}

/**
 * Uniform offer list per device. Amazon UK is always primary; brand
 * store is secondary when the brand has a known endpoint. This is the
 * *only* place that decides which offers exist — every UI surface
 * calls this so click tracking and offer ordering stay consistent.
 *
 * TODO(ingestion): once the price feed lands, this merges in the
 * per-device `offers[]` (with live prices + in-stock flags) and sorts
 * by delivered price.
 * TODO(affiliate): swap Amazon search URL for tagged ASIN deep links.
 */
export function defaultOffers(d: Device): RenderedOffer[] {
  const offers: RenderedOffer[] = [
    { merchant: 'Amazon UK', merchantSlug: 'amazon-uk', url: amazonUrl(d), primary: true },
  ];
  const brandStore = mfgUrl(d);
  if (brandStore) {
    offers.push({
      merchant: `${d.brand} store`,
      merchantSlug: `${d.brand.toLowerCase().replace(/\s+/g, '-')}-store`,
      url: brandStore,
    });
  }
  return offers;
}
