import type { Preset } from './schema';

/**
 * Presets drive the SEO landing routes. Each preset preloads a weight
 * vector into the board (mixer sheet reflects it, user can nudge).
 *
 * Slugs are used verbatim as URLs; keep them stable — external links
 * (and any future affiliate deep links) rely on them.
 */
export const PRESETS: Preset[] = [
  // ─── Laptops ─────────────────────────────────────────────────────────
  {
    slug: 'best-laptops-for-students',
    title: 'Best laptops for students',
    metaTitle: 'Best Laptops for Students 2026 — DeviceLab',
    metaDescription:
      'Independently scored ranking of the best student laptops, weighted for battery, portability, and value. Deterministic scoring, no sponsored order.',
    category: 'laptops',
    weights: { battery: 3, portability: 3, value: 3, display: 1, performance: 1 },
    blurb:
      'We weight battery, portability, and value first — the three things a student actually notices. Adjust the mixer to match your own priorities.',
  },
  {
    slug: 'best-laptops-for-creators',
    title: 'Best laptops for creators',
    metaTitle: 'Best Laptops for Creators & Designers 2026 — DeviceLab',
    metaDescription:
      'Deterministic ranking of the best laptops for photo, video, and design work — weighted for display, performance, and build.',
    category: 'laptops',
    weights: { display: 3, performance: 3, build: 2, portability: 1 },
    blurb:
      'Display accuracy and sustained performance dominate this preset. Build quality matters if you take your machine to a client.',
  },
  {
    slug: 'best-laptops-for-developers',
    title: 'Best laptops for developers',
    metaTitle: 'Best Developer Laptops 2026 — DeviceLab',
    metaDescription:
      'Ranked laptops for software engineers — weighted for performance, battery, and keyboard-first build.',
    category: 'laptops',
    weights: { performance: 3, battery: 2, display: 2, build: 2, portability: 1 },
    blurb:
      'Long compile jobs, long flights, and a keyboard you can live with. Performance leads, battery keeps you honest.',
  },
  {
    slug: 'best-ultrabooks',
    title: 'Best ultrabooks',
    metaTitle: 'Best Ultrabooks 2026 — DeviceLab',
    metaDescription:
      'Independently ranked ultraportable laptops — weighted for portability, build, and battery.',
    category: 'laptops',
    weights: { portability: 3, battery: 2, build: 2, display: 1 },
    blurb: 'Small footprint, no compromises. Portability leads.',
  },

  // ─── Phones ──────────────────────────────────────────────────────────
  {
    slug: 'best-phones-for-photography',
    title: 'Best phones for photography',
    metaTitle: 'Best Camera Phones 2026 — DeviceLab',
    metaDescription:
      'Ranking of the best phones for stills and video. Weighted for camera and display; deterministic scoring, no sponsored order.',
    category: 'phones',
    weights: { camera: 4, display: 2, performance: 1 },
    blurb:
      'Camera dominates this preset. Display matters because you edit on the device you shot on.',
  },
  {
    slug: 'best-phones-for-battery',
    title: 'Best phones for battery life',
    metaTitle: 'Longest Battery Life Phones 2026 — DeviceLab',
    metaDescription:
      'Phones ranked by battery life and value — no camera or design tax.',
    category: 'phones',
    weights: { battery: 4, value: 2, performance: 1 },
    blurb: 'Optimised for endurance. Value keeps the list honest.',
  },
  {
    slug: 'best-flagship-phones',
    title: 'Best flagship phones',
    metaTitle: 'Best Flagship Phones 2026 — DeviceLab',
    metaDescription:
      'The current flagship ranking — performance, camera, display, and build weighted equally.',
    category: 'phones',
    weights: { performance: 2, camera: 2, display: 2, build: 2 },
    blurb: 'Four axes weighted equally. If money is no object, this is the shortlist.',
  },
  {
    slug: 'best-budget-phones',
    title: 'Best budget phones',
    metaTitle: 'Best Budget Phones 2026 — DeviceLab',
    metaDescription: 'Ranked budget phones weighted heavily for value and battery.',
    category: 'phones',
    weights: { value: 4, battery: 2, camera: 1, display: 1 },
    blurb: 'Value leads. We surface phones that punch above their price.',
  },

  // ─── Tablets ─────────────────────────────────────────────────────────
  {
    slug: 'best-tablets-for-drawing',
    title: 'Best tablets for drawing',
    metaTitle: 'Best Tablets for Artists & Drawing 2026 — DeviceLab',
    metaDescription:
      'Ranked tablets for illustration and note-taking — weighted for display, performance, and build.',
    category: 'tablets',
    weights: { display: 3, performance: 2, build: 2, portability: 1 },
    blurb: 'Display quality is doing the heavy lifting. Performance matters for large canvases.',
  },
  {
    slug: 'best-tablets-for-students',
    title: 'Best tablets for students',
    metaTitle: 'Best Student Tablets 2026 — DeviceLab',
    metaDescription:
      'Ranking of the best tablets for students — weighted for value, battery, and portability.',
    category: 'tablets',
    weights: { value: 3, battery: 2, portability: 2, display: 1 },
    blurb: 'Value first. Battery and portability tie for second.',
  },
];

export function presetBySlug(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug);
}
