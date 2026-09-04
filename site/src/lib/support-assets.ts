import type { ImageMetadata } from "astro";

// Hoisted to module scope so Vite resolves these globs once, not once per
// generated support-article page (getStaticPaths in support/[slug].astro
// instantiates this page once per article).
export const screenshotAssets = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/support/**/*.{png,jpg,jpeg,webp,avif}",
  { eager: true }
);
export const gifAssets = import.meta.glob<{ default: string }>(
  "/src/assets/support/**/*.gif",
  { eager: true }
);
export const videoAssets = import.meta.glob<{ default: string }>(
  "/src/assets/support/**/*.{mp4,webm,mov}",
  { eager: true }
);
