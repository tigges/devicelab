import { AXES, AXIS_LABEL, type Device, type WeightVector } from '../data/schema';
import { normaliseWeights } from './scoring';

/**
 * Format a price. Falls back to GBP but respects each device's own
 * `currency` so a mixed feed still displays sensibly.
 */
export function formatPrice(price: number, currency = 'GBP'): string {
  const locale = currency === 'GBP' ? 'en-GB' : currency === 'EUR' ? 'en-IE' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatEcosystem(eco: string): string {
  if (eco === 'microsoft') return 'Windows';
  if (eco === 'open') return 'Open';
  return eco.charAt(0).toUpperCase() + eco.slice(1);
}

/**
 * Human-readable summary of *why* a device ranks where it does under
 * the current mixer. Picks the two highest contributing axes and the
 * one weakest contributing axis (weight × score product). No LLM —
 * this is a deterministic string per device+weight.
 */
export function explainRank(device: Device, weights: WeightVector): string {
  const w = normaliseWeights(weights);
  const contributions = AXES.map((a) => ({
    axis: a,
    contribution: w[a] * device.scores[a],
  })).sort((a, b) => b.contribution - a.contribution);

  const strong = contributions.slice(0, 2).map((c) => AXIS_LABEL[c.axis].toLowerCase());
  const weak = contributions[contributions.length - 1];
  const weakLabel = weak ? AXIS_LABEL[weak.axis].toLowerCase() : 'value';

  return `${device.name} leads your board mainly on ${strong[0]} and ${strong[1]}. Its weakest contribution under your current mix is ${weakLabel}.`;
}
