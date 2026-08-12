// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.zorakleprofiles.com",
  base: "/",
  cacheDir: "../node_modules/.astro",
  integrations: [
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
    }
  }
});
