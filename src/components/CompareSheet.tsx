import type { Device, WeightVector } from '../data/schema';
import { AXES, AXIS_META } from '../data/schema';
import { COMPARE_COLORS } from '../data/merchants';
import { scoreDevice } from '../lib/scoring';
import { formatGBP } from '../lib/format';
import { Radar } from './atoms';

interface Props {
  devices: Device[];
  weights: WeightVector;
  onClose: () => void;
  onRemove: (id: number) => void;
}

export function CompareSheet({ devices, weights, onClose, onRemove }: Props) {
  return (
    <>
      <div className="dl-scrim" style={{ zIndex: 55 }} onClick={onClose} />
      <div className="dl-overlay" role="dialog" aria-label="Compare devices">
        <button
          className="dl-overlay-close"
          onClick={onClose}
          aria-label="Close comparison"
          type="button"
        >
          ×
        </button>
        <div className="dl-grabber" />
        <p className="dl-sheet-title">Compare</p>

        <div className="dl-pills">
          {devices.map((d, i) => (
            <span key={d.id} className="dl-pill">
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: COMPARE_COLORS[i],
                  borderRadius: 2,
                  display: 'inline-block',
                }}
              />
              {d.name}
              <button
                onClick={() => onRemove(d.id)}
                aria-label={`Remove ${d.name}`}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <Radar devices={devices} />

        <table className="dl-table">
          <thead>
            <tr>
              <th>Axis</th>
              {devices.map((d, i) => (
                <th key={d.id} style={{ color: COMPARE_COLORS[i] }}>
                  {d.line || d.brand}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AXIS_META.map((a) => {
              const best = Math.max(...devices.map((d) => d[a.key]));
              return (
                <tr key={a.key}>
                  <td>{a.full}</td>
                  {devices.map((d) => (
                    <td key={d.id} className={d[a.key] === best ? 'dl-best' : ''}>
                      {d[a.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <td style={{ fontWeight: 700 }}>Weighted score</td>
              {devices.map((d) => (
                <td
                  key={d.id}
                  style={{ fontWeight: 700, color: '#FF5C00' }}
                >
                  {scoreDevice(d, weights).toFixed(1)}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 700 }}>Price</td>
              {devices.map((d) => (
                <td key={d.id} style={{ fontWeight: 700 }}>
                  {formatGBP(d.price)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
