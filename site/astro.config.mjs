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

// https://astro.build/config
export default defineConfig({
  site: "https://zorakle-website.mike-94b.workers.dev",
  base: "/",
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true
    }
  }
});
