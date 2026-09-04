// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import sanity from '@sanity/astro';
import { getAllPosts } from "./src/lib/blog.ts";

const SITE_ORIGIN = "https://www.zorakleprofiles.com";
const BUILD_DATE = new Date();

// Map of blog-post pathname -> last-modified date, built once and reused by
// the sitemap `serialize` hook so every post URL carries an accurate <lastmod>.
let blogLastmodPromise;
function getBlogLastmodMap() {
  blogLastmodPromise ??= getAllPosts()
    .then((posts) => {
      const map = new Map();
      for (const post of posts) {
        const date = new Date(post.updatedAt || post.publishedAt);
        if (!Number.isNaN(date.valueOf())) {
          map.set(`/${post.slug}/`, date);
        }
      }
      return map;
    })
    .catch(() => new Map());
  return blogLastmodPromise;
}

/** Assign a crawl priority from the URL shape. */
function priorityForPath(pathname) {
  if (pathname === "/") return 1.0;
  if (/^\/(solutions\/|pricing\/?$|science\/?$|about\/?$)/.test(pathname)) return 0.8;
  if (/\/page\/\d+\/?$/.test(pathname)) return 0.3;
  if (/^\/(news|podcasts|webinars|sciences|support)/.test(pathname)) return 0.6;
  return 0.5;
}

function changefreqForPath(pathname) {
  if (pathname === "/" || /^\/(news|podcasts|webinars)\/?$/.test(pathname)) return "weekly";
  return "monthly";
}

// https://astro.build/config
export default defineConfig({
  site: SITE_ORIGIN,
  base: "/",
  cacheDir: "../node_modules/.astro",
  devToolbar: {
    enabled: false
  },
  stega: {
    enabled: true,
    studioUrl: 'http://localhost:3333',
  },
  integrations: [
    sanity({
      projectId: '4kjxjblw',
      dataset: 'production',
      useCdn: false,
      // Ensures clickable visual boxes communicate back to your studio port
      stega: {
        enabled: true,
        studioUrl: 'http://localhost:3333',
      },
    }),
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return (
          pathname !== "/preview" &&
          !pathname.startsWith("/preview/")
        );
      },
      serialize: async (item) => {
        const { pathname } = new URL(item.url);
        const blogLastmod = await getBlogLastmodMap();
        const lastmod = blogLastmod.get(pathname) ?? BUILD_DATE;
        return {
          ...item,
          lastmod: lastmod.toISOString(),
          changefreq: changefreqForPath(pathname),
          priority: priorityForPath(pathname),
        };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true
    },
  }
});
