import { useEffect, useMemo, useState } from 'react';
import type { Category, Device, Preset, WeightVector } from '../data/schema';
import { AXES, AXIS_LABEL } from '../data/schema';
import { rankDevices, type RankedDevice } from '../lib/scoring';
import { applyFilters, emptyFilter, facetsFor, type FilterState } from '../lib/facets';
import { formatEcosystem, formatPrice } from '../lib/format';
import { MixerSheet } from './MixerSheet';
import { DetailSheet } from './DetailSheet';
import { CompareSheet } from './CompareSheet';

export interface BoardProps {
  devices: Device[]; // scoped pool (filtered by category server-side)
  category: Category | 'all';
  initialWeights: WeightVector;
  presets: Preset[]; // for the mixer preset shortcuts
  activePresetSlug?: string;
  /** Passed only for display in the toolbar (e.g. "Best laptops for students"). */
  headline?: string;
}

/**
 * Root client island. Everything the user can interact with lives inside
 * this component or its sheets. The Astro page is otherwise fully static.
 *
 * URL state: the current weights are mirrored to the URL as `?w=…` so a
 * shared link opens the board in the exact configuration the user saw.
 * Filters and selections are session-only by design (they'd bloat the URL).
 */
export function Board({
  devices,
  category,
  initialWeights,
  presets,
  activePresetSlug,
  headline,
}: BoardProps) {
  const [weights, setWeights] = useState<WeightVector>(initialWeights);
  const [filter, setFilter] = useState<FilterState>(emptyFilter());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openSheet, setOpenSheet] = useState<'mixer' | 'detail' | 'compare' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Sync weights → URL (?w=perf:3,batt:2). Deterministic, human-readable.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compact = AXES.filter((a) => (weights[a] ?? 0) > 0)
      .map((a) => `${a.slice(0, 4)}:${weights[a]}`)
      .join(',');
    const url = new URL(window.location.href);
    if (compact) url.searchParams.set('w', compact);
    else url.searchParams.delete('w');
    window.history.replaceState(null, '', url.toString());
  }, [weights]);

  // Facets are recomputed against the *unfiltered* category pool so counts
  // don't collapse as the user narrows down.
  const facets = useMemo(() => facetsFor(category), [category]);

  const filteredPool = useMemo(() => applyFilters(devices, filter), [devices, filter]);
  const ranked: RankedDevice[] = useMemo(
    () => rankDevices(filteredPool, weights),
    [filteredPool, weights],
  );

  const selected = useMemo(
    () => selectedIds.map((id) => devices.find((d) => d.id === id)).filter(Boolean) as Device[],
    [selectedIds, devices],
  );

  function toggleBrand(brand: string) {
    setFilter((f) => ({
      ...f,
      brands: f.brands.includes(brand) ? f.brands.filter((b) => b !== brand) : [...f.brands, brand],
      // clear lines when brand changes so we never end up with an orphan filter
      lines: f.lines.filter((line) =>
        facets.brands
          .find((br) => br.brand === brand)
          ?.lines.includes(line) ?? false,
      ),
    }));
  }

  function toggleLine(line: string) {
    setFilter((f) => ({
      ...f,
      lines: f.lines.includes(line) ? f.lines.filter((l) => l !== line) : [...f.lines, line],
    }));
  }

  function toggleEcosystem(eco: string) {
    setFilter((f) => ({
      ...f,
      ecosystems: f.ecosystems.includes(eco as any)
        ? f.ecosystems.filter((e) => e !== eco)
        : ([...f.ecosystems, eco] as any),
    }));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id],
    );
  }

  function openDetail(id: string) {
    setDetailId(id);
    setOpenSheet('detail');
  }

  // Which brands' line chips should be shown: only brands that are currently
  // selected as filters. Otherwise the chip row explodes.
  const linesForActiveBrands = useMemo(() => {
    if (filter.brands.length === 0) return [];
    return facets.brands
      .filter((b) => filter.brands.includes(b.brand))
      .flatMap((b) => b.lines);
  }, [filter.brands, facets.brands]);

  return (
    <section className="board">
      <div className="board-toolbar container">
        <span className="toolbar-label">{headline ?? 'Ranked'}</span>
        <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
          {ranked.length} / {devices.length} devices
        </span>
        <div className="spacer" />
        <button className="btn ghost small" onClick={() => setOpenSheet('mixer')} type="button">
          Weight mixer
        </button>
        <button
          className="btn small"
          onClick={() => {
            setWeights(initialWeights);
            setFilter(emptyFilter());
          }}
          type="button"
          title="Reset weights and filters"
        >
          Reset
        </button>
      </div>

      <div className="chip-row container" role="group" aria-label="Filters">
        {facets.brands.map((b) => (
          <button
            key={b.brand}
            type="button"
            className="chip"
            data-active={filter.brands.includes(b.brand)}
            onClick={() => toggleBrand(b.brand)}
          >
            {b.brand} <span className="count">{b.count}</span>
          </button>
        ))}
        {linesForActiveBrands.length > 0 && (
          <>
            <span
              aria-hidden
              style={{
                width: 1,
                height: 22,
                background: 'var(--rule-strong)',
                alignSelf: 'center',
              }}
            />
            {linesForActiveBrands.map((line) => (
              <button
                key={line}
                type="button"
                className="chip"
                data-active={filter.lines.includes(line)}
                data-accent="true"
                onClick={() => toggleLine(line)}
              >
                {line}
              </button>
            ))}
          </>
        )}
        {facets.ecosystems.length > 1 && (
          <>
            <span
              aria-hidden
              style={{
                width: 1,
                height: 22,
                background: 'var(--rule-strong)',
                alignSelf: 'center',
              }}
            />
            {facets.ecosystems.map((e) => (
              <button
                key={e.ecosystem}
                type="button"
                className="chip"
                data-active={filter.ecosystems.includes(e.ecosystem)}
                onClick={() => toggleEcosystem(e.ecosystem)}
              >
                {formatEcosystem(e.ecosystem)} <span className="count">{e.count}</span>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="container">
        {ranked.length === 0 ? (
          <div className="empty">No devices match these filters.</div>
        ) : (
          <ul className="board-list">
            {ranked.map((row) => (
              <BoardRow
                key={row.device.id}
                row={row}
                selected={selectedIds.includes(row.device.id)}
                onOpen={() => openDetail(row.device.id)}
                onToggleSelect={() => toggleSelect(row.device.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <div className="compare-tray" role="status">
          <span>
            Compare {selected.length}
            {selected.length < 2 ? ' (pick ≥2)' : ''}
          </span>
          <div className="list">
            {selected.map((d) => (
              <span className="pill" key={d.id}>
                {d.name}
                <button
                  type="button"
                  onClick={() => toggleSelect(d.id)}
                  aria-label={`Remove ${d.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            className="go"
            disabled={selected.length < 2}
            onClick={() => setOpenSheet('compare')}
          >
            Compare →
          </button>
        </div>
      )}

      {openSheet === 'mixer' && (
        <MixerSheet
          weights={weights}
          onChange={setWeights}
          onClose={() => setOpenSheet(null)}
          presets={presets}
          activePresetSlug={activePresetSlug}
        />
      )}

      {openSheet === 'detail' && detailId && (
        <DetailSheet
          device={devices.find((d) => d.id === detailId)!}
          weights={weights}
          allDevices={devices}
          onClose={() => setOpenSheet(null)}
          onOpenDevice={(id) => setDetailId(id)}
        />
      )}

      {openSheet === 'compare' && (
        <CompareSheet
          devices={selected}
          weights={weights}
          onClose={() => setOpenSheet(null)}
          onRemove={(id) => toggleSelect(id)}
        />
      )}
    </section>
  );
}

interface BoardRowProps {
  row: RankedDevice;
  selected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
}

function BoardRow({ row, selected, onOpen, onToggleSelect }: BoardRowProps) {
  const { device, score, rank } = row;

  return (
    <li
      className="board-row"
      data-selected={selected}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <span className="rank mono">
        {rank.toString().padStart(2, '0')}
      </span>
      <div className="id-block">
        <div className="name">{device.name}</div>
        <div className="meta">
          <span>{device.brand}</span>
          <span>·</span>
          <span>{formatEcosystem(device.ecosystem)}</span>
          <span>·</span>
          <span>{device.releaseYear}</span>
        </div>
      </div>
      <div className="axis-mini" aria-hidden>
        <span style={{ width: `${score}%` }} />
      </div>
      <div className="price mono">{formatPrice(device.price, device.currency)}</div>
      <div className="score mono">{score.toFixed(1)}</div>
      <button
        type="button"
        className="compare-toggle"
        data-active={selected}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        aria-pressed={selected}
        aria-label={selected ? `Remove ${device.name} from compare` : `Add ${device.name} to compare`}
      >
        {selected ? '✓ Compare' : '+ Compare'}
      </button>
    </li>
  );
}

// Re-export the axis label constants so consuming components have one import
export { AXIS_LABEL };
