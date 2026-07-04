// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// Two supported deploy targets:
//   - `cloudflare` (default): SSR-capable, /api/track-price runs as a Worker.
//   - `pages`:                pure static, deployed to GitHub Pages at
//                             /devicelab/. The API endpoint is stripped
//                             by the workflow before build.
//
// Toggle with DEPLOY_TARGET=pages. Base + site URLs are derived so
// internal links resolve correctly.
const isPages = process.env.DEPLOY_TARGET === 'pages';

const site = isPages
  ? process.env.ASTRO_SITE ?? 'https://tigges.github.io'
  : 'https://devicelab.pages.dev';

const base = isPages ? (process.env.ASTRO_BASE ?? '/devicelab') : undefined;

export default defineConfig({
  output: 'static',
  site,
  base,
  ...(isPages
    ? {}
    : {
        adapter: cloudflare({
          imageService: 'compile',
        }),
      }),
  integrations: [react()],
  vite: {
    ssr: {
      external: ['node:buffer'],
    },
  },
});
