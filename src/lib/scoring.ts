/**
 * Deterministic scoring.
 * Composite = Σ(score_axis · weight_axis) / Σ(weight_axis).
 * Never reads `price`, `drop`, `hist`, or any monetisation field.
 */
import { AXES, type Device, type WeightVector } from '../data/schema';

export function scoreDevice(d: Device, w: WeightVector): number {
  const total = AXES.reduce((s, a) => s + w[a], 0) || 1;
  return AXES.reduce((s, a) => s + d[a] * w[a], 0) / total;
}

export interface RankedDevice {
  device: Device;
  score: number;
  rank: number;
}

export function rankDevices(devices: Device[], w: WeightVector): RankedDevice[] {
  const scored = devices.map((device) => ({ device, score: scoreDevice(device, w) }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable tie-break on raw value then name.
    if (b.device.value !== a.device.value) return b.device.value - a.device.value;
    return a.device.name.localeCompare(b.device.name);
  });
  return scored.map((row, i) => ({ ...row, rank: i + 1 }));
}
