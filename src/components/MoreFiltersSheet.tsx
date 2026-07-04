import type { BrandFacet } from '../lib/facets';
import { cycleBrandState } from '../lib/facets';
import type { BrandTriState } from '../data/schema';

interface Props {
  brands: BrandFacet[];
  state: Record<string, BrandTriState>;
  onChange: (next: Record<string, BrandTriState>) => void;
  onBack: () => void;
  onClose: () => void;
  resultsCount: number;
}

/**
 * Sub-sheet for brand-level filtering. Each chip cycles through
 * neutral → only → exclude → neutral (matches the prototype hint
 * "tap = only · again = exclude · again = clear").
 */
export function MoreFiltersSheet({
  brands,
  state,
  onChange,
  onBack,
  onClose,
  resultsCount,
}: Props) {
  function cycle(brand: string) {
    const next = cycleBrandState(state[brand] ?? 'neutral');
    const clone = { ...state };
    if (next === 'neutral') delete clone[brand];
    else clone[brand] = next;
    onChange(clone);
  }

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside className="bottom-sheet" role="dialog" aria-label="More filters">
        <div className="sheet-handle" aria-hidden />
        <div className="sheet-body">
          <button type="button" className="back-link" onClick={onBack}>
            ← Back to mixer
          </button>
          <h3 className="sheet-title" style={{ marginTop: 14 }}>MORE FILTERS</h3>

          <div className="filter-section">
            <div className="filter-section-label">
              BRANDS <span className="hint">tap = only · again = exclude · again = clear</span>
            </div>
            <div className="chip-wrap">
              {brands.map((b) => {
                const s = state[b.brand] ?? 'neutral';
                return (
                  <button
                    key={b.brand}
                    type="button"
                    className="brand-chip"
                    data-state={s}
                    onClick={() => cycle(b.brand)}
                    aria-pressed={s !== 'neutral'}
                    aria-label={`${b.brand}: ${s}. Click to cycle.`}
                  >
                    <span>{b.brand}</span>
                    <span className="count">· {b.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className="btn-primary" onClick={onClose}>
            Show results ({resultsCount})
          </button>
        </div>
      </aside>
    </>
  );
}
