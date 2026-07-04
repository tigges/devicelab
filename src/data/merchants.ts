import type { Device } from './schema';

/**
 * Amazon UK universal search — used as the primary retail CTA. Every
 * device gets a link because Amazon indexes almost everything.
 * TODO(affiliate): swap for tagged affiliate URLs once we have the tag.
 */
export function amazonUrl(d: Device): string {
  return `https://www.amazon.co.uk/s?k=${encodeURIComponent(`${d.brand} ${d.name}`)}`;
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
