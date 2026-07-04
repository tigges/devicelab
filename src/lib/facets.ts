import type { BrandState, Category, Device, Ecosystem } from '../data/schema';

export interface FilterState {
  cat: Category | 'All';
  eco: Ecosystem | 'All';
  brand: Record<string, BrandState>; // 'in' | 'out'; missing = neutral
  line: string; // 'All' or a specific line when exactly one brand is 'in'
}

export function emptyFilter(): FilterState {
  return { cat: 'All', eco: 'All', brand: {}, line: 'All' };
}

export function includedBrands(brand: FilterState['brand']): string[] {
  return Object.keys(brand).filter((b) => brand[b] === 'in');
}
export function excludedBrands(brand: FilterState['brand']): string[] {
  return Object.keys(brand).filter((b) => brand[b] === 'out');
}

/** Filter a pool with the current filter state. */
export function applyFilters(pool: Device[], f: FilterState): Device[] {
  const inc = new Set(includedBrands(f.brand));
  const exc = new Set(excludedBrands(f.brand));
  const lineBrand = inc.size === 1 ? [...inc][0]! : null;
  return pool.filter((d) => {
    if (f.cat !== 'All' && d.cat !== f.cat) return false;
    if (f.eco !== 'All' && d.eco !== f.eco) return false;
    if (exc.has(d.brand)) return false;
    if (inc.size > 0 && !inc.has(d.brand)) return false;
    if (lineBrand && f.line !== 'All' && d.line !== f.line) return false;
    return true;
  });
}

/** How many raw facet counts a brand has under the current cat/eco filters. */
export function brandCount(pool: Device[], brand: string, cat: string, eco: string): number {
  return pool.filter(
    (d) => d.brand === brand && (cat === 'All' || d.cat === cat) && (eco === 'All' || d.eco === eco),
  ).length;
}

export function lineCount(
  pool: Device[],
  brand: string,
  line: string,
  cat: string,
  eco: string,
): number {
  return pool.filter(
    (d) =>
      d.brand === brand &&
      d.line === line &&
      (cat === 'All' || d.cat === cat) &&
      (eco === 'All' || d.eco === eco),
  ).length;
}
