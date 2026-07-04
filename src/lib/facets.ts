import type { BrandTriState, Category, Device, Ecosystem } from '../data/schema';
import { DEVICES } from '../data/devices';

export interface BrandFacet {
  brand: string;
  count: number;
}

/** Facet aggregator for the mixer + more-filters sheets. */
export function facetsFor(category: Category | 'all'): {
  brands: BrandFacet[];
  ecosystems: { ecosystem: Ecosystem; count: number }[];
  totalDevices: number;
} {
  const pool = category === 'all' ? DEVICES : DEVICES.filter((d) => d.category === category);

  const brandCounts = new Map<string, number>();
  const ecoCounts = new Map<Ecosystem, number>();
  for (const d of pool) {
    brandCounts.set(d.brand, (brandCounts.get(d.brand) ?? 0) + 1);
    ecoCounts.set(d.ecosystem, (ecoCounts.get(d.ecosystem) ?? 0) + 1);
  }

  const brands: BrandFacet[] = [...brandCounts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand));

  const ecosystems = [...ecoCounts.entries()]
    .map(([ecosystem, count]) => ({ ecosystem, count }))
    .sort((a, b) => b.count - a.count);

  return { brands, ecosystems, totalDevices: pool.length };
}

/** Cycle a tri-state brand chip: neutral → only → exclude → neutral. */
export function cycleBrandState(current: BrandTriState): BrandTriState {
  if (current === 'neutral') return 'only';
  if (current === 'only') return 'exclude';
  return 'neutral';
}

export interface FilterState {
  category: Category | 'all';
  ecosystems: Ecosystem[];
  /** brand → tri-state; missing keys are neutral. */
  brands: Record<string, BrandTriState>;
}

export function emptyFilter(): FilterState {
  return { category: 'all', ecosystems: [], brands: {} };
}

/** Extract `only` + `exclude` brand sets from the tri-state map. */
function brandSets(brands: FilterState['brands']): { only: Set<string>; exclude: Set<string> } {
  const only = new Set<string>();
  const exclude = new Set<string>();
  for (const [brand, state] of Object.entries(brands)) {
    if (state === 'only') only.add(brand);
    else if (state === 'exclude') exclude.add(brand);
  }
  return { only, exclude };
}

export function applyFilters(pool: Device[], filter: FilterState): Device[] {
  const { only, exclude } = brandSets(filter.brands);
  return pool.filter((d) => {
    if (filter.category !== 'all' && d.category !== filter.category) return false;
    if (filter.ecosystems.length && !filter.ecosystems.includes(d.ecosystem)) return false;
    if (only.size > 0 && !only.has(d.brand)) return false;
    if (exclude.has(d.brand)) return false;
    return true;
  });
}

export function countActiveFilters(filter: FilterState): number {
  let n = 0;
  if (filter.category !== 'all') n += 1;
  n += filter.ecosystems.length;
  n += Object.values(filter.brands).filter((s) => s !== 'neutral').length;
  return n;
}
