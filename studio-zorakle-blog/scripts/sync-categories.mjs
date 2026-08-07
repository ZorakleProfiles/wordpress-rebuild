import {createClient} from '@sanity/client'

/**
 * One-time migration: make posts fully relational on categories.
 *
 * For every post:
 *  1. Convert legacy string `categories` into `category` document references
 *     (creating category documents when missing) and merge them into `categoryRefs`.
 *  2. Unset the removed fields: `categories` (legacy strings), `tags`, `author`.
 *
 * Usage:
 *   node ./scripts/sync-categories.mjs           # dry run
 *   node ./scripts/sync-categories.mjs --write   # apply changes
 *
 * Env:
 *   SANITY_API_TOKEN   required for --write
 *   SANITY_PROJECT_ID  default 4kjxjblw
 *   SANITY_DATASET     default production
 */

const args = new Set(process.argv.slice(2))
const isWriteMode = args.has('--write')

const env = {
  projectId: process.env.SANITY_PROJECT_ID || '4kjxjblw',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
}

if (isWriteMode && !env.token) {
  console.error('Missing SANITY_API_TOKEN for write mode')
  process.exit(1)
}

const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  token: env.token,
  useCdn: false,
})

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const categoryIdBySlug = new Map()

async function loadExistingCategories() {
  const categories = await client.fetch('*[_type == "category"]{_id, title, "slug": slug.current}')
  for (const category of categories) {
    if (category.slug) {
      categoryIdBySlug.set(category.slug, category._id)
    }
    if (category.title) {
      // Also index by slugified title so string matching is forgiving.
      categoryIdBySlug.set(slugify(category.title), category._id)
    }
  }
  console.log(`Loaded ${categories.length} existing categories.`)
}

async function getOrCreateCategoryId(title) {
  const slugCurrent = slugify(title)
  if (!slugCurrent) {
    return undefined
  }

  const cached = categoryIdBySlug.get(slugCurrent)
  if (cached) {
    return cached
  }

  if (!isWriteMode) {
    const dryId = `category-dry-run-${slugCurrent}`
    categoryIdBySlug.set(slugCurrent, dryId)
    console.log(`[DRY RUN] CREATE category "${title}" (${slugCurrent})`)
    return dryId
  }

  const created = await client.create({
    _type: 'category',
    title,
    slug: {current: slugCurrent},
  })
  categoryIdBySlug.set(slugCurrent, created._id)
  console.log(`Created category "${title}" (${slugCurrent})`)
  return created._id
}

async function main() {
  await loadExistingCategories()

  const posts = await client.fetch(`
    *[_type == "post"]{
      _id,
      title,
      categories,
      tags,
      author,
      "categoryRefIds": categoryRefs[]._ref
    }
  `)
  console.log(`Fetched ${posts.length} posts.`)

  let patchedCount = 0
  let untouchedCount = 0

  for (const post of posts) {
    const legacyCategories = Array.isArray(post.categories) ? post.categories : []
    const existingRefIds = Array.isArray(post.categoryRefIds) ? post.categoryRefIds : []

    const desiredRefIds = [...existingRefIds]
    for (const name of legacyCategories) {
      const title = String(name || '').trim()
      if (!title) continue
      const categoryId = await getOrCreateCategoryId(title)
      if (categoryId && !desiredRefIds.includes(categoryId)) {
        desiredRefIds.push(categoryId)
      }
    }

    const needsRefUpdate = desiredRefIds.length !== existingRefIds.length
    const needsUnset =
      legacyCategories.length > 0 || (Array.isArray(post.tags) && post.tags.length > 0) || Boolean(post.author)

    if (!needsRefUpdate && !needsUnset) {
      untouchedCount += 1
      continue
    }

    if (!isWriteMode) {
      console.log(
        `[DRY RUN] PATCH "${post.title}" (${post._id}) -> categoryRefs: ${desiredRefIds.length}, unset: categories/tags/author`
      )
      patchedCount += 1
      continue
    }

    let patch = client.patch(post._id).unset(['categories', 'tags', 'author'])
    if (needsRefUpdate) {
      patch = patch.set({
        categoryRefs: desiredRefIds.map((id) => ({
          _type: 'reference',
          _ref: id,
          _key: id.replace(/[^a-zA-Z0-9_-]/g, '-'),
        })),
      })
    }
    await patch.commit()
    patchedCount += 1
    console.log(`Patched "${post.title}" (${post._id})`)
  }

  console.log(
    `${isWriteMode ? 'Done' : 'Dry run complete'}. Patched: ${patchedCount}, untouched: ${untouchedCount}.${isWriteMode ? '' : ' Re-run with --write to apply.'}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

