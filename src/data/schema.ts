/**
 * Canonical DeviceLab schema — matches the v11 prototype's data model.
 *
 * Devices live in flat JSON files under `src/data/devices/*.json`.
 * The loader at `src/data/devices/index.ts` derives two fields from the
 * seed: `value` (perf/price normalised across the catalogue) and `hist`
 * (an 8-point price history synthesised from `price` + `drop`).
 *
 * The scoring engine is deterministic and only reads the raw axis
 * scores + weights. `price`, `drop`, and `hist` never enter scoring.
 */

export type Category = 'Laptop' | 'Tablet' | 'Desktop';
export type Ecosystem = 'Apple' | 'Windows' | 'Android' | 'ChromeOS';

/** Short axis keys are used everywhere — including in URL state (`?w=…`). */
export const AXES = ['perf', 'port', 'disp', 'batt', 'build', 'value'] as const;
export type Axis = (typeof AXES)[number];

export interface AxisMeta {
  key: Axis;
  label: string; // slider row label, e.g. "Perform."
  full: string; // long-form label, e.g. "Performance"
  short: string; // 4-char label for radar corners
}

export const AXIS_META: AxisMeta[] = [
  { key: 'perf', label: 'Perform.', full: 'Performance', short: 'Perf' },
  { key: 'port', label: 'Portab.', full: 'Portability', short: 'Port' },
  { key: 'disp', label: 'Display', full: 'Display', short: 'Disp' },
  { key: 'batt', label: 'Battery', full: 'Battery', short: 'Batt' },
  { key: 'build', label: 'Build', full: 'Build', short: 'Build' },
  { key: 'value', label: 'Value', full: 'Value', short: 'Value' },
];

export type AxisScores = Record<Axis, number>;
export type WeightVector = Record<Axis, number>;

/** Seed shape — the raw JSON stores this. */
export interface DeviceSeed {
  id?: number; // filled by loader if missing
  name: string;
  brand: string;
  line?: string;
  eco: Ecosystem;
  cat: Category;
  price: number; // GBP
  drop: number; // 8-week price drop (0 = flat)
  perf: number; // 0–100
  port: number;
  disp: number;
  batt: number;
  build: number;
  /**
   * TODO(ingestion): once the price pipeline populates real `hist`,
   * the seed can drop `drop`. Until then, `hist` is derived from
   * `price` + `drop` in the loader.
   */
  gtin?: string | null;
}

/** Runtime shape — what components see. */
export interface Device extends DeviceSeed {
  id: number;
  line: string; // guaranteed non-empty at runtime; loader defaults to brand
  value: number; // derived: perf-per-£ normalised to 30–100
  hist: number[]; // derived: 8-point price series ending at `price`
  pairs: string[]; // accessory suggestions per category
}

// ─── Personas + presets ──────────────────────────────────────────────────

export type PersonaId = 'Overall' | 'Value' | 'Creator' | 'Gamer' | 'Student' | 'Business';

export interface Persona {
  id: PersonaId;
  weights: WeightVector;
  blurb: string;
}

// ─── Tri-state brand filter ──────────────────────────────────────────────

export type BrandState = 'in' | 'out';
