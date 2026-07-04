import { AXES, AXIS_LABEL, type Device, type WeightVector } from '../data/schema';
import { scoreDevice } from '../lib/scoring';
import { formatEcosystem, formatPrice } from '../lib/format';
import { TrackPriceForm } from './TrackPriceForm';

interface Props {
  device: Device;
  weights: WeightVector;
  allDevices: Device[];
  onClose: () => void;
  onOpenDevice: (id: string) => void;
}

export function DetailSheet({ device, weights, allDevices, onClose, onOpenDevice }: Props) {
  const score = scoreDevice(device, weights);

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside className="sheet" role="dialog" aria-label={`${device.name} details`}>
        <header>
          <div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              DEVICE / {device.id}
            </div>
            <div className="title">{device.name}</div>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </header>

        <div className="body">
          <div className="detail-hero">
            <div className="brand-line">
              {device.brand} · {device.line}
            </div>
            <h2>
              {device.name}{' '}
              <span className="badge">{score.toFixed(1)}</span>
            </h2>
            <p className="tagline">{device.tagline}</p>
          </div>

          <div className="detail-meta">
            <div className="cell">
              <div className="k">Category</div>
              <div className="v">{device.category}</div>
            </div>
            <div className="cell">
              <div className="k">Ecosystem</div>
              <div className="v">{formatEcosystem(device.ecosystem)}</div>
            </div>
            <div className="cell">
              <div className="k">Released</div>
              <div className="v">{device.releaseYear}</div>
            </div>
            <div className="cell">
              <div className="k">Typical Price</div>
              <div className="v">{formatPrice(device.price, device.currency)}</div>
            </div>
          </div>

          <div className="axis-grid">
            {AXES.map((axis) => (
              <div className="axis-row" key={axis}>
                <div className="label">{AXIS_LABEL[axis]}</div>
                <div className="bar">
                  <span style={{ width: `${device.scores[axis]}%` }} />
                </div>
                <div className="val">{device.scores[axis]}</div>
              </div>
            ))}
          </div>

          <p style={{ color: 'var(--ink-2)' }}>{device.summary}</p>

          <div className="track-price">
            <h3>Track price</h3>
            <p style={{ color: 'var(--ink-3)', margin: '6px 0 12px', fontSize: 14 }}>
              Get one email when this device hits your target. No newsletter.
            </p>
            <TrackPriceForm deviceId={device.id} />
          </div>

          {/* TODO(ingestion): render `offers` list when the price pipeline lands.
              Each row shows merchant, price, in-stock, and a deep affiliate link. */}
          <div style={{ padding: '20px 0', borderBottom: '1px solid var(--rule)' }}>
            <h3>Offers</h3>
            {device.offers.length === 0 ? (
              <p className="mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                NO LIVE OFFERS — INGESTION PENDING
              </p>
            ) : (
              <ul>
                {device.offers.map((o) => (
                  <li key={o.merchant}>
                    {o.merchant} — {formatPrice(o.price, o.currency)}{' '}
                    {o.inStock ? '(in stock)' : '(out of stock)'}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {device.pairs.length > 0 && (
            <div style={{ padding: '20px 0' }}>
              <h3>Pairs well with</h3>
              <ul className="pairs-list" style={{ marginTop: 10 }}>
                {device.pairs.map((p) => {
                  const paired = allDevices.find((d) => d.id === p.deviceId);
                  if (!paired) return null;
                  return (
                    <li key={p.deviceId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <strong>{paired.name}</strong>
                          <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 2 }}>
                            {p.reason}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn ghost small"
                          onClick={() => onOpenDevice(paired.id)}
                        >
                          Open →
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 20 }}>
            <a href={`/device/${device.id}`}>PERMALINK · /device/{device.id}</a>
          </p>
        </div>
      </aside>
    </>
  );
}
