import { AXES, AXIS_LABEL, type AxisScores } from '../data/schema';

interface Props {
  scores: AxisScores;
  size?: number;
}

/**
 * Full-size 6-axis radar for the detail sheet. Renders concentric
 * decagons at 25/50/75/100% plus the score polygon. Axis labels sit
 * outside the hexagon.
 */
export function RadarChart({ scores, size = 240 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30;

  const angleFor = (i: number) => (Math.PI / 3) * i - Math.PI / 2;
  const vertex = (i: number, radius: number) => {
    const a = angleFor(i);
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1].map((frac) =>
    Array.from({ length: 6 }, (_, i) => vertex(i, r * frac))
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' '),
  );

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
      role="img"
      aria-label="Score radar"
    >
      {rings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="var(--rule-strong)"
          strokeWidth={0.75}
          strokeDasharray={i === rings.length - 1 ? undefined : '2 3'}
        />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = vertex(i, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--rule-strong)"
            strokeWidth={0.5}
          />
        );
      })}
      <polygon
        points={scorePoints}
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {AXES.map((axis, i) => {
        const [x, y] = vertex(i, r + 18);
        return (
          <text
            key={axis}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--mono)"
            fontSize={11}
            fill="var(--ink-3)"
            letterSpacing={0.5}
          >
            {AXIS_LABEL[axis].slice(0, 4).toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}
