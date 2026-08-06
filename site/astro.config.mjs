// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import react from "@astrojs/react";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  ""
);

function stripTrailingSlash(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

const sanityIntentDevRedirect = {
  name: "sanity-intent-dev-redirect",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url) {
        next();
        return;
      }

      const url = new URL(req.url, "http://localhost");

      // Support copied Sanity links that start at /intent instead of /studio/intent.
      if (url.pathname === "/intent" || url.pathname.startsWith("/intent/")) {
        const targetPath = stripTrailingSlash(`/studio${url.pathname}`);
        res.statusCode = 307;
        res.setHeader("Location", `${targetPath}${url.search}`);
        res.end();
        return;
      }

      // Normalize trailing slash on /studio/intent links so Sanity parses intent params correctly.
      if (url.pathname === "/studio/intent" || url.pathname.startsWith("/studio/intent/")) {
        const normalizedPath = stripTrailingSlash(url.pathname);
        if (normalizedPath !== url.pathname) {
          res.statusCode = 307;
          res.setHeader("Location", `${normalizedPath}${url.search}`);
          res.end();
          return;
        }
      }

      // Serve the Studio shell for deep-link routes handled by Sanity client routing.
      if (url.pathname.startsWith("/studio/")) {
        req.url = `/studio${url.search}`;
      }

      next();
    });
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://zorakle-website.mike-94b.workers.dev",
  base: "/",
  redirects: {
    "/intent": "/studio/intent",
    "/intent/:path*": "/studio/intent/:path*",
  },
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
      studioBasePath: '/studio',
    }),
  ],
  vite: {
    plugins: [tailwindcss(), sanityIntentDevRedirect],
    resolve: {
      tsconfigPaths: true
    }
  }
});
