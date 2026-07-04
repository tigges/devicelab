# DeviceLab

Production Astro port of the `device-lab-v11.jsx` prototype. Static-first
device comparison leaderboard deployed on Cloudflare Pages/Workers.

## Stack

- Astro 7 with `output: 'static'` — every ranking, device, and preset page
  is prerendered HTML at build time.
- React 19 island for the interactive board (`client:load`) and the
  track-price form (`client:idle`).
- `@astrojs/cloudflare` adapter. The `/api/track-price` endpoint is the
  only non-prerendered route.
- No CSS framework. Design tokens live in `src/styles/global.css`.

## Layout

```
src/
├── data/
│   ├── schema.ts            — canonical types (Device, Preset, AxisScores…)
│   ├── presets.ts           — named weight vectors → SEO landing routes
│   └── devices/
│       ├── index.ts         — flat merge of the JSON files
│       ├── laptops.json
│       ├── phones.json
│       └── tablets.json
├── lib/
│   ├── scoring.ts           — deterministic composite score. Never touches
│   │                          price/offers. This is a hard rule.
│   ├── facets.ts            — brand / line / ecosystem facet aggregator
│   └── format.ts
├── components/              — React components (island + subsheets)
│   ├── Board.tsx            — root island: chips row, table, tray, sheets
│   ├── MixerSheet.tsx
│   ├── DetailSheet.tsx
│   ├── CompareSheet.tsx
│   └── TrackPriceForm.tsx
├── pages/
│   ├── index.astro          — home board (all devices, equal weights)
│   ├── [preset].astro       — one page per preset, prerendered
│   ├── about.astro
│   ├── device/[slug].astro  — one page per device, prerendered
│   └── api/track-price.ts   — POST endpoint (KV-backed with a stub fallback)
├── layouts/Base.astro
└── styles/global.css        — design tokens + all component styles
```

## Scoring contract

- Seven axes: `performance | battery | display | portability | build | camera | value`.
- Each axis is 0–100. Composite is a normalised weighted mean.
- Weights are relative; unmentioned axes = 0; all-zero → equal weights.
- Ties break on `scores.value` then alphabetical name.
- `scoring.ts` imports nothing from monetisation code. Enforced by review.

## Presets

Each preset is a route (`/best-*`) that prewires the mixer with a weight
vector and preloads the correct category-scoped pool. Structured data
(`ItemList`) is emitted per preset page.

The mixer sheet shows every preset as a chip so users can jump between
them without leaving the board. The current weights are mirrored into
`?w=…` so a shared URL restores the exact ranking a user saw.

## Track price / Cloudflare KV

`POST /api/track-price { deviceId, email, targetPrice? }` writes to the
`TRACK_PRICE_KV` namespace when bound. When the binding is missing
(local dev / preview without provisioning), the endpoint logs the record
and returns `200 { stored: 'stub' }` so the UI is still testable.

Provision the KV namespace and paste its ID into `wrangler.jsonc`:

```
wrangler kv namespace create TRACK_PRICE_KV
```

## Roadmap markers

Grep for these in the codebase — that's where the separate briefs plug in:

- `TODO(ingestion)` — where the n8n price job writes `offers` and
  `priceHistory` into the JSON feed / KV.
- `TODO(affiliate)` — where merchant URLs get tracking params appended.
- `TODO(alerts)` — the scheduled consumer that emails matches on target
  prices from KV.

## Scripts

```
pnpm dev        # local dev
pnpm build      # static + Cloudflare bundle
pnpm preview    # serve dist locally
```

## Notes from the port

- Prototype was a single JSX file with inline styles; I split it into a
  design-token CSS file and small React components. Visual behaviours
  (weight mixer, sheets, compare tray requiring 2+ selections, wrap-based
  chip filter) are preserved.
- The prototype's monolithic state was replaced with per-domain state
  (`weights`, `filter`, `selectedIds`, `openSheet`). The scoring engine
  is a pure function; the board is a thin renderer of ranked results.
- Filter chips wrap (no scroll) and only expand into line chips when a
  brand is selected — this keeps the row from exploding as the catalog
  grows.
