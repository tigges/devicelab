/**
 * Canonical DeviceLab schema.
 *
 * Devices live in flat JSON files under `src/data/devices/*.json`.
 * The schema is intentionally strict on identity + scores so the scoring
 * engine is deterministic, and loose on monetisation fields
 * (`offers`, `priceHistory`) so the ingestion pipeline can fill them in
 * later without any code change.
 */

export type Category = 'laptops' | 'phones' | 'tablets';

export type Ecosystem = 'apple' | 'google' | 'microsoft' | 'samsung' | 'open';

/**
 * Score axes used by the mixer. Six axes matches the prototype's mixer
 * (perf, portab, display, battery, build, value). Camera moved out —
 * phone camera nuance is expressed in per-category persona weights and
 * the device summary, not as a separate axis.
 */
export const AXES = [
  'performance',
  'portability',
  'display',
  'battery',
  'build',
  'value',
] as const;

export type Axis = (typeof AXES)[number];
export type AxisScores = Record<Axis, number>;

/** Long + short labels; short labels are for the mixer sliders. */
export const AXIS_LABEL: Record<Axis, string> = {
  performance: 'Performance',
  portability: 'Portability',
  display: 'Display',
  battery: 'Battery',
  build: 'Build',
  value: 'Value',
};

export const AXIS_LABEL_SHORT: Record<Axis, string> = {
  performance: 'PERFORM.',
  portability: 'PORTAB.',
  display: 'DISPLAY',
  battery: 'BATTERY',
  build: 'BUILD',
  value: 'VALUE',
};

/** One raw price point. `source` is a stable slug (e.g. `amazon-uk`). */
export interface PricePoint {
  date: string;
  price: number;
  currency: string;
  source: string;
}

/**
 * An affiliate/retail offer. Prototype-time offers are stub `search`
 * URLs at the merchant so the UI is usable end-to-end; ingestion will
 * replace them with priced offers and affiliate deep links.
 * TODO(affiliate): swap `url` for tagged deep links, populate `price`
 * from the ingestion feed.
 */
export interface Offer {
  merchant: string; // display name, e.g. "Amazon UK"
  merchantSlug: string; // stable slug for CTA styling ("amazon-uk", "apple-store")
  price: number | null; // null until ingestion supplies a live price
  currency: string;
  url: string; // TODO(affiliate): deep link with tracking params
  inStock: boolean;
  updatedAt: string; // ISO timestamp; may be empty for stub offers
}

export interface Pair {
  deviceId: string;
  reason: string;
}

export interface Device {
  // ── identity ──────────────────────────────────────────────────────────
  id: string;
  name: string;
  brand: string;
  line: string;
  category: Category;
  ecosystem: Ecosystem;
  gtin: string | null;
  releaseYear: number;

  // ── scoring ───────────────────────────────────────────────────────────
  scores: AxisScores;

  // ── monetisation (immutable seed, mutable feed) ───────────────────────
  price: number;
  currency: string;
  priceHistory: PricePoint[];
  offers: Offer[];

  // ── relations ────────────────────────────────────────────────────────
  pairs: Pair[];

  // ── copy ──────────────────────────────────────────────────────────────
  tagline: string;
  /** Category / line-level pitch. Displayed above the "why this rank" card. */
  linePitch: string;
  summary: string;
}

// ─── Personas + presets ──────────────────────────────────────────────────

export type WeightVector = Partial<Record<Axis, number>>;

/**
 * A persona is a named weight vector shown as the top-of-board chips.
 * Personas are category-agnostic — combining them with a category
 * filter yields the SEO landing routes (`/best-laptops-for-students`).
 */
export interface Persona {
  id: 'overall' | 'value' | 'creator' | 'gamer' | 'student' | 'business';
  label: string;
  blurb: string;
  weights: WeightVector;
}

/** SEO landing preset: persona + optional category filter. */
export interface Preset {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  personaId: Persona['id'];
  category: Category | 'all';
  blurb: string;
}

// ─── Tri-state brand filter ──────────────────────────────────────────────

export type BrandTriState = 'neutral' | 'only' | 'exclude';
