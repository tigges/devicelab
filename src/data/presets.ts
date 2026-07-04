import type { Preset } from './schema';

/**
 * SEO landing presets — persona × category → stable URL. Each page
 * preselects the matching persona and category filter on the board.
 * Slugs are used verbatim in URLs; treat them as public API.
 */
export const PRESETS: Preset[] = [
  // ─── Laptops ─────────────────────────────────────────────────────────
  {
    slug: 'best-laptops-for-students',
    title: 'Best laptops for students',
    metaTitle: 'Best Laptops for Students 2026 — DeviceLab',
    metaDescription: 'Ranked laptops weighted for battery, portability, and value.',
    personaId: 'Student',
    category: 'Laptop',
    blurb: 'Battery, portability, value — the three things a student actually notices.',
  },
  {
    slug: 'best-laptops-for-creators',
    title: 'Best laptops for creators',
    metaTitle: 'Best Laptops for Creators & Designers 2026 — DeviceLab',
    metaDescription: 'Deterministic ranking of the best laptops for photo, video, and design work.',
    personaId: 'Creator',
    category: 'Laptop',
    blurb: 'Display accuracy and sustained performance. Build matters when you carry it.',
  },
  {
    slug: 'best-gaming-laptops',
    title: 'Best gaming laptops',
    metaTitle: 'Best Gaming Laptops 2026 — DeviceLab',
    metaDescription: 'Raw performance and high-refresh displays. Deterministic scoring, no sponsored order.',
    personaId: 'Gamer',
    category: 'Laptop',
    blurb: 'Frames per second and pixel response. Value and battery deprioritised.',
  },
  {
    slug: 'best-business-laptops',
    title: 'Best business laptops',
    metaTitle: 'Best Business Laptops 2026 — DeviceLab',
    metaDescription: 'Business laptops weighted for build quality, battery, and portability.',
    personaId: 'Business',
    category: 'Laptop',
    blurb: 'Battery, portability, build. Airport-lounge laptops.',
  },
  {
    slug: 'best-value-laptops',
    title: 'Best value laptops',
    metaTitle: 'Best Value Laptops 2026 — DeviceLab',
    metaDescription: 'Bang-for-buck ranking of laptops. Value dominates the mix.',
    personaId: 'Value',
    category: 'Laptop',
    blurb: 'Value dominates. Nothing else is punished — but nothing else compensates.',
  },

  // ─── Tablets ─────────────────────────────────────────────────────────
  {
    slug: 'best-tablets-for-drawing',
    title: 'Best tablets for drawing',
    metaTitle: 'Best Tablets for Artists 2026 — DeviceLab',
    metaDescription: 'Tablets ranked for illustration and note-taking.',
    personaId: 'Creator',
    category: 'Tablet',
    blurb: 'Display and performance lead. Portability keeps it a tablet, not a laptop.',
  },
  {
    slug: 'best-tablets-for-students',
    title: 'Best tablets for students',
    metaTitle: 'Best Student Tablets 2026 — DeviceLab',
    metaDescription: 'Tablets ranked for value, battery, and portability.',
    personaId: 'Student',
    category: 'Tablet',
    blurb: 'Value first. Battery and portability tie for second.',
  },

  // ─── Desktops / PCs ──────────────────────────────────────────────────
  {
    slug: 'best-desktop-pcs-for-creators',
    title: 'Best desktop PCs for creators',
    metaTitle: 'Best Creator PCs 2026 — DeviceLab',
    metaDescription: 'Desktops ranked for sustained render performance.',
    personaId: 'Creator',
    category: 'Desktop',
    blurb: 'Performance dominates — battery and portability are zeroed out for desktops.',
  },
  {
    slug: 'best-gaming-pcs',
    title: 'Best gaming PCs',
    metaTitle: 'Best Gaming Desktop PCs 2026 — DeviceLab',
    metaDescription: 'Ranked gaming desktops.',
    personaId: 'Gamer',
    category: 'Desktop',
    blurb: 'Raw performance and display response. Everything else takes a back seat.',
  },
];

export function presetBySlug(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug);
}
