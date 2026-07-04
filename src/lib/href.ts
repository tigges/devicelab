/**
 * Build an internal href that respects Astro's configured `base`.
 *
 * Astro sets `import.meta.env.BASE_URL` to the configured base + trailing
 * slash (e.g. `/devicelab/` when deploying to GitHub Pages, `/` when
 * deploying to Cloudflare). Component code has to prefix its own
 * hrefs — Astro doesn't rewrite string attributes.
 */
export function href(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  if (!path.startsWith('/')) return path;
  return `${base}${path}`;
}
