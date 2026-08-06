import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";

// ── Image URL builder ────────────────────────────────────────────────────────

const builder = createImageUrlBuilder(sanityClient);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// ── GROQ Queries ─────────────────────────────────────────────────────────────

export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    _id, title, slug, publishedAt, excerpt, mainImage, categories, tags
  }`
);

export const POST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{
    _id, title, slug, publishedAt, excerpt, mainImage, categories, tags, body,
    "author": author->{ name, slug }
  }`
);

export const POST_SLUGS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)]{ "params": { "slug": slug.current } }`
);

// ── Fetch helpers ─────────────────────────────────────────────────────────────

export async function getPosts() {
  return await sanityClient.fetch(POSTS_QUERY);
}

export async function getPostBySlug(slug: string) {
  return await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug });
}

