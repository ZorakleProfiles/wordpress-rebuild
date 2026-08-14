// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  site: "https://www.zorakleprofiles.com",
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
    }),
  ],
  experimental: {
    incrementalBuild: true,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true
    },
  }
});
