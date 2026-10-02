// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves this project site from the repo root path
// (https://mm-s-21.github.io/), so `base` stays "/" and `site` is set for
// canonical URLs and sitemap generation.
export default defineConfig({
  site: 'https://mm-s-21.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
