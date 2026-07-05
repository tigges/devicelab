/**
 * URL slug derived from brand + name. Stable — used in
 * `/device/<slug>` routes, in the compact URL state, and as the key
 * into `amazon-overrides.json`.
 *
 * Rules:
 *  - lowercase
 *  - any non-alphanumeric run becomes a single dash
 *  - trim leading/trailing dashes
 *
 * Deliberately preserves parenthesised content ("M5", "Gen 13", …) so
 * MacBook Air 13 (M5) and MacBook Air 13 (M4) get distinct slugs.
 */
export function slugify(d: { brand: string; name: string }): string {
  return `${d.brand}-${d.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
