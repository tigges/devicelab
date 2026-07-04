import type { Category, Ecosystem, WeightVector } from '../data/schema';
import { AXES, AXIS_LABEL_SHORT } from '../data/schema';
import { CategoryIcon } from './CategoryIcon';
import { formatEcosystem } from '../lib/format';

interface Props {
  weights: WeightVector;
  onChangeWeights: (w: WeightVector) => void;

  category: Category | 'all';
  onChangeCategory: (c: Category | 'all') => void;

  ecosystems: Ecosystem[];
  onToggleEcosystem: (e: Ecosystem) => void;
  availableEcosystems: { ecosystem: Ecosystem; count: number }[];

  onOpenMoreFilters: () => void;
  onClose: () => void;
  resultsCount: number;
}

const CATEGORY_OPTIONS: (Category | 'all')[] = ['all', 'laptops', 'tablets', 'phones'];
const CATEGORY_LABEL: Record<Category | 'all', string> = {
  all: 'All',
  laptops: 'Laptop',
  tablets: 'Tablet',
  phones: 'Phone',
};

export function MixerSheet({
  weights,
  onChangeWeights,
  category,
  onChangeCategory,
  ecosystems,
  onToggleEcosystem,
  availableEcosystems,
  onOpenMoreFilters,
  onClose,
  resultsCount,
}: Props) {
  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside className="bottom-sheet" role="dialog" aria-label="Mixer and filters">
        <div className="sheet-handle" aria-hidden />
        <div className="sheet-body">
          <h3 className="sheet-title">MIXER &amp; FILTERS</h3>

          <div className="slider-list">
            {AXES.map((axis) => {
              const v = weights[axis] ?? 60;
              return (
                <div key={axis} className="slider-row">
                  <label htmlFor={`w-${axis}`} className="slider-label">
                    {AXIS_LABEL_SHORT[axis]}
                  </label>
                  <input
                    id={`w-${axis}`}
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={v}
                    style={{ ['--pct' as string]: `${v}%` }}
                    onChange={(e) =>
                      onChangeWeights({ ...weights, [axis]: Number(e.target.value) })
                    }
                  />
                  <span className="slider-value mono">{v}</span>
                </div>
              );
            })}
          </div>

          <div className="filter-section">
            <div className="filter-section-label">CATEGORY</div>
            <div className="segmented">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="segment"
                  data-active={c === category}
                  onClick={() => onChangeCategory(c)}
                >
                  {c !== 'all' && <CategoryIcon category={c as Category} />}
                  <span>{CATEGORY_LABEL[c]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label">ECOSYSTEM</div>
            <div className="chip-wrap">
              <button
                type="button"
                className="eco-chip"
                data-active={ecosystems.length === 0}
                onClick={() => {
                  for (const e of ecosystems) onToggleEcosystem(e);
                }}
              >
                All
              </button>
              {availableEcosystems.map(({ ecosystem }) => (
                <button
                  key={ecosystem}
                  type="button"
                  className="eco-chip"
                  data-active={ecosystems.includes(ecosystem)}
                  onClick={() => onToggleEcosystem(ecosystem)}
                >
                  {abbreviate(formatEcosystem(ecosystem))}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="more-filters-link"
            onClick={onOpenMoreFilters}
          >
            More filters →
          </button>

          <button type="button" className="btn-primary" onClick={onClose}>
            Show results ({resultsCount})
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * Ecosystem labels get truncated to fit the chip row on narrow screens,
 * matching the prototype's "Andr." / "Win" abbreviations.
 */
function abbreviate(name: string): string {
  if (name === 'Windows') return 'Win';
  if (name === 'Google') return 'Andr.';
  return name;
}
