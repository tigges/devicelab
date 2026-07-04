/**
 * Urgency signals — derived from `hist` alone, so they work today with
 * the synthesised price history and will keep working once the
 * ingestion pipeline supplies real data.
 *
 * All thresholds live here so tuning them is a single-file change.
 */
import type { Device } from '../data/schema';

/** Show the price-drop pill above this drop-in-£ threshold. */
export const DROP_PILL_THRESHOLD = 100;

/** Absolute £ drop from the earliest point in the window to the current price. */
export function priceDrop(hist: number[]): number {
  if (hist.length < 2) return 0;
  return Math.max(0, hist[0]! - hist[hist.length - 1]!);
}

/** Lowest price observed in the window. */
export function historicalLow(hist: number[]): number {
  return Math.min(...hist);
}

/** True when the current price is at (or below) the window's low. */
export function atHistoricalLow(hist: number[]): boolean {
  if (hist.length === 0) return false;
  return hist[hist.length - 1]! <= historicalLow(hist);
}

/**
 * Pre-computed urgency snapshot per device. Kept as a single lookup so
 * every component reads the same numbers.
 */
export interface Urgency {
  drop: number;
  low: number;
  atLow: boolean;
  showDropPill: boolean;
}

export function urgencyFor(d: Device): Urgency {
  const drop = priceDrop(d.hist);
  const low = historicalLow(d.hist);
  const atLow = atHistoricalLow(d.hist);
  return {
    drop,
    low,
    atLow,
    showDropPill: drop >= DROP_PILL_THRESHOLD || atLow,
  };
}
