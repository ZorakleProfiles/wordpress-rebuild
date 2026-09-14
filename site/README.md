# Zorakle Marketing Site

Astro site for [zorakleprofiles.com](https://www.zorakleprofiles.com), backed by Sanity as the content source.

## Project Structure

```text
/
├── public/               static files served as-is (favicon, robots.txt, redirects, headers)
├── src
│   ├── assets/           images and fonts, imported and optimized by Astro
│   ├── components/       .astro components used across pages
│   ├── data/             typed content that isn't managed in Sanity (nav, pricing, support articles, testimonials)
│   ├── layouts/          MainLayout.astro — shared <head>/SEO/meta handling
│   ├── lib/              Sanity client and content-fetching helpers
│   ├── pages/            file-based routes, including the [...slug] catch-all for Sanity blog posts
│   ├── scripts/          client-side scripts imported into pages/components
│   └── styles/           global CSS
└── scripts/              one-off Node/Bun scripts (WordPress import, video upload, pricing checks)
```

## Commands

All commands are run from this directory (`site/`):

| Command                      | Action                                              |
| :---------------------------- | :--------------------------------------------------- |
| `bun install`                 | Install dependencies                                 |
| `bun run dev`                 | Start local dev server at `localhost:4321`           |
| `bun run build`                | Build the production site to `./dist/`               |
| `bun run preview`              | Preview the build locally before deploying           |
| `bun run test:pricing`         | Run the pricing-configurator verification script     |
| `bun run import:wordpress:dry` | Dry-run the legacy WordPress content importer        |
| `bun run import:wordpress`     | Run the WordPress importer and write output          |

## Content

Blog posts, sciences, and support media come from Sanity (`@sanity/astro`, project `4kjxjblw`). Navigation, pricing tiers, testimonials, and support articles that aren't in Sanity live in `src/data/`.
