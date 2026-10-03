# mm-s-21.github.io

Personal site and portfolio for **Moaaz Magdy** — Data & Business Analyst, Cairo.

Built with [Astro](https://astro.build), deployed to GitHub Pages. Static output,
no client-side JavaScript, no tracking or cookies.

## Stack

- Astro 7 (static output)
- Content collections for blog posts (markdown + frontmatter)
- `@astrojs/rss` for the writing feed
- [Manrope](https://fonts.google.com/specimen/Manrope) (SIL Open Font License),
  self-hosted as a variable font at `public/fonts/manrope-latin.woff2`

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # serve dist/ locally
```

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/` to GitHub Pages. The live URL is
<https://mms-21.github.io>.

The repo is `MMS-21.github.io` and the GitHub login is `MMS-21`, so GitHub
serves the site at the login lowercased: `mms-21.github.io` — no hyphen
between "mm" and "s". Getting this wrong silently breaks every canonical URL,
the RSS feed, and the social preview.

One-time setup in **Settings → Pages → Source: GitHub Actions**.

## Structure

```
src/
├── content.config.ts       # blog collection schema
├── content/blog/           # markdown posts (frontmatter: title, description, pubDate, tags)
├── data/site.ts            # single source of truth for bio copy and project data
├── layouts/Base.astro      # page shell, header/footer, global styles
└── pages/
    ├── index.astro         # home
    ├── about.astro
    ├── contact.astro
    ├── 404.astro
    ├── projects/           # index + one case study per project
    ├── writing/            # index + [slug] for each post
    └── rss.xml.js
public/
├── favicon.svg
└── img/                    # images referenced by posts
```

## Adding a blog post

Create `src/content/blog/<slug>.md` with frontmatter:

```markdown
---
title: 'Your post title'
description: 'One or two sentences for the index page and meta tags.'
pubDate: 2026-10-02
tags: ['agentic-ai', 'python']
---

First paragraph becomes the post body.
```

The post appears at `/writing/<slug>/` automatically. Reference images from
`public/img/` with an absolute path (`/img/name.png`).

## Editing copy and projects

`src/data/site.ts` holds the bio and every project entry (problem, approach,
result, stack, repo URL). Adding a project there generates its case study page.
Keep it aligned with `positioning-brief.md`.

## Design notes

- Light mode only, on purpose. Warm off-white background (`#fcfaf7`), no
  `prefers-color-scheme` dark override, so the site renders light regardless of
  OS theme.
- Text contrast passes WCAG AA (body 16.8:1, muted 5.5:1, links 7.1:1).
- Interactive element borders use `--btn-border` (`#8f7f6e`, 3.7:1) rather than
  the decorative `--border`, to satisfy WCAG 1.4.11 non-text contrast.

## License

MIT