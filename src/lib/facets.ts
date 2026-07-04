import type { Category, Device, Ecosystem } from '../data/schema';
import { DEVICES } from '../data/devices';

export interface BrandFacet {
  brand: string;
  count: number;
  lines: string[];
}

/**
 * Facet aggregator for the filter chips row. Runs on prerender for the
 * initial island props and (cheaply) on every mixer change client-side.
 */
export function facetsFor(category: Category | 'all'): {
  brands: BrandFacet[];
  ecosystems: { ecosystem: Ecosystem; count: number }[];
  totalDevices: number;
} {
  const pool = category === 'all' ? DEVICES : DEVICES.filter((d) => d.category === category);

  const brandMap = new Map<string, { count: number; lines: Set<string> }>();
  const ecoMap = new Map<Ecosystem, number>();

  for (const d of pool) {
    const brand = brandMap.get(d.brand) ?? { count: 0, lines: new Set() };
    brand.count += 1;
    brand.lines.add(d.line);
    brandMap.set(d.brand, brand);

    ecoMap.set(d.ecosystem, (ecoMap.get(d.ecosystem) ?? 0) + 1);
  }

  const brands: BrandFacet[] = [...brandMap.entries()]
    .map(([brand, info]) => ({
      brand,
      count: info.count,
      lines: [...info.lines].sort(),
    }))
    .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand));

  const ecosystems = [...ecoMap.entries()]
    .map(([ecosystem, count]) => ({ ecosystem, count }))
    .sort((a, b) => b.count - a.count);

  return { brands, ecosystems, totalDevices: pool.length };
}

export interface FilterState {
  brands: string[];
  lines: string[];
  ecosystems: Ecosystem[];
  priceMax: number | null;
}

export function emptyFilter(): FilterState {
  return { brands: [], lines: [], ecosystems: [], priceMax: null };
}

export function applyFilters(pool: Device[], filter: FilterState): Device[] {
  return pool.filter((d) => {
    if (filter.brands.length && !filter.brands.includes(d.brand)) return false;
    if (filter.lines.length && !filter.lines.includes(d.line)) return false;
    if (filter.ecosystems.length && !filter.ecosystems.includes(d.ecosystem)) return false;
    if (filter.priceMax !== null && d.price > filter.priceMax) return false;
    return true;
  });
}
