import type { Device, WeightVector } from '../data/schema';
import { AXES, AXIS_LABEL } from '../data/schema';
import { scoreDevice } from '../lib/scoring';
import { formatEcosystem, formatPrice } from '../lib/format';
import { HexIcon } from './HexIcon';

interface Props {
  devices: Device[];
  weights: WeightVector;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export function CompareSheet({ devices, weights, onClose, onRemove }: Props) {
  const columns = devices
    .map((device) => ({ device, score: scoreDevice(device, weights) }))
    .sort((a, b) => b.score - a.score);

  // Per-axis best-of highlighting.
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
      <aside className="bottom-sheet detail wide" role="dialog" aria-label="Compare devices">
        <div className="sheet-handle" aria-hidden />
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close comparison">
          ×
        </button>
        <div className="sheet-body detail-body">
          <h3 className="sheet-title">COMPARE · {devices.length} DEVICES</h3>

          <div className="compare-hex-row">
            {columns.map(({ device }) => (
              <div className="compare-hex-cell" key={device.id}>
                <HexIcon scores={device.scores} size={44} />
                <div className="compare-hex-name">{device.name}</div>
                <button
                  type="button"
                  className="compare-hex-remove"
                  onClick={() => onRemove(device.id)}
                  aria-label={`Remove ${device.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th />
                  {columns.map(({ device }) => (
                    <th key={device.id}>{device.name}</th>
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
                  <th>Typical price</th>
                  {columns.map(({ device }) => (
                    <td key={device.id} className="score">
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
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </>
  );
}
