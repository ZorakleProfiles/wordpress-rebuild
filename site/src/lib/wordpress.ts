export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  categories: string[];
  categorySlugs: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: string;
}

interface WpRendered {
  rendered: string;
}

interface WpTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

interface WpFeaturedMedia {
  source_url?: string;
  alt_text?: string;
}

interface WpCategory {
  id: number;
}

interface WpPost {
  id: number;
  slug: string;
  date: string;
  title: WpRendered;
  excerpt: WpRendered;
  content: WpRendered;
  _embedded?: {
    [key: string]: unknown;
    "wp:term"?: WpTerm[][];
    "wp:featuredmedia"?: WpFeaturedMedia[];
  };
}

const wpApiBase = import.meta.env.PUBLIC_WP_URL?.replace(/\/$/, "");
const DEFAULT_WP_FETCH_PAGE_SIZE = 100;
const categoryIdBySlugCache = new Map<string, number | null>();

export const DEFAULT_ARCHIVE_PAGE_SIZE = 12;

export interface PaginatedPosts {
  posts: BlogPost[];
  page: number;
  totalPages: number;
  totalPosts: number;
}

function ensureWpApiBase(): string {
  if (!wpApiBase) {
    throw new Error("PUBLIC_WP_URL is not configured. Set it in site/.env");
  }

  return wpApiBase;
}

function getWpSiteOrigin(): string {
  const apiBase = ensureWpApiBase();
  return new URL(apiBase).origin;
}

async function fetchWpPostCollection(endpoint: string): Promise<{ posts: WpPost[]; totalPages: number; totalPosts: number }> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch WordPress posts: ${response.status} ${response.statusText}`);
  }

  const totalPages = Number(response.headers.get("X-WP-TotalPages") || "1");
  const totalPosts = Number(response.headers.get("X-WP-Total") || "0");
  const posts = (await response.json()) as WpPost[];
  return { posts, totalPages, totalPosts };
}

async function fetchWpPostsPage(page: number): Promise<{ posts: WpPost[]; totalPages: number; totalPosts: number }> {
  const apiBase = ensureWpApiBase();
  const endpoint = `${apiBase}/posts?_embed=1&per_page=${DEFAULT_WP_FETCH_PAGE_SIZE}&page=${page}&orderby=date&order=desc`;

  return fetchWpPostCollection(endpoint);
}

async function getCategoryIdBySlug(categorySlug: string): Promise<number | null> {
  const normalizedCategorySlug = categorySlug.trim().toLowerCase();
  if (!normalizedCategorySlug) {
    return null;
  }

  const cachedCategoryId = categoryIdBySlugCache.get(normalizedCategorySlug);
  if (cachedCategoryId !== undefined) {
    return cachedCategoryId;
  }

  const apiBase = ensureWpApiBase();
  const endpoint = `${apiBase}/categories?slug=${encodeURIComponent(normalizedCategorySlug)}&per_page=1`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch WordPress categories: ${response.status} ${response.statusText}`);
  }

  const categories = (await response.json()) as WpCategory[];
  const categoryId = categories[0]?.id ?? null;
  categoryIdBySlugCache.set(normalizedCategorySlug, categoryId);
  return categoryId;
}

async function fetchWpCategoryPostsPage(
  categoryId: number,
  page: number,
  perPage: number
): Promise<{ posts: WpPost[]; totalPages: number; totalPosts: number }> {
  const apiBase = ensureWpApiBase();
  const endpoint =
    `${apiBase}/posts?_embed=1&categories=${categoryId}&per_page=${perPage}&page=${page}` +
    "&orderby=date&order=desc";

  return fetchWpPostCollection(endpoint);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rewriteInternalLinks(html: string): string {
  const wpOrigin = getWpSiteOrigin();

  // Keep links functional while preventing Astro from crawling root-relative routes during build.
  return html.replace(/href=(['"])(\/[^'"]*)\1/g, (_match, quote: string, path: string) => {
    return `href=${quote}${wpOrigin}${path}${quote}`;
  });
}

function mapPost(post: WpPost): BlogPost {
  const terms = post._embedded?.["wp:term"] || [];
  const flattenedTerms = terms.flat();

  const categoryTerms = flattenedTerms.filter((term) => term.taxonomy === "category");
  const categories = categoryTerms.map((term) => term.name);
  const categorySlugs = categoryTerms.map((term) => term.slug.toLowerCase());

  const tags = flattenedTerms
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => term.name);

  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    contentHtml: rewriteInternalLinks(post.content.rendered),
    publishedAt: post.date,
    tags,
    categories,
    categorySlugs,
    featuredImageUrl: featuredMedia?.source_url,
    featuredImageAlt: featuredMedia?.alt_text || ""
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const firstPage = await fetchWpPostsPage(1);
  const allPosts = [...firstPage.posts];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await fetchWpPostsPage(page);
    allPosts.push(...result.posts);
  }

  return allPosts.map(mapPost);
}

export async function getPostsByCategorySlug(categorySlug: string): Promise<BlogPost[]> {
  const categoryId = await getCategoryIdBySlug(categorySlug);
  if (!categoryId) {
    return [];
  }

  const firstPage = await fetchWpCategoryPostsPage(categoryId, 1, DEFAULT_WP_FETCH_PAGE_SIZE);
  const allPosts = [...firstPage.posts];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await fetchWpCategoryPostsPage(categoryId, page, DEFAULT_WP_FETCH_PAGE_SIZE);
    allPosts.push(...result.posts);
  }

  return allPosts.map(mapPost);
}

export async function getCategoryPostPageCount(
  categorySlug: string,
  pageSize = DEFAULT_ARCHIVE_PAGE_SIZE
): Promise<number> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const categoryId = await getCategoryIdBySlug(categorySlug);
  if (!categoryId) {
    return 0;
  }

  const firstPage = await fetchWpCategoryPostsPage(categoryId, 1, safePageSize);
  return firstPage.totalPages;
}

export async function getPaginatedPostsByCategorySlug(
  categorySlug: string,
  page: number,
  pageSize = DEFAULT_ARCHIVE_PAGE_SIZE
): Promise<PaginatedPosts> {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const categoryId = await getCategoryIdBySlug(categorySlug);
  if (!categoryId) {
    return { posts: [], page: safePage, totalPages: 0, totalPosts: 0 };
  }

  const result = await fetchWpCategoryPostsPage(categoryId, safePage, safePageSize);

  return {
    posts: result.posts.map(mapPost),
    page: safePage,
    totalPages: result.totalPages,
    totalPosts: result.totalPosts
  };
}
