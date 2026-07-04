import type { Persona, PersonaId } from './schema';

/**
 * Six personas — the top-of-board chip row. Weights are 0–100, matching
 * the mixer slider scale 1:1. `Overall` is neutral (equal weights); any
 * manual slider change flips the active persona to `null` ("Custom").
 */
export const PERSONAS: Persona[] = [
  { id: 'Overall',  weights: { perf: 60,  port: 60, disp: 60,  batt: 60, build: 60, value: 60  }, blurb: 'Every axis weighted equally. Neutral leaderboard.' },
  { id: 'Value',    weights: { perf: 55,  port: 30, disp: 30,  batt: 30, build: 25, value: 100 }, blurb: 'Bang-for-buck first. Value dominates.' },
  { id: 'Creator',  weights: { perf: 85,  port: 40, disp: 100, batt: 40, build: 60, value: 25  }, blurb: 'Display and sustained performance. Build matters — you carry it to shoots.' },
  { id: 'Gamer',    weights: { perf: 100, port: 15, disp: 75,  batt: 15, build: 35, value: 40  }, blurb: 'Raw performance and high-refresh displays. Value and battery deprioritised.' },
  { id: 'Student',  weights: { perf: 40,  port: 90, disp: 45,  batt: 95, build: 40, value: 85  }, blurb: 'Battery, portability, value — the three things a student notices.' },
  { id: 'Business', weights: { perf: 55,  port: 85, disp: 55,  batt: 75, build: 90, value: 45  }, blurb: 'Battery, portability, build. Airport-lounge laptops.' },
];

export const PERSONA_IDS: PersonaId[] = PERSONAS.map((p) => p.id);

export function personaById(id: PersonaId | string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export const DEFAULT_PERSONA = PERSONAS[0]!;
