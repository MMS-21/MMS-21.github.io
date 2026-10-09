// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Use each built page's canonical URL, including generated project/article routes.
const sitemap = {
  name: 'portfolio-sitemap',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const root = fileURLToPath(dir);
      const urls = new Set();
      async function collect(folder) {
        for (const entry of await readdir(folder, { withFileTypes: true })) {
          const path = join(folder, entry.name);
          if (entry.isDirectory()) await collect(path);
          else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
            const html = await readFile(path, 'utf8');
            const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
            if (canonical && !new URL(canonical[1]).pathname.startsWith('/404')) urls.add(canonical[1]);
          }
        }
      }
      await collect(root);
      const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      await writeFile(join(root, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...urls].sort().map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n') + '\n</urlset>\n');
    },
  },
};

// GitHub serves this project site at the repo's login, lowercased:
// login MMS-21 -> https://mms-21.github.io/ (no hyphen after "mm").
// `base` stays "/" and `site` drives canonical URLs, RSS, and OG tags.
export default defineConfig({
  integrations: [react(), sitemap],
  site: 'https://mms-21.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
