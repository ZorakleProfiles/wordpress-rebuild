// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
// https://astro.build/config


export default defineConfig({
  site: "https://zorakle-website.mike-94b.workers.dev",
  base: "/",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true
    }
  }
});
