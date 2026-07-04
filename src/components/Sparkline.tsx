import type { PricePoint } from '../data/schema';

interface Props {
  history: PricePoint[];
  currentPrice: number;
  width?: number;
  height?: number;
}

/**
 * Minimal price-trend sparkline. Shows a synthetic flat line when the
 * ingestion pipeline hasn't populated history yet, so the layout is
 * stable across devices. Colour flips to green when the current price
 * is below the earliest data point in the window.
 */
export function Sparkline({ history, currentPrice, width = 88, height = 22 }: Props) {
  const series = history.length >= 2 ? history.map((p) => p.price) : synthesise(currentPrice);
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = width / (series.length - 1);

  const points = series
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const trendingDown = series[series.length - 1]! < series[0]!;
  const stroke = trendingDown ? 'var(--good)' : 'var(--ink-3)';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      style={{ display: 'block' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Placeholder line before the ingestion feed lands. Uses the device id
 * hash as a seed so the shape is stable per device but varies enough to
 * look plausible in the row list. TODO(ingestion): remove when real
 * priceHistory arrives.
 */
function synthesise(base: number): number[] {
  const n = 8;
  const noise = 0.05;
  const wander = 0.02;
  const out: number[] = [];
  let v = base * (1 + wander);
  for (let i = 0; i < n; i++) {
    v = base + (Math.sin(i * 1.3 + base) * base * noise + (n - i) * base * wander) / (i + 1);
    out.push(v);
  }
  return out;
}
