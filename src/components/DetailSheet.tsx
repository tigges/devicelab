import { useState } from 'react';
import type { Device, WeightVector } from '../data/schema';
import { AXIS_META } from '../data/schema';
import { LINES } from '../data/lines';
import { BRAND_COLORS, amazonUrl, mfgUrl } from '../data/merchants';
import { explainRank, formatGBP } from '../lib/format';
import { href } from '../lib/href';
import { CatGlyph, PriceChart, Radar } from './atoms';
import { TrackPriceForm } from './TrackPriceForm';
import { slugify } from '../data/devices';

interface Props {
  device: Device;
  weights: WeightVector;
  rank: number;
  onClose: () => void;
}

export function DetailSheet({ device, weights, rank, onClose }: Props) {
  const [trackOpen, setTrackOpen] = useState(false);
  const lineMeta = device.line ? LINES[device.brand]?.[device.line] : undefined;
  const mfg = mfgUrl(device);
  const why = explainRank(device, weights, rank);

  return (
    <>
      <div className="dl-scrim" style={{ zIndex: 55 }} onClick={onClose} />
      <div className="dl-overlay" role="dialog" aria-label={`${device.name} details`}>
        <button
          className="dl-overlay-close"
          onClick={onClose}
          aria-label="Close details"
          type="button"
        >
          ×
        </button>
        <div className="dl-grabber" />

        <div className="dl-detail-hero">
          <div className="dl-detail-glyph">
            <CatGlyph cat={device.cat} size={52} strokeWidth={1.4} />
          </div>
          <div>
            <h2 className="dl-detail-name">{device.name}</h2>
            <div className="dl-detail-sub">
              <span style={{ color: BRAND_COLORS[device.brand] ?? '#5F6368', fontWeight: 700 }}>
                {device.brand}
              </span>
              {device.line && <span className="dl-linepill">{device.line}</span>}
              <span>
                · {device.cat === 'Desktop' ? 'PC' : device.cat} · {device.eco}
              </span>
              {rank > 0 && <span className="dl-rankpill">#{rank} at your weights</span>}
            </div>
            <div style={{ marginTop: 8, font: "700 18px 'IBM Plex Mono', monospace" }}>
              {formatGBP(device.price)}
            </div>
          </div>
        </div>

        {lineMeta && (
          <p
            style={{
              margin: '0 0 10px',
              font: "400 12px 'Archivo', sans-serif",
              color: '#5F6368',
            }}
          >
            <strong>{device.line}:</strong> {lineMeta.desc}
          </p>
        )}

        <p className="dl-why">{why}</p>

        <div className="dl-buy">
          <a
            className="dl-buy-btn dl-buy-btn--primary"
            href={amazonUrl(device)}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            Amazon UK →
          </a>
          {mfg && (
            <a
              className="dl-buy-btn dl-buy-btn--ghost"
              href={mfg}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              {device.brand} store →
            </a>
          )}
          <button
            className="dl-buy-btn dl-buy-btn--ghost"
            onClick={() => setTrackOpen((o) => !o)}
            type="button"
          >
            {trackOpen ? 'Track price ↑' : 'Track price ↓'}
          </button>
        </div>
        {trackOpen && (
          <div style={{ marginTop: 10 }}>
            <TrackPriceForm deviceId={String(device.id)} />
          </div>
        )}
        <p className="dl-disclosure">
          ↗ Retail links may earn us a commission. This never affects scores or ranking — offers
          are sorted by price only.
        </p>

        <p className="dl-section-h">Profile</p>
        <Radar devices={[device]} maxWidth={320} />

        <p className="dl-section-h">
          Score breakdown{' '}
          <span className="dl-bd-weight">bar = device score · % = your weight</span>
        </p>
        <div>
          {AXIS_META.map((a) => (
            <div key={a.key} className="dl-breakdown-row">
              <span className="dl-slider-label">{a.label}</span>
              <div className="dl-bd-bar">
                <div style={{ width: `${device[a.key]}%` }} />
              </div>
              <span className="dl-bd-weight">{weights[a.key]}%</span>
            </div>
          ))}
        </div>

        <p className="dl-section-h">Price · 8 weeks</p>
        <PriceChart hist={device.hist} />

        <p className="dl-section-h">Pairs well with</p>
        <div className="dl-pairs">
          {device.pairs.map((pr) => (
            <div key={pr} className="dl-pair-card">
              {pr}
            </div>
          ))}
        </div>

        <p className="dl-permalink">
          <a href={href(`/device/${slugify(device)}`)}>PERMALINK · /device/{slugify(device)}</a>
        </p>
      </div>
    </>
  );
}
