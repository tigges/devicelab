/**
 * Device loader: reads flat seed JSON and derives two runtime fields:
 *  - `hist`: 8-point synthetic price history from `price` + `drop`.
 *  - `value`: perf-per-£ min-max normalised to 30–100 across the whole
 *            catalogue. This is why we compute it *after* concatenating.
 * Also fills in default `line` (brand fallback), sequential ids, and
 * category-level pair defaults.
 *
 * TODO(ingestion): once the n8n price job populates real `hist` per
 * device, drop the synthesis path and read `hist` straight from JSON.
 */
import type { Device, DeviceSeed } from '../schema';
import laptopsSeed from './laptops.json' with { type: 'json' };
import tabletsSeed from './tablets.json' with { type: 'json' };
import desktopsSeed from './desktops.json' with { type: 'json' };

const PAIR_DEFAULTS: Record<string, string[]> = {
  Laptop: ['USB-C dock', 'Laptop sleeve', 'Wireless mouse'],
  Tablet: ['Stylus pen', 'Keyboard cover', 'Folio case'],
  Desktop: ['Monitor', 'Mechanical keyboard', 'Webcam'],
};

function mkHist(price: number, drop: number): number[] {
  const start = price + drop;
  const steps = [0, 0, 0.2, 0.35, 0.5, 0.7, 0.9, 1];
  return steps.map((s) => Math.round((start - drop * s) / 10) * 10);
}

const seeds: DeviceSeed[] = [
  ...(laptopsSeed as DeviceSeed[]),
  ...(tabletsSeed as DeviceSeed[]),
  ...(desktopsSeed as DeviceSeed[]),
];

const ppp = seeds.map((d) => d.perf / d.price);
const pppMin = Math.min(...ppp);
const pppMax = Math.max(...ppp);

export const DEVICES: Device[] = seeds.map((seed, i) => {
  const valueScore = Math.round(((seed.perf / seed.price - pppMin) / (pppMax - pppMin || 1)) * 70 + 30);
  return {
    ...seed,
    id: i + 1,
    line: seed.line ?? seed.brand,
    value: valueScore,
    hist: mkHist(seed.price, seed.drop),
    pairs: PAIR_DEFAULTS[seed.cat] ?? [],
    gtin: seed.gtin ?? null,
  };
});

export function deviceById(id: number): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}

export function deviceBySlug(slug: string): Device | undefined {
  return DEVICES.find((d) => slugify(d) === slug);
}

// Re-export slugify so existing callers (astro pages, DetailSheet)
// keep working without an import churn.
import { slugify } from '../../lib/slugify';
export { slugify };

export const BRANDS: string[] = [...new Set(DEVICES.map((d) => d.brand))];
