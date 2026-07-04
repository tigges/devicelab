import { AXES, AXIS_LABEL, type Preset, type WeightVector } from '../data/schema';

interface Props {
  weights: WeightVector;
  onChange: (next: WeightVector) => void;
  onClose: () => void;
  presets: Preset[];
  activePresetSlug?: string;
}

export function MixerSheet({ weights, onChange, onClose, presets, activePresetSlug }: Props) {
  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside className="sheet" role="dialog" aria-label="Weight mixer">
        <header>
          <div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              MIXER
            </div>
            <div className="title">Tune the ranking</div>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Close mixer">
            ×
          </button>
        </header>
        <div className="body">
          <p style={{ color: 'var(--ink-2)', marginTop: 0 }}>
            Slide any axis up to weight it heavier. Weights are relative — the ranking
            re-scores instantly. Zero everything to fall back to equal weights.
          </p>

          <div className="mixer-preset-row" style={{ marginTop: 14 }}>
            {presets.map((p) => (
              <button
                key={p.slug}
                type="button"
                className="chip"
                data-active={p.slug === activePresetSlug}
                data-accent="true"
                onClick={() => onChange(p.weights)}
                title={p.blurb}
              >
                {p.title.replace(/^Best /, '')}
              </button>
            ))}
          </div>

          <div style={{ paddingTop: 8 }}>
            {AXES.map((axis) => {
              const value = weights[axis] ?? 0;
              return (
                <div key={axis} className="mixer-axis">
                  <div className="name">{AXIS_LABEL[axis]}</div>
                  <div className="value">{value.toFixed(1)}</div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={value}
                    onChange={(e) =>
                      onChange({ ...weights, [axis]: parseFloat(e.target.value) })
                    }
                    aria-label={`${AXIS_LABEL[axis]} weight`}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button
              type="button"
              className="btn ghost small"
              onClick={() => onChange({})}
            >
              Zero all
            </button>
            <button
              type="button"
              className="btn small"
              onClick={onClose}
              style={{ marginLeft: 'auto' }}
            >
              Apply
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
