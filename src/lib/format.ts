import { AXES, AXIS_META, type Device, type WeightVector } from '../data/schema';

export function formatGBP(n: number): string {
  return `£${n.toLocaleString('en-GB')}`;
}

/**
 * Deterministic "why this rank" copy. Picks the top-2 contributing axes
 * (weight × score) and the weakest contributor. No LLM, no randomness.
 */
export function explainRank(d: Device, w: WeightVector, rank: number): string {
  const totalW = AXES.reduce((s, a) => s + w[a], 0) || 1;
  const contribs = AXES.map((a) => ({
    a,
    c: (d[a] * w[a]) / totalW,
  })).sort((x, y) => y.c - x.c);

  const top = contribs
    .slice(0, 2)
    .map((x) => AXIS_META.find((m) => m.key === x.a)!.full.toLowerCase());
  const weak = AXIS_META.find((m) => m.key === contribs[contribs.length - 1]!.a)!.full.toLowerCase();
  const rankWord =
    rank === 1
      ? 'leads your board'
      : rank > 1
        ? `ranks #${rank} at your weights`
        : 'is outside your current filters';
  return `The ${d.name} ${rankWord} mainly on ${top[0]} and ${top[1]}. Its weakest contribution under your current mix is ${weak}.`;
}
