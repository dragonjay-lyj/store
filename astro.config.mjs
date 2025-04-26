// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import vercel from '@astrojs/vercel';

import robotsTxt from 'astro-robots-txt';

import compressor from 'astro-compressor';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap(), react(), mdx(), robotsTxt(), compressor()],
  adapter: vercel(),
  output: 'server',
});