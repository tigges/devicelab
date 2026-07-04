import type { Persona } from './schema';

/**
 * Six personas driving the top-of-board chip row. Numbers are absolute
 * (0–100) so they map 1:1 to the mixer sliders' visible range. The
 * scoring engine normalises them internally, so relative shape is what
 * matters — not the exact scale.
 */
export const PERSONAS: Persona[] = [
  {
    id: 'overall',
    label: 'Overall',
    blurb: 'Every axis weighted equally. The neutral leaderboard.',
    weights: {
      performance: 60,
      portability: 60,
      display: 60,
      battery: 60,
      build: 60,
      value: 60,
    },
  },
  {
    id: 'value',
    label: 'Value',
    blurb: 'Bang-for-buck first. Value dominates; nothing is punished, but nothing else compensates.',
    weights: {
      performance: 50,
      portability: 60,
      display: 50,
      battery: 70,
      build: 50,
      value: 100,
    },
  },
  {
    id: 'creator',
    label: 'Creator',
    blurb: 'Display accuracy and sustained performance. Build matters — you carry it to shoots.',
    weights: {
      performance: 95,
      portability: 55,
      display: 100,
      battery: 55,
      build: 80,
      value: 35,
    },
  },
  {
    id: 'gamer',
    label: 'Gamer',
    blurb: 'Raw performance and high-refresh displays. Value and battery deprioritised.',
    weights: {
      performance: 100,
      portability: 40,
      display: 90,
      battery: 30,
      build: 65,
      value: 35,
    },
  },
  {
    id: 'student',
    label: 'Student',
    blurb: 'Battery, portability, value — the three things a student actually notices.',
    weights: {
      performance: 55,
      portability: 90,
      display: 60,
      battery: 95,
      build: 55,
      value: 90,
    },
  },
  {
    id: 'business',
    label: 'Business',
    blurb: 'Battery and build first. Keyboards, hinges, and airport lounges.',
    weights: {
      performance: 65,
      portability: 80,
      display: 65,
      battery: 85,
      build: 95,
      value: 45,
    },
  },
];

export function personaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export const DEFAULT_PERSONA = PERSONAS[0]!;
