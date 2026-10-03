// @ts-check
import { defineConfig } from 'astro/config';

// GitHub serves this project site at the repo's login, lowercased:
// login MMS-21 -> https://mms-21.github.io/ (no hyphen after "mm").
// `base` stays "/" and `site` drives canonical URLs, RSS, and OG tags.
export default defineConfig({
  site: 'https://mms-21.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
