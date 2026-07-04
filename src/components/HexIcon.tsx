import { AXES, type AxisScores } from '../data/schema';

interface Props {
  scores: AxisScores;
  size?: number;
  /** Emit the outer hexagon frame only (no radar poly). */
  outline?: boolean;
}

/**
 * Small hexagonal radar shape used as each device's row icon. Six
 * vertices map to the six axes in the order of `AXES`, so the shape
 * IS the score profile at a glance.
 */
export function HexIcon({ scores, size = 44, outline = false }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  // Six points of the outer hex — pointy-top orientation.
  const vertex = (i: number, radius: number) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const;
  };

  const outerPoints = Array.from({ length: 6 }, (_, i) => vertex(i, r))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  const scorePoints = AXES.map((axis, i) => {
    const v = scores[axis] / 100;
    const [x, y] = vertex(i, r * v);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      style={{ display: 'block' }}
    >
      <polygon
        points={outerPoints}
        fill="none"
        stroke="var(--rule-strong)"
        strokeWidth={1.25}
      />
      {!outline && (
        <polygon
          points={scorePoints}
          fill="var(--accent-soft)"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
