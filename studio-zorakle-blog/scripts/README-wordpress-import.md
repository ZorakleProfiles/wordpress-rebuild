# WordPress to Sanity Import

This importer pulls posts from a WordPress site (`/wp-json/wp/v2/posts`) and upserts them into the Sanity `post` schema.

## What it imports

- `title`
- `slug`
- `publishedAt`
- `excerpt`
- `author` (mapped to `post.author` reference)
- `categories`
- `tags`
- `body` (HTML converted to Portable Text, including inline image upload)
- `mainImage` (featured image uploaded to Sanity)
- `wordpressId` and `wordpressUrl` for idempotent re-runs

The importer also upserts `author` documents using `wordpressAuthorId` and stores avatar images when available.

## 1) Install dependencies

```bash
cd /Users/mikekidushim/Projects/zorakle-wp-update/studio-zorakle-blog
npm install
```

## 2) Run a dry run

```bash
WORDPRESS_BASE_URL="https://your-wordpress-site.com" npm run import:wordpress:dry
```

## 3) Import for real

```bash
WORDPRESS_BASE_URL="https://your-wordpress-site.com" SANITY_API_TOKEN="your-sanity-write-token" npm run import:wordpress
```

## Optional variables

```bash
WORDPRESS_USERNAME="your-wp-user"
WORDPRESS_APP_PASSWORD="your-wp-app-password"
WORDPRESS_STATUS="publish"
WORDPRESS_PER_PAGE="50"
WORDPRESS_LIMIT="25"
SANITY_PROJECT_ID="4kjxjblw"
SANITY_DATASET="production"
SANITY_API_VERSION="2025-01-01"
```

Use `WORDPRESS_USERNAME` + `WORDPRESS_APP_PASSWORD` if the WP API requires authentication.

