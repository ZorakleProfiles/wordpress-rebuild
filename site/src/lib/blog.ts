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

const portalUrl = import.meta.env.PORTAL_URL?.trim();
const portalBlogApiUrl = import.meta.env.PORTAL_BLOG_API_URL?.trim();
const postsByCategorySlugCache = new Map<string, Promise<BlogPost[]>>();
const postsByTagCache = new Map<string, Promise<BlogPost[]>>();
let allPostsCache: Promise<BlogPost[]> | null = null;

export const DEFAULT_ARCHIVE_PAGE_SIZE = 12;

export interface PaginatedPosts {
  posts: BlogPost[];
  page: number;
  totalPages: number;
  totalPosts: number;
}

function ensureHttpUrl(rawValue: string, variableName: string): URL {
  try {
    const url = new URL(rawValue);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }

    return url;
  } catch {
    throw new Error(`${variableName} must be an absolute http(s) URL. Received: ${rawValue}`);
  }
}

function ensurePortalBlogApiEndpoint(): string {
  if (portalBlogApiUrl) {
    if (portalBlogApiUrl.startsWith("/")) {
      if (!portalUrl) {
        throw new Error("PORTAL_BLOG_API_URL is relative but PORTAL_URL is missing. Set both in site/.env");
      }

      const baseUrl = ensureHttpUrl(portalUrl, "PORTAL_URL");
      return new URL(portalBlogApiUrl, baseUrl).toString();
    }

    return ensureHttpUrl(portalBlogApiUrl, "PORTAL_BLOG_API_URL").toString();
  }

  if (!portalUrl) {
    throw new Error("PORTAL_URL or PORTAL_BLOG_API_URL is not configured. Set it in site/.env");
  }

  const baseUrl = ensureHttpUrl(portalUrl, "PORTAL_URL");
  return new URL("/api/blog", baseUrl).toString();
}

function getPortalOrigin(): string {
  const endpoint = ensurePortalBlogApiEndpoint();
  return new URL(endpoint).origin;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        const itemRecord = asRecord(item);
        return toText(itemRecord.slug ?? itemRecord.name ?? itemRecord.title ?? itemRecord.label);
      })
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toDateString(value: unknown): string {
  if (typeof value === "number") {
    const fromSeconds = new Date(value * 1000).toISOString();
    return Number.isNaN(Date.parse(fromSeconds)) ? new Date(value).toISOString() : fromSeconds;
  }

  const rawValue = toText(value).trim();
  if (!rawValue) {
    return new Date(0).toISOString();
  }

  const parsed = new Date(rawValue);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date(0).toISOString();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rewriteInternalLinks(html: string): string {
  const portalOrigin = getPortalOrigin();

  // Keep links functional while preventing Astro from crawling root-relative routes during build.
  return html.replace(/href=(['"])(\/[^'"]*)\1/g, (_match, quote: string, path: string) => {
    return `href=${quote}${portalOrigin}${path}${quote}`;
  });
}

function extractPostsFromPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  const posts = record.results;
  return Array.isArray(posts) ? posts : [];
}

function mapPortalPost(rawPost: unknown, index: number): BlogPost {
  const post = asRecord(rawPost);
  const idValue = post.id ?? post.postId ?? post.blogId;
  const id = Number(idValue) || index + 1;
  const title = toText(post.title ?? post.name ?? post.headline);
  const slug = toText(post.slug ?? post.path ?? post.hs_path) || slugify(title || `post-${id}`);

  const excerptSource = toText(post.excerpt ?? post.summary ?? post.description);
  const contentSource = toText(post.postBody);
  const excerpt = stripHtml(excerptSource || contentSource).slice(0, 280);

  const publishedAt = toDateString(post.publishDate);

  const categories = toStringArray(post.categories ?? post.categoryNames ?? post.topicNames ?? post.topics);
  const categorySlugs = toStringArray(post.categorySlugs);
  const normalizedCategorySlugs = (categorySlugs.length > 0 ? categorySlugs : categories.map(slugify)).map((value) =>
    value.toLowerCase()
  );

  const tags = toStringArray(post.tags ?? post.tagNames ?? post.tag_list);

  return {
    id,
    slug,
    title: stripHtml(title),
    excerpt,
    contentHtml: rewriteInternalLinks(contentSource),
    publishedAt,
    tags,
    categories,
    categorySlugs: normalizedCategorySlugs,
    featuredImageUrl: toText(post.featuredImageUrl ?? post.featured_image_url ?? post.imageUrl ?? post.featuredImage),
    featuredImageAlt: toText(post.featuredImageAlt ?? post.featured_image_alt ?? post.imageAlt)
  };
}

async function fetchPortalBlogPosts(tag?: string): Promise<BlogPost[]> {
  const endpoint = new URL(ensurePortalBlogApiEndpoint());
  const normalizedTag = tag?.trim();
  if (normalizedTag) {
    endpoint.searchParams.set("tag", normalizedTag);
  }

  const response = await fetch(endpoint.toString(), {
    headers: {
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `Failed to fetch blog posts from portal API: ${response.status} ${response.statusText}. URL: ${endpoint.toString()}. Body: ${responseBody.slice(0, 500)}`
    );
  }

  let payload = (await response.json()) as unknown;
  return extractPostsFromPayload(payload)
    .map((post, index) => mapPortalPost(post, index))
    .filter((post) => Boolean(post.slug));
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (allPostsCache) {
    return allPostsCache;
  }

  const postsPromise = fetchPortalBlogPosts();
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

  const postsPromise = fetchPortalBlogPosts(normalizedTag);
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

