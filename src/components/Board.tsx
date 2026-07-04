import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  BrandState,
  Category,
  Device,
  Ecosystem,
  PersonaId,
  WeightVector,
} from '../data/schema';
import { AXES, AXIS_META } from '../data/schema';
import { PERSONAS, personaById } from '../data/personas';
import { LINES } from '../data/lines';
import { BRAND_COLORS } from '../data/merchants';
import {
  applyFilters,
  brandCount,
  emptyFilter,
  excludedBrands,
  includedBrands,
  lineCount,
  type FilterState,
} from '../lib/facets';
import { rankDevices } from '../lib/scoring';
import { formatGBP } from '../lib/format';
import { href } from '../lib/href';
import { CatGlyph, MiniRadar, Spark } from './atoms';
import { DetailSheet } from './DetailSheet';
import { CompareSheet } from './CompareSheet';
import { BRANDS } from '../data/devices';

const CATS: (Category | 'All')[] = ['All', 'Laptop', 'Tablet', 'Desktop'];
const ECOS: (Ecosystem | 'All')[] = ['All', 'Apple', 'Windows', 'Android', 'ChromeOS'];

const ECO_ABBR: Record<string, string> = {
  Windows: 'Win',
  ChromeOS: 'Chrome',
  Android: 'Andr.',
};

const catLabel = (c: Category | 'All') => (c === 'Desktop' ? 'PC' : c);

export interface BoardProps {
  devices: Device[];
  initialPersonaId?: PersonaId;
  initialCategory?: Category | 'All';
  activePresetSlug?: string;
}

/**
 * Root client island. State layout:
 *   - `weights` + `preset` — the mixer. Any manual slider flips preset
 *     to null ("Custom").
 *   - `filter` — category / ecosystem / brand tri-state / line.
 *   - `compare` — up to 3 device ids in the tray.
 *   - `sheet` — which sheet is open (mixer / detail / compare / null).
 *   - `pane`  — inside the mixer sheet, 'mixer' vs 'more'.
 *
 * Rank deltas (▲/▼) are tracked in a ref between renders — cheap and
 * doesn't need to persist across sessions.
 */
export function Board({
  devices,
  initialPersonaId = 'Overall',
  initialCategory = 'All',
  activePresetSlug: _activePresetSlug,
}: BoardProps) {
  const initialPersona = personaById(initialPersonaId) ?? PERSONAS[0]!;

  const [weights, setWeights] = useState<WeightVector>(initialPersona.weights);
  const [preset, setPreset] = useState<PersonaId | null>(initialPersona.id);
  const [filter, setFilter] = useState<FilterState>({
    ...emptyFilter(),
    cat: initialCategory,
  });

  const [compare, setCompare] = useState<number[]>([]);
  const [sheet, setSheet] = useState<'mixer' | 'detail' | 'compare' | null>(null);
  const [pane, setPane] = useState<'mixer' | 'more'>('mixer');
  const [detailId, setDetailId] = useState<number | null>(null);

  const prevRanks = useRef<Record<number, number>>({});
  const [deltas, setDeltas] = useState<Record<number, number>>({});

  // Mirror weights → URL (?w=…).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compact = AXES.filter((a) => weights[a] !== 60)
      .map((a) => `${a}:${weights[a]}`)
      .join(',');
    const url = new URL(window.location.href);
    if (compact) url.searchParams.set('w', compact);
    else url.searchParams.delete('w');
    if (preset) url.searchParams.set('p', preset);
    else url.searchParams.delete('p');
    window.history.replaceState(null, '', url.toString());
  }, [weights, preset]);

  const inc = includedBrands(filter.brand);
  const exc = excludedBrands(filter.brand);
  const brandFilterCount = inc.length + exc.length;
  const lineBrand = inc.length === 1 ? inc[0]! : null;
  const lineDefs = lineBrand ? LINES[lineBrand] : null;

  const filteredPool = useMemo(() => applyFilters(devices, filter), [devices, filter]);
  const ranked = useMemo(() => rankDevices(filteredPool, weights), [filteredPool, weights]);

  // Track rank deltas across renders.
  useEffect(() => {
    const now: Record<number, number> = {};
    ranked.forEach((r, i) => {
      now[r.device.id] = i;
    });
    const del: Record<number, number> = {};
    ranked.forEach((r) => {
      if (prevRanks.current[r.device.id] !== undefined) {
        del[r.device.id] = prevRanks.current[r.device.id]! - now[r.device.id]!;
      }
    });
    setDeltas(del);
    prevRanks.current = now;
  }, [ranked]);

  const topScore = ranked[0]?.score ?? 1;

  // ── handlers ──────────────────────────────────────────────────────
  function setWeightKey(k: keyof WeightVector, v: number) {
    setWeights((w) => ({ ...w, [k]: v }));
    setPreset(null);
  }
  function applyPreset(id: PersonaId) {
    const p = personaById(id)!;
    setWeights(p.weights);
    setPreset(id);
  }
  function cycleBrand(b: string) {
    setFilter((f) => {
      const cur = f.brand[b];
      const brand: Record<string, BrandState> = { ...f.brand };
      if (!cur) brand[b] = 'in';
      else if (cur === 'in') brand[b] = 'out';
      else delete brand[b];
      return { ...f, brand, line: 'All' };
    });
  }
  function toggleCompare(id: number) {
    setCompare((c) =>
      c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c,
    );
  }
  function openDetail(id: number) {
    setDetailId(id);
    setSheet('detail');
  }
  function clearAllFilters() {
    setFilter(emptyFilter());
  }

  const compareDevices = devices.filter((d) => compare.includes(d.id));
  const detailDevice = detailId ? devices.find((d) => d.id === detailId) : null;
  const detailRank = detailDevice
    ? ranked.findIndex((r) => r.device.id === detailDevice.id) + 1
    : 0;

  // ── mixer panels (reused in sidebar + bottom sheet) ────────────────
  const mixerPanel = (
    <>
      <div className="dl-sliders">
        {AXIS_META.map((a) => (
          <label key={a.key} className="dl-slider-row">
            <span className="dl-slider-label">{a.label}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[a.key]}
              onChange={(e) => setWeightKey(a.key, +e.target.value)}
              aria-label={`${a.full} weight`}
            />
            <span className="dl-slider-val">{weights[a.key]}</span>
          </label>
        ))}
      </div>
      <div className="dl-filter-grid">
        <div>
          <p className="dl-eyebrow">Category</p>
          <div className="dl-seg">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setFilter((f) => ({ ...f, cat: c }))}
                className={`dl-seg-btn ${filter.cat === c ? 'dl-seg-btn--on' : ''}`}
              >
                {c !== 'All' && (
                  <CatGlyph
                    cat={c as Category}
                    size={15}
                    stroke={filter.cat === c ? '#F2F3F1' : '#1A1D21'}
                  />
                )}
                <span>{catLabel(c)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="dl-eyebrow">Ecosystem</p>
          <div className="dl-seg">
            {ECOS.map((e) => (
              <button
                key={e}
                onClick={() => setFilter((f) => ({ ...f, eco: e }))}
                className={`dl-seg-btn ${filter.eco === e ? 'dl-seg-btn--on' : ''}`}
              >
                <span>{ECO_ABBR[e] ?? e}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <button className="dl-more" onClick={() => setPane('more')} type="button">
        More filters{brandFilterCount > 0 ? ` · ${brandFilterCount} active` : ''} →
      </button>
    </>
  );

  const morePanel = (
    <>
      <button className="dl-back" onClick={() => setPane('mixer')} type="button">
        ← Back to mixer
      </button>
      <p className="dl-eyebrow">
        Brands <span className="dl-hint">tap = only · again = exclude · again = clear</span>
      </p>
      <div className="dl-chip-row">
        {BRANDS.map((b) => {
          const st = filter.brand[b];
          const n = brandCount(devices, b, filter.cat, filter.eco);
          return (
            <button
              key={b}
              onClick={() => cycleBrand(b)}
              disabled={n === 0}
              className={`dl-chip dl-chip--sm ${st === 'in' ? 'dl-chip--ink' : ''} ${
                st === 'out' ? 'dl-chip--out' : ''
              }`}
              aria-pressed={st === 'in'}
              type="button"
            >
              {st === 'out' ? '✕ ' : ''}
              {b} · {n}
            </button>
          );
        })}
      </div>
      {brandFilterCount > 0 && (
        <button
          className="dl-clear"
          onClick={() => setFilter((f) => ({ ...f, brand: {}, line: 'All' }))}
          type="button"
        >
          Clear brand filters
        </button>
      )}
    </>
  );

  const panelBody = pane === 'mixer' ? mixerPanel : morePanel;

  // ── render ─────────────────────────────────────────────────────────
  return (
    <div className="dl-root">
      <div className="dl-strip" aria-label="Presets">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className={`dl-chip ${preset === p.id ? 'dl-chip--hot' : ''}`}
            title={p.blurb}
            type="button"
          >
            {p.id}
          </button>
        ))}
      </div>

      {lineDefs && (
        <>
          <div className="dl-strip dl-strip--lines" aria-label={`${lineBrand} lines`}>
            <button
              onClick={() => setFilter((f) => ({ ...f, line: 'All' }))}
              className={`dl-chip dl-chip--line ${filter.line === 'All' ? 'dl-chip--line-on' : ''}`}
              type="button"
            >
              All
            </button>
            {Object.keys(lineDefs).map((l) => {
              const n = lineCount(devices, lineBrand, l, filter.cat, filter.eco);
              return (
                <button
                  key={l}
                  onClick={() => setFilter((f) => ({ ...f, line: l }))}
                  disabled={n === 0}
                  className={`dl-chip dl-chip--line ${filter.line === l ? 'dl-chip--line-on' : ''}`}
                  type="button"
                >
                  {l} · {n}
                </button>
              );
            })}
          </div>
          {filter.line !== 'All' && lineDefs[filter.line] && (
            <div className="dl-linebar">
              <p>
                <strong>{filter.line}</strong> — {lineDefs[filter.line]!.desc}
              </p>
              {preset !== lineDefs[filter.line]!.preset && (
                <button
                  className="dl-linebar-cta"
                  onClick={() => applyPreset(lineDefs[filter.line]!.preset)}
                  type="button"
                >
                  Try {lineDefs[filter.line]!.preset} weights
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="dl-layout">
        <aside className="dl-sidebar">
          <p className="dl-sheet-title">{pane === 'mixer' ? 'Mixer & filters' : 'More filters'}</p>
          {panelBody}
        </aside>

        <main className="dl-main">
          {ranked.length === 0 && (
            <div className="dl-empty">
              No devices match these filters.
              <div>
                <button className="dl-clear" onClick={clearAllFilters} type="button">
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {ranked.map((r, i) => {
            const d = r.device;
            const delta = deltas[d.id] ?? 0;
            const inCompare = compare.includes(d.id);
            return (
              <article
                key={d.id}
                className={`dl-card ${i === 0 ? 'dl-card--top' : ''}`}
                onClick={() => openDetail(d.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetail(d.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="dl-card-head">
                  <div>
                    <span className="dl-rank">{i + 1}</span>
                    {delta !== 0 && (
                      <span
                        className="dl-delta"
                        style={{ color: delta > 0 ? '#0F9D58' : '#D93025' }}
                      >
                        {delta > 0 ? `▲${delta}` : `▼${-delta}`}
                      </span>
                    )}
                  </div>
                  <MiniRadar d={d} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="dl-name">{d.name}</div>
                    <div className="dl-meta">
                      <CatGlyph cat={d.cat} size={14} stroke="#5F6368" strokeWidth={1.6} />
                      <span
                        style={{ color: BRAND_COLORS[d.brand] ?? '#5F6368', fontWeight: 700 }}
                      >
                        {d.brand}
                      </span>
                      {d.line && <span>· {d.line}</span>}
                      <span>· {d.eco}</span>
                    </div>
                  </div>
                  <button
                    className={`dl-vs ${inCompare ? 'dl-vs--on' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(d.id);
                    }}
                    aria-pressed={inCompare}
                    aria-label={`Compare ${d.name}`}
                    type="button"
                  >
                    VS
                  </button>
                </div>
                <div className="dl-card-body">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="dl-score">{r.score.toFixed(1)}</span>
                    <div className="dl-bar">
                      <div style={{ width: `${(r.score / topScore) * 100}%` }} />
                    </div>
                  </div>
                  <Spark hist={d.hist} />
                  <div className="dl-price">{formatGBP(d.price)}</div>
                </div>
              </article>
            );
          })}
        </main>
      </div>

      {compareDevices.length > 0 && (
        <div className="dl-tray" aria-label="Compare selection">
          <div className="dl-tray-chips">
            {compareDevices.map((d) => (
              <span key={d.id} className="dl-tray-chip">
                {d.name.length > 18 ? d.name.slice(0, 17) + '…' : d.name}
                <button
                  onClick={() => toggleCompare(d.id)}
                  aria-label={`Remove ${d.name} from compare`}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {compareDevices.length >= 2 ? (
            <button
              className="dl-tray-go"
              onClick={() => setSheet('compare')}
              type="button"
            >
              Compare ({compareDevices.length}) →
            </button>
          ) : (
            <span className="dl-tray-hint">pick 1 more</span>
          )}
        </div>
      )}

      <button
        className="dl-fab"
        onClick={() => {
          setPane('mixer');
          setSheet('mixer');
        }}
        type="button"
      >
        ⚙ Mixer &amp; filters · {preset ?? 'Custom'}
      </button>

      {sheet === 'mixer' && (
        <>
          <div className="dl-scrim" onClick={() => setSheet(null)} />
          <div className="dl-sheet" role="dialog" aria-label="Mixer and filters">
            <div className="dl-grabber" />
            <p className="dl-sheet-title">
              {pane === 'mixer' ? 'Mixer & filters' : 'More filters'}
            </p>
            {panelBody}
            <button className="dl-done" onClick={() => setSheet(null)} type="button">
              Show results ({ranked.length})
            </button>
          </div>
        </>
      )}

      {sheet === 'detail' && detailDevice && (
        <DetailSheet
          device={detailDevice}
          weights={weights}
          rank={detailRank}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'compare' && compareDevices.length >= 2 && (
        <CompareSheet
          devices={compareDevices}
          weights={weights}
          onClose={() => setSheet(null)}
          onRemove={(id) => {
            toggleCompare(id);
            if (compareDevices.length <= 2) setSheet(null);
          }}
        />
      )}
    </div>
  );
}

// Referenced by pages for the `permalink` sidebar hint.
export { href };
