import { AXES, AXIS_LABEL, type Device, type WeightVector } from '../data/schema';
import { scoreDevice } from '../lib/scoring';
import { formatEcosystem, formatPrice } from '../lib/format';

interface Props {
  devices: Device[];
  weights: WeightVector;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export function CompareSheet({ devices, weights, onClose, onRemove }: Props) {
  // Column-order stable: sorted by composite score desc for the current mixer.
  const columns = devices
    .map((device) => ({ device, score: scoreDevice(device, weights) }))
    .sort((a, b) => b.score - a.score);

  // Per-axis best-of highlighting (highest wins). Precomputed so the render
  // stays linear.
  const bestByAxis = new Map<string, string>();
  for (const axis of AXES) {
    let bestId = columns[0]?.device.id;
    let bestVal = -Infinity;
    for (const { device } of columns) {
      if (device.scores[axis] > bestVal) {
        bestVal = device.scores[axis];
        bestId = device.id;
      }
    }
    if (bestId) bestByAxis.set(axis, bestId);
  }

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside className="sheet wide" role="dialog" aria-label="Compare devices">
        <header>
          <div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              COMPARE / {devices.length} DEVICES
            </div>
            <div className="title">Side by side</div>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Close comparison">
            ×
          </button>
        </header>
        <div className="body">
          <div style={{ overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  {columns.map(({ device }) => (
                    <th key={device.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ textTransform: 'none', fontWeight: 700, fontSize: 14 }}>
                          {device.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(device.id)}
                          style={{
                            background: 'transparent',
                            border: 0,
                            color: 'var(--ink-3)',
                            cursor: 'pointer',
                            fontSize: 14,
                          }}
                          aria-label={`Remove ${device.name} from comparison`}
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Composite</th>
                  {columns.map(({ device, score }, i) => (
                    <td key={device.id} className={`score ${i === 0 ? 'best' : ''}`}>
                      {score.toFixed(1)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Brand · Ecosystem</th>
                  {columns.map(({ device }) => (
                    <td key={device.id}>
                      {device.brand} · {formatEcosystem(device.ecosystem)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Released</th>
                  {columns.map(({ device }) => (
                    <td key={device.id} className="score">
                      {device.releaseYear}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Typical price</th>
                  {columns.map(({ device }) => (
                    <td key={device.id} className="price">
                      {formatPrice(device.price, device.currency)}
                    </td>
                  ))}
                </tr>
                {AXES.map((axis) => (
                  <tr key={axis}>
                    <th>{AXIS_LABEL[axis]}</th>
                    {columns.map(({ device }) => {
                      const winner = bestByAxis.get(axis) === device.id;
                      return (
                        <td key={device.id} className={`score ${winner ? 'best' : ''}`}>
                          {device.scores[axis]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <th>Tagline</th>
                  {columns.map(({ device }) => (
                    <td key={device.id} style={{ color: 'var(--ink-2)' }}>
                      {device.tagline}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </>
  );
}
