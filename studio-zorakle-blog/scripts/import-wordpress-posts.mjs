import {createClient} from '@sanity/client'
import {Schema} from '@sanity/schema'
import {htmlToBlocks} from '@portabletext/block-tools'
import {JSDOM} from 'jsdom'

const args = new Set(process.argv.slice(2))
const isWriteMode = args.has('--write')
const showHelp = args.has('--help') || args.has('-h')
if (showHelp) {
  printHelp()
  process.exit(0)
}

const env = {
  wordpressBaseUrl: process.env.WORDPRESS_BASE_URL,
  wordpressUsername: process.env.WORDPRESS_USERNAME,
  wordpressAppPassword: process.env.WORDPRESS_APP_PASSWORD,
  wordpressStatus: process.env.WORDPRESS_STATUS || 'publish',
  perPage: Number(process.env.WORDPRESS_PER_PAGE || 50),
  limit: Number(process.env.WORDPRESS_LIMIT || 0),
  sanityProjectId: process.env.SANITY_PROJECT_ID || '4kjxjblw',
  sanityDataset: process.env.SANITY_DATASET || 'production',
  sanityApiVersion: process.env.SANITY_API_VERSION || '2025-01-01',
  sanityApiToken: process.env.SANITY_API_TOKEN,
}

if (!env.wordpressBaseUrl) {
  console.error('Missing WORDPRESS_BASE_URL')
  printHelp()
  process.exit(1)
}

if (isWriteMode && !env.sanityApiToken) {
  console.error('Missing SANITY_API_TOKEN for write mode')
  printHelp()
  process.exit(1)
}

const client = createClient({
  projectId: env.sanityProjectId,
  dataset: env.sanityDataset,
  apiVersion: env.sanityApiVersion,
  token: env.sanityApiToken,
  useCdn: false,
})

const imageCache = new Map()
const MEDIA_TOKEN_PREFIX = '__WP_MEDIA_'

const portableTextSchema = Schema.compile({
  name: 'importSchema',
  types: [
    {
      name: 'body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Blockquote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                fields: [
                  {name: 'href', type: 'url'},
                  {name: 'blank', type: 'boolean'},
                ],
              },
            ],
          },
        },
      ],
    },
  ],
})

const blockContentType = portableTextSchema.get('body')

async function main() {
  const posts = await fetchWordPressPosts(env)
  const slicedPosts = env.limit > 0 ? posts.slice(0, env.limit) : posts

  console.log(`Fetched ${posts.length} WordPress posts.`)
  if (env.limit > 0) {
    console.log(`Limiting to ${slicedPosts.length} posts (WORDPRESS_LIMIT=${env.limit}).`)
  }

  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0

  for (const post of slicedPosts) {
    const mapped = await mapWordPressPostToSanity(post)

    if (!mapped.slug?.current) {
      skippedCount += 1
      console.warn(`Skipping WordPress post ${post.id}: missing slug`)
      continue
    }

    const existingId = await findExistingSanityPostId(String(post.id))
    if (!isWriteMode) {
      const action = existingId ? 'UPDATE' : 'CREATE'
      console.log(`[DRY RUN] ${action} post ${post.id} -> slug=${mapped.slug.current}`)
      continue
    }

    if (existingId) {
      await client.patch(existingId).set(mapped).commit({autoGenerateArrayKeys: true})
      updatedCount += 1
      console.log(`Updated post ${post.id} -> ${mapped.slug.current}`)
    } else {
      await client.create({_type: 'post', ...mapped})
      createdCount += 1
      console.log(`Created post ${post.id} -> ${mapped.slug.current}`)
    }
  }

  if (isWriteMode) {
    console.log(`Done. Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`)
  } else {
    console.log('Dry run complete. Re-run with --write to apply changes.')
  }
}

async function fetchWordPressPosts(config) {
  const base = config.wordpressBaseUrl.replace(/\/$/, '')
  const headers = getWordPressHeaders(config)
  const allPosts = []

  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const url = new URL(`${base}/wp-json/wp/v2/posts`)
    url.searchParams.set('per_page', String(Math.min(Math.max(config.perPage, 1), 100)))
    url.searchParams.set('page', String(page))
    url.searchParams.set('status', config.wordpressStatus)
    url.searchParams.set('_embed', '1')

    const response = await fetch(url, {headers})
    if (!response.ok) {
      const body = await safeResponseText(response)
      throw new Error(`WordPress fetch failed (${response.status}): ${body}`)
    }

    totalPages = Number(response.headers.get('x-wp-totalpages') || '1')
    const posts = await response.json()
    allPosts.push(...posts)
    page += 1
  }

  return allPosts
}

function getWordPressHeaders(config) {
  if (!config.wordpressUsername || !config.wordpressAppPassword) {
    return {}
  }

  const value = `${config.wordpressUsername}:${config.wordpressAppPassword}`
  const token = Buffer.from(value).toString('base64')
  return {
    Authorization: `Basic ${token}`,
  }
}

function toPlainText(html = '') {
  const dom = new JSDOM(html)
  return dom.window.document.body.textContent?.replace(/\s+/g, ' ').trim() || ''
}

async function htmlToPortableText(html = '') {
  if (!html.trim()) {
    return []
  }

  try {
    const {htmlWithTokens, inlineMedia} = replaceInlineMediaWithTokens(html)

    const blocks = htmlToBlocks(htmlWithTokens, blockContentType, {
      parseHtml: (value) => new JSDOM(value).window.document,
    })

    return resolveInlineMediaTokens(blocks, inlineMedia)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.warn(`Portable Text conversion failed, falling back to plain text block. Reason: ${detail}`)
    const plainText = toPlainText(html)
    if (!plainText) {
      return []
    }

    return [
      {
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            text: plainText,
            marks: [],
          },
        ],
      },
    ]
  }
}

function replaceInlineMediaWithTokens(html) {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const inlineMedia = []

  doc.querySelectorAll('img, iframe, video').forEach((element, index) => {
    const tagName = element.tagName.toLowerCase()
    const token = `${MEDIA_TOKEN_PREFIX}${index}__`
    const paragraph = doc.createElement('p')
    paragraph.textContent = token

    if (tagName === 'img') {
      const src = normalizeMediaUrl(element.getAttribute('src'))
      if (!src) {
        element.remove()
        return
      }

      inlineMedia.push({
        token,
        type: 'image',
        src,
        alt: element.getAttribute('alt') || undefined,
        caption: getImageCaption(element) || undefined,
      })
      element.replaceWith(paragraph)
      return
    }

    if (tagName === 'iframe') {
      const src = normalizeMediaUrl(element.getAttribute('src'))
      if (!src) {
        element.remove()
        return
      }

      inlineMedia.push({
        token,
        type: 'embed',
        url: src,
        title: element.getAttribute('title') || undefined,
      })
      element.replaceWith(paragraph)
      return
    }

    const videoSource = normalizeMediaUrl(
      element.getAttribute('src') || element.querySelector('source')?.getAttribute('src')
    )
    if (!videoSource) {
      element.remove()
      return
    }

    inlineMedia.push({
      token,
      type: 'embed',
      url: videoSource,
      title: element.getAttribute('title') || undefined,
    })
    element.replaceWith(paragraph)
  })

  return {
    htmlWithTokens: doc.body.innerHTML,
    inlineMedia,
  }
}

async function resolveInlineMediaTokens(blocks, inlineMedia) {
  if (!inlineMedia.length) {
    return blocks
  }

  const tokenMap = new Map(inlineMedia.map((media) => [media.token, media]))
  const resolvedBlocks = []

  for (const block of blocks) {
    if (block?._type !== 'block' || !Array.isArray(block.children)) {
      resolvedBlocks.push(block)
      continue
    }

    const textContent = block.children.map((child) => child?.text || '').join('').trim()
    const tokenMatch = tokenMap.get(textContent)
    if (!tokenMatch) {
      resolvedBlocks.push(block)
      continue
    }

    if (tokenMatch.type === 'image') {
      const asset = await uploadImageToSanity(tokenMatch.src)
      resolvedBlocks.push({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
        alt: tokenMatch.alt,
        caption: tokenMatch.caption,
      })
      continue
    }

    resolvedBlocks.push({
      _type: 'embed',
      url: tokenMatch.url,
      provider: getEmbedProvider(tokenMatch.url),
      title: tokenMatch.title,
    })
  }

  return resolvedBlocks
}

function getImageCaption(imageElement) {
  const title = imageElement.getAttribute('title')?.trim()
  if (title) {
    return title
  }

  const figure = imageElement.closest('figure')
  const figcaption = figure?.querySelector('figcaption')?.textContent?.trim()
  return figcaption || undefined
}

function normalizeMediaUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return undefined
  }

  const trimmed = url.trim()
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  return trimmed
}

function getEmbedProvider(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('vimeo.com')) return 'vimeo'
    if (host.includes('loom.com')) return 'loom'
    if (host.includes('wistia.com') || host.includes('wistia.net')) return 'wistia'
    return 'external'
  } catch {
    return 'external'
  }
}

async function mapWordPressPostToSanity(post) {
  const title = toPlainText(post?.title?.rendered || 'Untitled') || 'Untitled'
  const slug = String(post?.slug || '').trim()
  const body = await htmlToPortableText(post?.content?.rendered || '')
  const excerpt = toPlainText(post?.excerpt?.rendered || '').slice(0, 280)
  const categories = getTerms(post, 'category')
  // WP categories are the routing signal (News, Podcasts, Webinars & Training).
  // The frontend filters on the `tags` field, so merge categories in.
  const wpTags = getTerms(post, 'post_tag')
  const tags = [...new Set([...categories, ...wpTags])]
  const publishedAt = toIsoDate(post?.date_gmt, post?.date)
  const author = await getOrCreateAuthorReference(post)

  const mainImage = await getFeaturedImage(post)

  return {
    title,
    slug: {current: slug},
    wordpressId: String(post.id),
    wordpressUrl: post.link || undefined,
    author,
    publishedAt,
    excerpt,
    categories,
    tags,
    mainImage,
    body,
  }
}

function toIsoDate(dateGmt, dateLocal) {
  if (dateGmt) {
    return new Date(`${dateGmt}Z`).toISOString()
  }
  if (dateLocal) {
    return new Date(dateLocal).toISOString()
  }
  return new Date().toISOString()
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
}

function getTerms(post, taxonomy) {
  const termGroups = post?._embedded?.['wp:term'] || []
  const names = []

  for (const group of termGroups) {
    for (const term of group) {
      if (term?.taxonomy !== taxonomy) {
        continue
      }
      if (typeof term?.name !== 'string' || !term.name.trim()) {
        continue
      }
      names.push(decodeHtmlEntities(term.name.trim()))
    }
  }

  return [...new Set(names)]
}

async function getOrCreateAuthorReference(post) {
  const embeddedAuthor = post?._embedded?.author?.[0]
  const wordpressAuthorId = String(embeddedAuthor?.id || post?.author || '').trim()
  if (!wordpressAuthorId) {
    return undefined
  }

  const existingAuthorId = await client.fetch(
    '*[_type == "author" && wordpressAuthorId == $wordpressAuthorId][0]._id',
    {wordpressAuthorId}
  )

  if (existingAuthorId) {
    if (isWriteMode && embeddedAuthor) {
      const mappedAuthor = await mapWordPressAuthorToSanity(embeddedAuthor, wordpressAuthorId)
      await client.patch(existingAuthorId).set(mappedAuthor).commit()
    }

    return {
      _type: 'reference',
      _ref: existingAuthorId,
    }
  }

  if (!isWriteMode) {
    return {
      _type: 'reference',
      _ref: `author-dry-run-${wordpressAuthorId}`,
    }
  }

  const mappedAuthor = await mapWordPressAuthorToSanity(embeddedAuthor, wordpressAuthorId)
  const createdAuthor = await client.create({_type: 'author', ...mappedAuthor})

  return {
    _type: 'reference',
    _ref: createdAuthor._id,
  }
}

async function mapWordPressAuthorToSanity(embeddedAuthor, wordpressAuthorId) {
  const name = String(embeddedAuthor?.name || `Author ${wordpressAuthorId}`).trim() || `Author ${wordpressAuthorId}`
  const slugCurrent = String(embeddedAuthor?.slug || slugify(name)).trim() || slugify(name)
  const bio = toPlainText(embeddedAuthor?.description || '') || undefined
  const wordpressUrl = embeddedAuthor?.link || undefined
  const avatarUrl = getAuthorAvatarUrl(embeddedAuthor)
  const avatarAsset = avatarUrl ? await uploadImageToSanity(avatarUrl) : undefined

  return {
    name,
    slug: {current: slugCurrent},
    wordpressAuthorId,
    wordpressUrl,
    bio,
    avatar: avatarAsset
      ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: avatarAsset._id,
          },
          alt: name,
        }
      : undefined,
  }
}

function getAuthorAvatarUrl(embeddedAuthor) {
  const avatarUrls = embeddedAuthor?.avatar_urls
  if (!avatarUrls || typeof avatarUrls !== 'object') {
    return undefined
  }

  for (const size of ['96', '48', '24']) {
    if (typeof avatarUrls[size] === 'string' && avatarUrls[size].trim()) {
      return avatarUrls[size]
    }
  }

  for (const value of Object.values(avatarUrls)) {
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return undefined
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function getFeaturedImage(post) {
  const media = post?._embedded?.['wp:featuredmedia']?.[0]
  const url = normalizeMediaUrl(media?.source_url)
  if (!url) {
    return undefined
  }

  const mediaType = String(media?.media_type || '').toLowerCase()
  const mimeType = String(media?.mime_type || '').toLowerCase()
  const looksLikeImageUrl = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(url)
  const isImage = mediaType === 'image' || mimeType.startsWith('image/') || looksLikeImageUrl
  if (!isImage) {
    return undefined
  }

  const altText = (media?.alt_text || toPlainText(post?.title?.rendered || '')).trim() || undefined
  const asset = await uploadImageToSanity(url)

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
    alt: altText,
  }
}

async function uploadImageToSanity(url) {
  const normalizedUrl = normalizeMediaUrl(url)
  if (!normalizedUrl) {
    throw new Error('Missing image URL for upload')
  }

  const cached = imageCache.get(normalizedUrl)
  if (cached) {
    return cached
  }

  if (!isWriteMode) {
    return {_id: 'image-dry-run'}
  }

  const existingAssetId = await client.fetch(
    '*[_type == "sanity.imageAsset" && source.url == $url][0]._id',
    {url: normalizedUrl}
  )
  if (existingAssetId) {
    const existingAsset = {_id: existingAssetId}
    imageCache.set(normalizedUrl, existingAsset)
    return existingAsset
  }

  const imageResponse = await fetch(normalizedUrl)
  if (!imageResponse.ok) {
    const body = await safeResponseText(imageResponse)
    throw new Error(`Image download failed (${imageResponse.status}): ${body}`)
  }

  const arrayBuffer = await imageResponse.arrayBuffer()
  const filename = getFilenameFromUrl(normalizedUrl)
  const asset = await client.assets.upload('image', Buffer.from(arrayBuffer), {
    filename,
    source: {
      id: normalizedUrl,
      name: 'wordpress-import',
      url: normalizedUrl,
    },
  })

  imageCache.set(normalizedUrl, asset)
  return asset
}

function getFilenameFromUrl(url) {
  try {
    const parsed = new URL(url)
    const raw = parsed.pathname.split('/').pop()
    return raw && raw.trim() ? raw : 'wordpress-image'
  } catch {
    return 'wordpress-image'
  }
}

async function findExistingSanityPostId(wordpressId) {
  if (!isWriteMode) {
    // Dry mode still checks for existing docs to show CREATE vs UPDATE.
    return client.fetch('*[_type == "post" && wordpressId == $wordpressId][0]._id', {wordpressId})
  }

  return client.fetch('*[_type == "post" && wordpressId == $wordpressId][0]._id', {wordpressId})
}

async function safeResponseText(response) {
  try {
    return await response.text()
  } catch {
    return '<failed to read response body>'
  }
}

function printHelp() {
  console.log(`WordPress -> Sanity importer

Usage:
  node ./scripts/import-wordpress-posts.mjs           # dry run
  node ./scripts/import-wordpress-posts.mjs --write   # write to Sanity

Required environment variables:
  WORDPRESS_BASE_URL     Example: https://example.com

Required for --write:
  SANITY_API_TOKEN       Write token for your Sanity project/dataset

Optional environment variables:
  WORDPRESS_USERNAME     For Basic Auth (private WP installs)
  WORDPRESS_APP_PASSWORD WordPress application password
  WORDPRESS_STATUS       Default: publish
  WORDPRESS_PER_PAGE     Default: 50 (max 100)
  WORDPRESS_LIMIT        Default: 0 (no limit)
  SANITY_PROJECT_ID      Default: 4kjxjblw
  SANITY_DATASET         Default: production
  SANITY_API_VERSION     Default: 2025-01-01
`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

