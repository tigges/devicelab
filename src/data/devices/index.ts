import type { Device } from '../schema';
import laptopsRaw from './laptops.json' with { type: 'json' };
import phonesRaw from './phones.json' with { type: 'json' };
import tabletsRaw from './tablets.json' with { type: 'json' };

// Cast is safe: schema is checked in `scripts/validate-data.ts` (not shipped) and
// enforced by the shape of the JSON. Keeping the raw imports typed as unknown
// would force useless narrowing at every callsite.
const laptops = laptopsRaw as unknown as Device[];
const phones = phonesRaw as unknown as Device[];
const tablets = tabletsRaw as unknown as Device[];

export const DEVICES: Device[] = [...laptops, ...phones, ...tablets];

export function deviceById(id: string): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}
