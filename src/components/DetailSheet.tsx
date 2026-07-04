import type { Device, WeightVector } from '../data/schema';
import { AXIS_LABEL } from '../data/schema';
import { scoreDevice } from '../lib/scoring';
import { explainRank, formatEcosystem, formatPrice } from '../lib/format';
import { href } from '../lib/href';
import { HexIcon } from './HexIcon';
import { CategoryIcon } from './CategoryIcon';
import { RadarChart } from './RadarChart';
import { TrackPriceForm } from './TrackPriceForm';

interface Props {
  device: Device;
  weights: WeightVector;
  rank: number;
  allDevices: Device[];
  onClose: () => void;
  onOpenDevice: (id: string) => void;
}

export function DetailSheet({ device, weights, rank, allDevices, onClose, onOpenDevice }: Props) {
  const composite = scoreDevice(device, weights);
  const primaryOffer = device.offers[0];
  const secondaryOffer = device.offers[1];

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside className="bottom-sheet detail" role="dialog" aria-label={`${device.name} details`}>
        <div className="sheet-handle" aria-hidden />
        <button
          type="button"
          className="detail-close"
          onClick={onClose}
          aria-label="Close details"
        >
          ×
        </button>

        <div className="sheet-body detail-body">
          <div className="detail-hero">
            <div className="detail-hex">
              <HexIcon scores={device.scores} size={72} />
            </div>
            <div className="detail-hero-body">
              <h2 className="detail-name">{device.name}</h2>
              <div className="detail-tags">
                <span className="dark-chip">{device.brand}</span>
                <span className="dark-chip">{device.line}</span>
              </div>
              <div className="detail-meta">
                <CategoryIcon category={device.category} />
                <span>{titleCase(device.category)}</span>
                <span aria-hidden>·</span>
                <span>{formatEcosystem(device.ecosystem)}</span>
              </div>
              <div className="detail-badge">#{rank} at your weights</div>
              <div className="detail-price mono">
                {formatPrice(device.price, device.currency)}
              </div>
            </div>
          </div>

          <p className="detail-linepitch">{device.linePitch}</p>

          <div className="detail-explain">{explainRank(device, weights)}</div>

          <div className="detail-cta-row">
            {primaryOffer && (
              <a
                href={primaryOffer.url}
                target="_blank"
                rel="sponsored noopener"
                className="cta-primary"
              >
                {primaryOffer.merchant.toUpperCase()} →
              </a>
            )}
            {secondaryOffer && (
              <a
                href={secondaryOffer.url}
                target="_blank"
                rel="sponsored noopener"
                className="cta-secondary"
              >
                {secondaryOffer.merchant.toUpperCase()} →
              </a>
            )}
          </div>

          <details className="track-price-details">
            <summary className="cta-track">TRACK PRICE</summary>
            <div className="track-price-body">
              <TrackPriceForm deviceId={device.id} />
            </div>
          </details>

          <p className="detail-disclaimer mono">
            ↗ Retail links may earn us a commission. This never affects
            scores or ranking — offers are sorted by price only.
          </p>

          <div className="detail-section">
            <h3 className="detail-section-title">PROFILE</h3>
            <div className="detail-radar-wrap">
              <RadarChart scores={device.scores} size={280} />
            </div>
            <div className="detail-scores-grid">
              {(Object.keys(AXIS_LABEL) as (keyof typeof AXIS_LABEL)[]).map((axis) => (
                <div key={axis} className="score-cell">
                  <div className="score-cell-label">{AXIS_LABEL[axis]}</div>
                  <div className="score-cell-value mono">{device.scores[axis]}</div>
                  <div className="score-cell-bar" aria-hidden>
                    <span style={{ width: `${device.scores[axis]}%` }} />
                  </div>
                </div>
              ))}
              <div className="score-cell score-cell-composite">
                <div className="score-cell-label">Composite</div>
                <div className="score-cell-value mono accent">{composite.toFixed(1)}</div>
              </div>
            </div>
          </div>

          <p className="detail-summary">{device.summary}</p>

          {device.pairs.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">PAIRS WELL WITH</h3>
              <ul className="pairs-list">
                {device.pairs.map((p) => {
                  const paired = allDevices.find((d) => d.id === p.deviceId);
                  if (!paired) return null;
                  return (
                    <li key={paired.id}>
                      <div className="pair-row">
                        <div>
                          <strong>{paired.name}</strong>
                          <div className="pair-reason">{p.reason}</div>
                        </div>
                        <button
                          type="button"
                          className="btn-ghost-small"
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

          <p className="mono detail-permalink">
            <a href={href(`/device/${device.id}`)}>
              PERMALINK · /device/{device.id}
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
