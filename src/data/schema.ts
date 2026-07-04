/**
 * Canonical DeviceLab schema.
 *
 * Devices live in flat JSON files under `src/data/devices/*.json` and are
 * imported directly (no runtime DB). The schema is intentionally strict on
 * identity + scores so the scoring engine is deterministic, and loose on
 * monetisation fields (`offers`, `priceHistory`) so the ingestion pipeline
 * defined in a separate brief can fill them in later without any code change.
 */

// Categories we currently cover. Adding a new one requires:
//   1. a matching JSON file in src/data/devices/<category>.json
//   2. registering it in `src/data/devices/index.ts`
//   3. adding at least one preset in `src/data/presets.ts`
export type Category = 'laptops' | 'phones' | 'tablets';

export type Ecosystem = 'apple' | 'google' | 'microsoft' | 'samsung' | 'open';

/** Score axes used by the mixer. All devices score on every axis 0–100. */
export const AXES = [
  'performance',
  'battery',
  'display',
  'portability',
  'build',
  'camera',
  'value',
] as const;

export type Axis = (typeof AXES)[number];

export type AxisScores = Record<Axis, number>;

/** Human-readable labels for axes; used in mixer + detail. */
export const AXIS_LABEL: Record<Axis, string> = {
  performance: 'Performance',
  battery: 'Battery',
  display: 'Display',
  portability: 'Portability',
  build: 'Build',
  camera: 'Camera',
  value: 'Value',
};

/** One raw price point. `source` is a stable slug (e.g. `amazon-us`). */
export interface PricePoint {
  date: string; // ISO-8601 date, e.g. "2026-06-01"
  price: number; // in `currency` minor units? no — decimal major, keep simple
  currency: string; // ISO-4217, e.g. "USD"
  source: string;
}

/**
 * An affiliate/retail offer. Deliberately empty in seed data.
 * TODO(ingestion): populated by the n8n price job — see separate brief.
 */
export interface Offer {
  merchant: string;
  price: number;
  currency: string;
  url: string; // TODO(affiliate): deep link with tracking params
  inStock: boolean;
  updatedAt: string; // ISO timestamp
}

/** A recommended "pair" — accessory or complementary device. */
export interface Pair {
  deviceId: string;
  reason: string;
}

export interface Device {
  // ── identity ──────────────────────────────────────────────────────────
  id: string; // stable slug, kebab-case, unique across all categories
  name: string;
  brand: string;
  line: string; // e.g. "MacBook Pro", "Pixel", "XPS"
  category: Category;
  ecosystem: Ecosystem;
  gtin: string | null; // GTIN-14 placeholder, filled by ingestion
  releaseYear: number;

  // ── scoring ───────────────────────────────────────────────────────────
  scores: AxisScores;

  // ── monetisation (immutable identity price, mutable feed data) ────────
  price: number; // MSRP or current typical, USD; used until offers arrive
  currency: string;
  priceHistory: PricePoint[]; // seeded empty; TODO(ingestion)
  offers: Offer[]; // seeded empty; TODO(ingestion)

  // ── relations ────────────────────────────────────────────────────────
  pairs: Pair[];

  // ── copy ──────────────────────────────────────────────────────────────
  tagline: string;
  summary: string;
}

// ─── Presets ─────────────────────────────────────────────────────────────

export type WeightVector = Partial<Record<Axis, number>>;

export interface Preset {
  /** Route slug, e.g. "best-laptops-for-students". Used verbatim as URL. */
  slug: string;
  title: string; // <h1> and <title> — kept concise for SEO
  metaTitle: string; // <title> override — includes brand + benefit
  metaDescription: string;
  category: Category | 'all';
  /** Weights are relative; normalised at scoring time. Unmentioned axes = 0. */
  weights: WeightVector;
  /** Human-readable pitch shown above the board. */
  blurb: string;
}
