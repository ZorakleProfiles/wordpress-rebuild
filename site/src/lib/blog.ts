import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";
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
  tags?: string[];
  categories?: string[];
  mainImage?: SanityImage;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  body: PortableTextBlock[];
  publishedAt: string;
  tags: string[];
  categories: string[];
  categorySlugs: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: string;
}

const postsByCategorySlugCache = new Map<string, Promise<BlogPost[]>>();
const postsByTagCache = new Map<string, Promise<BlogPost[]>>();
let allPostsCache: Promise<BlogPost[]> | null = null;

const imageBuilder = imageUrlBuilder(sanityClient);

const SANITY_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    slug,
    excerpt,
    body,
    publishedAt,
    _createdAt,
    tags,
    categories,
    mainImage
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

function mapSanityPost(post: SanityPost, index: number): BlogPost {
  const title = post.title?.trim() || "Untitled";
  const slug = post.slug?.current?.trim() || slugify(title || `post-${index + 1}`);
  const body = Array.isArray(post.body) ? post.body : [];
  const plainBody = toPortableTextPlainText(body);
  const excerpt = (post.excerpt?.trim() || plainBody).slice(0, 280);
  const publishedAt = post.publishedAt || post._createdAt || new Date(0).toISOString();
  const categories = Array.isArray(post.categories) ? post.categories : [];
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return {
    id: index + 1,
    slug,
    title,
    excerpt,
    contentHtml: "",
    body,
    publishedAt,
    tags,
    categories,
    categorySlugs: categories.map((category) => slugify(category)),
    featuredImageUrl: toImageUrl(post.mainImage),
    featuredImageAlt: post.mainImage?.alt
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

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const normalizedTag = tag.trim().toLowerCase();
  if (!normalizedTag) {
    return getAllPosts();
  }

  const cachedPosts = postsByTagCache.get(normalizedTag);
  if (cachedPosts) {
    return cachedPosts;
  }

  const postsPromise = (async () => {
    const posts = await getAllPosts();
    return posts.filter((post) => post.tags.some((item) => item.trim().toLowerCase() === normalizedTag));
  })();

  postsByTagCache.set(normalizedTag, postsPromise);
  postsPromise.catch(() => {
    postsByTagCache.delete(normalizedTag);
  });

  return postsPromise;
}

export async function getPostsByCategorySlug(categorySlug: string): Promise<BlogPost[]> {
  const normalizedCategorySlug = categorySlug.trim().toLowerCase();
  if (!normalizedCategorySlug) {
    return [];
  }

  const cachedPosts = postsByCategorySlugCache.get(normalizedCategorySlug);
  if (cachedPosts) {
    return cachedPosts;
  }

  const postsPromise = (async () => {
    const allPosts = await getAllPosts();
    return allPosts.filter((post) => {
      const slugs = post.categorySlugs.map((slug) => slug.toLowerCase());
      if (slugs.includes(normalizedCategorySlug)) {
        return true;
      }

      const categoryNames = post.categories.map((category) => category.trim().toLowerCase());
      return categoryNames.includes(normalizedCategorySlug);
    });
  })();

  postsByCategorySlugCache.set(normalizedCategorySlug, postsPromise);
  postsPromise.catch(() => {
    postsByCategorySlugCache.delete(normalizedCategorySlug);
  });

  return postsPromise;
}

export async function getCategoryPostPageCount(
  categorySlug: string,
  pageSize = DEFAULT_ARCHIVE_PAGE_SIZE
): Promise<number> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const posts = await getPostsByCategorySlug(categorySlug);
  return Math.ceil(posts.length / safePageSize);
}

export async function getPaginatedPostsByCategorySlug(
  categorySlug: string,
  page: number,
  pageSize = DEFAULT_ARCHIVE_PAGE_SIZE
): Promise<PaginatedPosts> {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const allPosts = await getPostsByCategorySlug(categorySlug);
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

export async function getPostPageCount(pageSize = DEFAULT_ARCHIVE_PAGE_SIZE): Promise<number> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const posts = await getAllPosts();
  return Math.ceil(posts.length / safePageSize);
}

export async function getPaginatedPosts(page: number, pageSize = DEFAULT_ARCHIVE_PAGE_SIZE): Promise<PaginatedPosts> {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const allPosts = await getAllPosts();
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

export async function getTaggedPostPageCount(tag: string, pageSize = DEFAULT_ARCHIVE_PAGE_SIZE): Promise<number> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const posts = await getPostsByTag(tag);
  return Math.ceil(posts.length / safePageSize);
}

export async function getPaginatedPostsByTag(
  tag: string,
  page: number,
  pageSize = DEFAULT_ARCHIVE_PAGE_SIZE
): Promise<PaginatedPosts> {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const allPosts = await getPostsByTag(tag);
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

