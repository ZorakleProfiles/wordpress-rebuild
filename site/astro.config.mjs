// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
// https://astro.build/config


export default defineConfig({
  site: "https://zorakleprofiles.github.io",
  base: process.env.NODE_ENV === "production" ? "/wordpress-rebuild/" : "/",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true
    }
  }
});
