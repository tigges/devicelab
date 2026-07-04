import type { Preset } from './schema';

/**
 * SEO landing presets: a persona × category combination mapped to a
 * stable URL. Each page pre-selects the matching persona chip and
 * category filter on the board.
 *
 * Slugs are used verbatim in URLs; treat them as public API.
 */
export const PRESETS: Preset[] = [
  // ─── Laptops ─────────────────────────────────────────────────────────
  {
    slug: 'best-laptops-for-students',
    title: 'Best laptops for students',
    metaTitle: 'Best Laptops for Students 2026 — DeviceLab',
    metaDescription:
      'Independently scored ranking of the best student laptops, weighted for battery, portability, and value.',
    personaId: 'student',
    category: 'laptops',
    blurb: 'Battery, portability, value — weighted for the three things a student actually notices.',
  },
  {
    slug: 'best-laptops-for-creators',
    title: 'Best laptops for creators',
    metaTitle: 'Best Laptops for Creators & Designers 2026 — DeviceLab',
    metaDescription:
      'Deterministic ranking of the best laptops for photo, video, and design work.',
    personaId: 'creator',
    category: 'laptops',
    blurb: 'Display accuracy and sustained performance dominate this preset.',
  },
  {
    slug: 'best-laptops-for-gaming',
    title: 'Best gaming laptops',
    metaTitle: 'Best Gaming Laptops 2026 — DeviceLab',
    metaDescription: 'Raw performance and high-refresh displays. Deterministic scoring, no sponsored order.',
    personaId: 'gamer',
    category: 'laptops',
    blurb: 'Frames per second and pixel response. Value and battery deprioritised on purpose.',
  },
  {
    slug: 'best-laptops-for-business',
    title: 'Best laptops for business',
    metaTitle: 'Best Business Laptops 2026 — DeviceLab',
    metaDescription: 'Ranking weighted for build quality, battery, and portability.',
    personaId: 'business',
    category: 'laptops',
    blurb: 'Battery and build first. Keyboards, hinges, and airport lounges.',
  },
  {
    slug: 'best-value-laptops',
    title: 'Best value laptops',
    metaTitle: 'Best Value Laptops 2026 — DeviceLab',
    metaDescription: 'Bang-for-buck ranking of laptops. Value dominates the mix.',
    personaId: 'value',
    category: 'laptops',
    blurb: 'Value dominates the mix. Nothing else is punished — but nothing else compensates.',
  },

  // ─── Phones ──────────────────────────────────────────────────────────
  {
    slug: 'best-phones-for-photography',
    title: 'Best phones for photography',
    metaTitle: 'Best Camera Phones 2026 — DeviceLab',
    metaDescription: 'Ranking of the best phones for stills and video.',
    personaId: 'creator',
    category: 'phones',
    blurb: 'Display and performance lead here — the two things that show a good shot at its best.',
  },
  {
    slug: 'best-phones-for-battery',
    title: 'Best phones for battery life',
    metaTitle: 'Longest Battery Life Phones 2026 — DeviceLab',
    metaDescription: 'Phones ranked by battery life and value — no design tax.',
    personaId: 'student',
    category: 'phones',
    blurb: 'Optimised for endurance. Value keeps the list honest.',
  },
  {
    slug: 'best-budget-phones',
    title: 'Best budget phones',
    metaTitle: 'Best Budget Phones 2026 — DeviceLab',
    metaDescription: 'Ranked budget phones weighted heavily for value and battery.',
    personaId: 'value',
    category: 'phones',
    blurb: 'Value leads. We surface phones that punch above their price.',
  },

  // ─── Tablets ─────────────────────────────────────────────────────────
  {
    slug: 'best-tablets-for-drawing',
    title: 'Best tablets for drawing',
    metaTitle: 'Best Tablets for Artists & Drawing 2026 — DeviceLab',
    metaDescription: 'Ranked tablets for illustration and note-taking.',
    personaId: 'creator',
    category: 'tablets',
    blurb: 'Display quality is doing the heavy lifting. Performance matters for large canvases.',
  },
  {
    slug: 'best-tablets-for-students',
    title: 'Best tablets for students',
    metaTitle: 'Best Student Tablets 2026 — DeviceLab',
    metaDescription: 'Ranking of the best tablets for students.',
    personaId: 'student',
    category: 'tablets',
    blurb: 'Value first. Battery and portability tie for second.',
  },
];

export function presetBySlug(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug);
}
