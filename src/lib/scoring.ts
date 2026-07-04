/**
 * Deterministic scoring for the DeviceLab board.
 *
 * Contract:
 *  - Given (device, weights) the returned composite score depends only on
 *    the device's `scores` axis map and the weights. It never reads
 *    `price`, `offers`, or any monetisation field. That's a hard rule —
 *    if you find yourself importing offers here, redesign.
 *  - Weights are relative; we normalise so the sum equals 1 before applying.
 *    An all-zero weight vector falls back to an equal-weight vector so the
 *    board never goes blank.
 */
import { AXES, type Axis, type Device, type WeightVector } from '../data/schema';

export type NormalisedWeights = Record<Axis, number>;

/**
 * Turn a partial/relative weight map into a normalised full map summing to 1.
 * If the input has no non-zero values, returns equal weights across all axes.
 */
export function normaliseWeights(weights: WeightVector): NormalisedWeights {
  const raw: Record<Axis, number> = Object.fromEntries(
    AXES.map((a) => [a, Math.max(0, weights[a] ?? 0)]),
  ) as Record<Axis, number>;

  const total = AXES.reduce((sum, a) => sum + raw[a], 0);

  if (total === 0) {
    const equal = 1 / AXES.length;
    return Object.fromEntries(AXES.map((a) => [a, equal])) as NormalisedWeights;
  }

  return Object.fromEntries(AXES.map((a) => [a, raw[a] / total])) as NormalisedWeights;
}

/** Composite 0–100 score for a device under a given weight vector. */
export function scoreDevice(device: Device, weights: WeightVector): number {
  const w = normaliseWeights(weights);
  let s = 0;
  for (const axis of AXES) {
    s += (device.scores[axis] ?? 0) * w[axis];
  }
  return s;
}

export interface RankedDevice {
  device: Device;
  score: number;
  rank: number;
}

/**
 * Score + sort a list of devices under a weight vector.
 * Stable tie-break: higher raw `value` wins, then alphabetical by name.
 */
export function rankDevices(devices: Device[], weights: WeightVector): RankedDevice[] {
  const scored = devices.map((device) => ({ device, score: scoreDevice(device, weights) }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.device.scores.value !== a.device.scores.value) {
      return b.device.scores.value - a.device.scores.value;
    }
    return a.device.name.localeCompare(b.device.name);
  });

  return scored.map((row, i) => ({ ...row, rank: i + 1 }));
}
