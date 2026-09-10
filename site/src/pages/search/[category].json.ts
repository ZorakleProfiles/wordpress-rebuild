import type { APIRoute } from "astro";
import { getCategorySearchIndex } from "../../lib/blog.ts";

// Static JSON search indexes for the blog archive routes. Each file is fetched
// lazily by the in-page search box on first use, so the archive HTML itself
// stays small even when a category holds hundreds of posts.
const CATEGORY_BY_SLUG: Record<string, string> = {
  news: "news",
  podcasts: "podcasts",
  webinars: "webinars & training"
};

export function getStaticPaths() {
  return Object.keys(CATEGORY_BY_SLUG).map((category) => ({ params: { category } }));
}

export const GET: APIRoute = async ({ params }) => {
  const category = CATEGORY_BY_SLUG[params.category ?? ""];
  if (!category) {
    return new Response("Not found", { status: 404 });
  }

  const index = await getCategorySearchIndex(category);
  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
