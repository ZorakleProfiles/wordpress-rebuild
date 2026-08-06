import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";
import { defineQuery } from "groq";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// ── Image URL builder ────────────────────────────────────────────────────────

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
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
    _id, title, slug, publishedAt, excerpt, mainImage, categories, tags, body
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

