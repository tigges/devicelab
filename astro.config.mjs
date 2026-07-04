// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// Static-first with a single dynamic endpoint (/api/track-price).
// `output: 'static'` prerenders every page; the Cloudflare adapter still
// deploys endpoints that opt out of prerender via `export const prerender = false`.
export default defineConfig({
  output: 'static',
  site: 'https://devicelab.pages.dev',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [react()],
  vite: {
    ssr: {
      external: ['node:buffer'],
    },
  },
});
