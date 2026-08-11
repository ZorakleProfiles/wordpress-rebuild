import { sanityClient } from "./sanity-client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface PortableTextSpan {
  _type?: string;
  text?: string;
}

interface PortableTextBlock {
  _type?: string;
  children?: PortableTextSpan[];
}

interface SanitySlug {
  current?: string;
}

interface SanityImage {
  alt?: string;
  [key: string]: unknown;
}

interface SanityPost {
  _id: string;
  title?: string;
  slug?: SanitySlug;
  excerpt?: string;
  body?: PortableTextBlock[];
  publishedAt?: string;
  _createdAt?: string;
  categoryTitles?: (string | null)[];
  categorySlugs?: (string | null)[];
  mainImage?: SanityImage;
  wordpressUrl?: string;
}

export interface BlogPost {
  id: number;
  sanityId: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  body: PortableTextBlock[];
  publishedAt: string;
  categories: string[];
  categorySlugs: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  legacySlug?: string;
}

const postsByCategoryCache = new Map<string, Promise<BlogPost[]>>();
let allPostsCache: Promise<BlogPost[]> | null = null;

const imageBuilder = createImageUrlBuilder(sanityClient);

const SANITY_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    slug,
    excerpt,
    body,
    publishedAt,
    _createdAt,
    "categoryTitles": categoryRefs[]->title,
    "categorySlugs": categoryRefs[]->slug.current,
    mainImage,
    wordpressUrl
  }
`);

export const DEFAULT_ARCHIVE_PAGE_SIZE = 12;

export interface PaginatedPosts {
  posts: BlogPost[];
  page: number;
  totalPages: number;
  totalPosts: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeCategoryTerm(value: string): string {
  return slugify(value.toLowerCase().replace(/&/g, " "));
}

function toPortableTextPlainText(body: PortableTextBlock[] = []): string {
  return body
    .filter((block) => block?._type === "block" && Array.isArray(block.children))
    .map((block) => block.children?.map((child) => child?.text ?? "").join("") ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function toImageUrl(image: SanityImage | undefined): string | undefined {
  if (!image) {
    return undefined;
  }

  try {
    return imageBuilder.image(image as SanityImageSource).width(1200).fit("max").auto("format").url();
  } catch {
    return undefined;
  }
}

function toLegacySlug(wordpressUrl: string | undefined): string | undefined {
  if (!wordpressUrl || typeof wordpressUrl !== "string") {
    return undefined;
  }

  try {
    const parsed = new URL(wordpressUrl);
    const lastSegment = parsed.pathname.split("/").filter(Boolean).at(-1);
    return lastSegment ? decodeURIComponent(lastSegment.trim()) : undefined;
  } catch {
    return undefined;
  }
}

function cleanStrings(values: (string | null)[] | undefined): string[] {
  return Array.isArray(values)
    ? values.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function mapSanityPost(post: SanityPost, index: number): BlogPost {
  const title = post.title?.trim() || "Untitled";
  const slug = post.slug?.current?.trim() || slugify(title || `post-${index + 1}`);
  const body = Array.isArray(post.body) ? post.body : [];
  const plainBody = toPortableTextPlainText(body);
  const excerpt = (post.excerpt?.trim() || plainBody).slice(0, 280);
  const publishedAt = post.publishedAt || post._createdAt || new Date(0).toISOString();
  const categories = cleanStrings(post.categoryTitles);
  const categorySlugs = cleanStrings(post.categorySlugs);

  return {
    id: index + 1,
    sanityId: post._id,
    slug,
    title,
    excerpt,
    contentHtml: "",
    body,
    publishedAt,
    categories,
    categorySlugs,
    featuredImageUrl: toImageUrl(post.mainImage),
    featuredImageAlt: post.mainImage?.alt,
    legacySlug: toLegacySlug(post.wordpressUrl)
  };
}

async function fetchSanityPosts(): Promise<BlogPost[]> {
  const posts = await sanityClient.fetch<SanityPost[]>(SANITY_POSTS_QUERY);
  return posts.map((post, index) => mapSanityPost(post, index)).filter((post) => Boolean(post.slug));
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (allPostsCache) {
    return allPostsCache;
  }

  const postsPromise = fetchSanityPosts();
  allPostsCache = postsPromise;
  postsPromise.catch(() => {
    if (allPostsCache === postsPromise) {
      allPostsCache = null;
    }
  });

  return postsPromise;
}

/**
 * Filter posts by category. The term is matched against both category slugs
 * and normalized category titles, so "news", "News", "webinars & training",
 * and "webinars-training" all resolve as expected.
 */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const normalizedTerm = normalizeCategoryTerm(category.trim());
  if (!normalizedTerm) {
    return getAllPosts();
  }

  const cachedPosts = postsByCategoryCache.get(normalizedTerm);
  if (cachedPosts) {
    return cachedPosts;
  }

  const postsPromise = (async () => {
    const posts = await getAllPosts();
    return posts.filter((post) => {
      const terms = [
        ...post.categorySlugs.map((slug) => normalizeCategoryTerm(slug)),
        ...post.categories.map((title) => normalizeCategoryTerm(title))
      ];
      return terms.includes(normalizedTerm);
    });
  })();

  postsByCategoryCache.set(normalizedTerm, postsPromise);
  postsPromise.catch(() => {
    postsByCategoryCache.delete(normalizedTerm);
  });

  return postsPromise;
}

export async function getCategoryPostPageCount(
  category: string,
  pageSize = DEFAULT_ARCHIVE_PAGE_SIZE
): Promise<number> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const posts = await getPostsByCategory(category);
  return Math.ceil(posts.length / safePageSize);
}

function paginate(allPosts: BlogPost[], page: number, pageSize: number): PaginatedPosts {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / safePageSize);
  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;
  const posts = startIndex >= totalPosts ? [] : allPosts.slice(startIndex, endIndex);

  return {
    posts,
    page: safePage,
    totalPages,
    totalPosts
  };
}

export async function getPaginatedPostsByCategory(
  category: string,
  page: number,
  pageSize = DEFAULT_ARCHIVE_PAGE_SIZE
): Promise<PaginatedPosts> {
  return paginate(await getPostsByCategory(category), page, pageSize);
}

export async function getPostPageCount(pageSize = DEFAULT_ARCHIVE_PAGE_SIZE): Promise<number> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const posts = await getAllPosts();
  return Math.ceil(posts.length / safePageSize);
}

export async function getPaginatedPosts(page: number, pageSize = DEFAULT_ARCHIVE_PAGE_SIZE): Promise<PaginatedPosts> {
  return paginate(await getAllPosts(), page, pageSize);
}
