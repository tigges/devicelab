import type { Category, Device } from '../data/schema';
import { AXIS_META, AXES } from '../data/schema';
import { COMPARE_COLORS } from '../data/merchants';

// ─── Category glyphs (Laptop / Tablet / Desktop) ────────────────────────

interface CatGlyphProps {
  cat: Category;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}

export function CatGlyph({ cat, size = 20, stroke = '#1A1D21', strokeWidth = 1.8 }: CatGlyphProps) {
  const p = {
    fill: 'none',
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (cat === 'Laptop') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <rect x="4.5" y="5" width="15" height="10" rx="1" {...p} />
        <path d="M2.5 18h19l-2-3h-15z" {...p} />
      </svg>
    );
  }
  if (cat === 'Tablet') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <rect x="6" y="3.5" width="12" height="17" rx="1.6" {...p} />
        <circle cx="12" cy="17.6" r="0.9" fill={stroke} stroke="none" />
      </svg>
    );
  }
  // Desktop / PC
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="8.5" y="3.5" width="7" height="17" rx="1" {...p} />
      <circle cx="12" cy="7" r="1.4" {...p} />
      <line x1="10.5" y1="17.5" x2="13.5" y2="17.5" {...p} />
    </svg>
  );
}

// ─── Row sparkline (8-point price line) ─────────────────────────────────

interface SparkProps {
  hist: number[];
  w?: number;
  h?: number;
}

export function Spark({ hist, w = 72, h = 22 }: SparkProps) {
  const min = Math.min(...hist);
  const max = Math.max(...hist);
  const span = max - min || 1;
  const pts = hist
    .map((v, i) => `${(i / (hist.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`)
    .join(' ');
  const falling = hist[hist.length - 1]! < hist[0]!;
  return (
    <svg width={w} height={h} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={falling ? '#0F9D58' : '#9AA0A6'}
        strokeWidth={1.5}
      />
    </svg>
  );
}

// ─── Mini radar (row icon) ──────────────────────────────────────────────

interface MiniRadarProps {
  d: Device;
  size?: number;
}

export function MiniRadar({ d, size = 60 }: MiniRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;
  const n = AXES.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number) =>
    `${cx + Math.cos(angle(i)) * R * (v / 100)},${cy + Math.sin(angle(i)) * R * (v / 100)}`;
  return (
    <svg width={size} height={size} aria-hidden style={{ flexShrink: 0 }}>
      <polygon
        points={AXES.map((_, i) => pt(i, 100)).join(' ')}
        fill="none"
        stroke="#D8DAD5"
        strokeWidth={1}
      />
      <polygon
        points={AXES.map((a, i) => pt(i, d[a])).join(' ')}
        fill="#FF5C00"
        fillOpacity={0.18}
        stroke="#FF5C00"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Full radar (detail + compare) ──────────────────────────────────────

interface RadarProps {
  devices: Device[];
  maxWidth?: number;
}

export function Radar({ devices, maxWidth = 380 }: RadarProps) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 42;
  const n = AXES.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number): [number, number] => [
    cx + Math.cos(angle(i)) * R * (v / 100),
    cy + Math.sin(angle(i)) * R * (v / 100),
  ];
  const ring = (f: number) =>
    AXES.map((_, i) => pt(i, f * 100).join(',')).join(' ');
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', width: '100%', maxWidth, margin: '0 auto' }}
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="#D8DAD5" strokeWidth={1} />
      ))}
      {AXES.map((a, i) => {
        const [x, y] = pt(i, 100);
        const [lx, ly] = pt(i, 121);
        const short = AXIS_META.find((m) => m.key === a)!.short;
        return (
          <g key={a}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#D8DAD5" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                font: "500 10px 'IBM Plex Mono', monospace",
                fill: '#5F6368',
                textTransform: 'uppercase',
              }}
            >
              {short}
            </text>
          </g>
        );
      })}
      {devices.map((d, di) => {
        const c = COMPARE_COLORS[di % COMPARE_COLORS.length]!;
        return (
          <g key={d.id}>
            <polygon
              points={AXES.map((a, i) => pt(i, d[a]).join(',')).join(' ')}
              fill={c}
              fillOpacity={0.12}
              stroke={c}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {AXES.map((a, i) => {
              const [x, y] = pt(i, d[a]);
              return <circle key={a} cx={x} cy={y} r={3} fill={c} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ─── PriceChart (detail sheet, 8-week series) ───────────────────────────

interface PriceChartProps {
  hist: number[];
}

export function PriceChart({ hist }: PriceChartProps) {
  const W = 340;
  const H = 130;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const min = Math.min(...hist);
  const max = Math.max(...hist);
  const span = max - min || 1;
  const X = (i: number) => padL + (i / (hist.length - 1)) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - (v - min) / span) * (H - padT - padB);
  const pts = hist.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
  const falling = hist[hist.length - 1]! < hist[0]!;
  const drop = hist[0]! - hist[hist.length - 1]!;
  const monoStyle = { font: "500 9px 'IBM Plex Mono', monospace", fill: '#5F6368' };
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
        {[min, max].map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={Y(v)} x2={W - padR} y2={Y(v)} stroke="#E0E1DE" strokeWidth={1} />
            <text
              x={padL - 6}
              y={Y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              style={monoStyle}
            >
              £{v.toLocaleString('en-GB')}
            </text>
          </g>
        ))}
        <polyline
          points={pts}
          fill="none"
          stroke={falling ? '#0F9D58' : '#9AA0A6'}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {hist.map((v, i) => (
          <circle key={i} cx={X(i)} cy={Y(v)} r={2.5} fill={falling ? '#0F9D58' : '#9AA0A6'} />
        ))}
        <text x={padL} y={H - 6} style={monoStyle}>
          8 WKS AGO
        </text>
        <text x={W - padR} y={H - 6} textAnchor="end" style={monoStyle}>
          NOW
        </text>
      </svg>
      {drop > 0 && (
        <p
          style={{
            margin: '2px 0 0',
            font: "600 11px 'IBM Plex Mono', monospace",
            color: '#0F9D58',
          }}
        >
          ▼ £{drop} over 8 weeks
        </p>
      )}
    </div>
  );
}
