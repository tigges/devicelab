import { useEffect, useMemo, useState } from 'react';
import type { Category, Device, Ecosystem, Persona, Preset, WeightVector } from '../data/schema';
import { AXES } from '../data/schema';
import { DEFAULT_PERSONA, PERSONAS } from '../data/personas';
import { rankDevices, type RankedDevice } from '../lib/scoring';
import { applyFilters, countActiveFilters, emptyFilter, facetsFor, type FilterState } from '../lib/facets';
import { formatEcosystem, formatPrice } from '../lib/format';
import { href } from '../lib/href';
import { HexIcon } from './HexIcon';
import { Sparkline } from './Sparkline';
import { CategoryIcon } from './CategoryIcon';
import { MixerSheet } from './MixerSheet';
import { MoreFiltersSheet } from './MoreFiltersSheet';
import { DetailSheet } from './DetailSheet';
import { CompareSheet } from './CompareSheet';

export interface BoardProps {
  /** All devices — filtering happens inside the island (mixer + tri-state). */
  devices: Device[];
  presets: Preset[];
  initialPersonaId?: Persona['id'];
  initialCategory?: Category | 'all';
  /** Set from an SEO landing route so the chip lights up. */
  activePresetSlug?: string;
}

/**
 * Root client island. Persona chips at the top select a weight vector,
 * mixer sheet lets you nudge sliders + change category/ecosystem, and
 * a sticky bottom bar reveals the mixer on tap. Detail + Compare sheets
 * slide up over the board.
 */
export function Board({
  devices,
  presets: _presets,
  initialPersonaId,
  initialCategory = 'all',
  activePresetSlug: _activePresetSlug,
}: BoardProps) {
  const initialPersona =
    PERSONAS.find((p) => p.id === initialPersonaId) ?? DEFAULT_PERSONA;

  const [personaId, setPersonaId] = useState<Persona['id']>(initialPersona.id);
  const [weights, setWeights] = useState<WeightVector>(initialPersona.weights);
  const [filter, setFilter] = useState<FilterState>({
    ...emptyFilter(),
    category: initialCategory,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sheet, setSheet] = useState<'mixer' | 'more' | 'detail' | 'compare' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Mirror weights to the URL as ?w=… so a link restores the exact
  // ranking. Compact encoding (perf:60,batt:60,…).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compact = AXES.filter((a) => (weights[a] ?? 0) !== 60)
      .map((a) => `${a.slice(0, 4)}:${weights[a]}`)
      .join(',');
    const url = new URL(window.location.href);
    if (compact) url.searchParams.set('w', compact);
    else url.searchParams.delete('w');
    window.history.replaceState(null, '', url.toString());
  }, [weights]);

  const facets = useMemo(() => facetsFor(filter.category), [filter.category]);
  const filteredPool = useMemo(() => applyFilters(devices, filter), [devices, filter]);
  const ranked: RankedDevice[] = useMemo(
    () => rankDevices(filteredPool, weights),
    [filteredPool, weights],
  );

  const selected = useMemo(
    () => selectedIds.map((id) => devices.find((d) => d.id === id)).filter(Boolean) as Device[],
    [selectedIds, devices],
  );

  function selectPersona(id: Persona['id']) {
    const p = PERSONAS.find((x) => x.id === id);
    if (!p) return;
    setPersonaId(id);
    setWeights(p.weights);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id],
    );
  }

  function openDetail(id: string) {
    setDetailId(id);
    setSheet('detail');
  }

  const activePersona = PERSONAS.find((p) => p.id === personaId) ?? DEFAULT_PERSONA;
  const activeFilters = countActiveFilters(filter);
  const totalDevices = devices.length;

  return (
    <section className="board">
      <div className="container board-meta">
        <span className="mono board-meta-count">
          {totalDevices} RANKED · LIVE SCORES
        </span>
      </div>

      <div className="container">
        <div
          className="persona-row"
          role="tablist"
          aria-label="Persona presets"
        >
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={p.id === personaId}
              className="persona-chip"
              data-active={p.id === personaId}
              onClick={() => selectPersona(p.id)}
              title={p.blurb}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container board-list-wrap">
        {ranked.length === 0 ? (
          <div className="empty">No devices match these filters.</div>
        ) : (
          <ul className="board-list">
            {ranked.map((row) => (
              <BoardCard
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

      {mounted && selected.length >= 2 && (
        <div className="compare-tray" role="status">
          <span>Compare {selected.length}</span>
          <div className="compare-tray-list">
            {selected.map((d) => (
              <span className="compare-pill" key={d.id}>
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
          <button type="button" className="compare-go" onClick={() => setSheet('compare')}>
            Compare →
          </button>
        </div>
      )}

      <div className="sticky-mixer-wrap">
        <div className="container">
          <button
            type="button"
            className="sticky-mixer-btn"
            onClick={() => setSheet('mixer')}
            aria-label="Open mixer and filters"
          >
            <span className="cog" aria-hidden>⚙</span>
            <span>MIXER &amp; FILTERS · {activePersona.label.toUpperCase()}</span>
            {activeFilters > 0 && <span className="badge-count">{activeFilters}</span>}
          </button>
        </div>
      </div>

      {sheet === 'mixer' && (
        <MixerSheet
          weights={weights}
          onChangeWeights={setWeights}
          category={filter.category}
          onChangeCategory={(c) => setFilter((f) => ({ ...f, category: c }))}
          ecosystems={filter.ecosystems}
          onToggleEcosystem={(e) =>
            setFilter((f) => ({
              ...f,
              ecosystems: f.ecosystems.includes(e)
                ? f.ecosystems.filter((x) => x !== e)
                : [...f.ecosystems, e],
            }))
          }
          availableEcosystems={facets.ecosystems as { ecosystem: Ecosystem; count: number }[]}
          onOpenMoreFilters={() => setSheet('more')}
          onClose={() => setSheet(null)}
          resultsCount={ranked.length}
        />
      )}

      {sheet === 'more' && (
        <MoreFiltersSheet
          brands={facets.brands}
          state={filter.brands}
          onChange={(brands) => setFilter((f) => ({ ...f, brands }))}
          onBack={() => setSheet('mixer')}
          onClose={() => setSheet(null)}
          resultsCount={ranked.length}
        />
      )}

      {sheet === 'detail' && detailId && (
        <DetailSheet
          device={devices.find((d) => d.id === detailId)!}
          weights={weights}
          rank={ranked.findIndex((r) => r.device.id === detailId) + 1}
          allDevices={devices}
          onClose={() => setSheet(null)}
          onOpenDevice={(id) => setDetailId(id)}
        />
      )}

      {sheet === 'compare' && (
        <CompareSheet
          devices={selected}
          weights={weights}
          onClose={() => setSheet(null)}
          onRemove={toggleSelect}
        />
      )}
    </section>
  );
}

interface CardProps {
  row: RankedDevice;
  selected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
}

function BoardCard({ row, selected, onOpen, onToggleSelect }: CardProps) {
  const { device, score, rank } = row;

  return (
    <li>
      <div
        className="device-card"
        data-selected={selected}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="dc-rank">{rank}</div>
        <div className="dc-hex">
          <HexIcon scores={device.scores} size={48} />
        </div>
        <div className="dc-name-block">
          <div className="dc-name">{device.name}</div>
          <div className="dc-meta">
            <CategoryIcon category={device.category} />
            <span className="dc-brand">{device.brand}</span>
            <span aria-hidden>·</span>
            <span>{device.line}</span>
            <span aria-hidden>·</span>
            <span>{formatEcosystem(device.ecosystem)}</span>
          </div>
        </div>
        <button
          type="button"
          className="dc-vs"
          data-active={selected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${device.name} from compare` : `Add ${device.name} to compare`}
        >
          VS
        </button>
        <div className="dc-score-block">
          <div className="dc-score">{score.toFixed(1)}</div>
          <div className="dc-bar" aria-hidden>
            <span style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
          </div>
        </div>
        <div className="dc-spark" aria-hidden>
          <Sparkline history={device.priceHistory} currentPrice={device.price} />
        </div>
        <div className="dc-price mono">
          {formatPrice(device.price, device.currency)}
        </div>
        <a
          className="dc-permalink"
          href={href(`/device/${device.id}`)}
          aria-label={`Permalink for ${device.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          ↗
        </a>
      </div>
    </li>
  );
}
