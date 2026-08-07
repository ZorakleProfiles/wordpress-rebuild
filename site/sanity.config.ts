import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './src/sanity/schemaTypes'

type SlugValue = {current?: string}

function resolvePreviewOrigin(): string {
  const env = (globalThis as {process?: {env?: Record<string, string | undefined>}}).process?.env || {}
  return env.SANITY_STUDIO_PREVIEW_ORIGIN || env.PUBLIC_SITE_URL || 'http://localhost:4321'
}

const previewOrigin = resolvePreviewOrigin().replace(/\/$/, '')

export default defineConfig({
  name: 'zorakle-blog',
  title: 'Zorakle Blog',

  projectId: '4kjxjblw',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Posts')
              .child(
                S.documentList()
                  .title('All Posts')
                  .filter('_type == "post"')
                  .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
              ),
            S.listItem()
              .title('Categories')
              .child(
                S.documentList()
                  .title('Categories')
                  .filter('_type == "category"')
                  .defaultOrdering([{field: 'title', direction: 'asc'}])
              ),
            S.listItem()
              .title('Authors')
              .child(
                S.documentList()
                  .title('Authors')
                  .filter('_type == "author"')
                  .defaultOrdering([{field: 'name', direction: 'asc'}])
              ),
          ]),
    }),
  ],

  document: {
    productionUrl: async (prev, {document, getClient}) => {
      if (document?._type !== 'post') {
        return prev
      }

      const slug = (document.slug as SlugValue | undefined)?.current
      const publishedId = String(document._id || '').replace(/^drafts\./, '')

      // Only link to the live page when the post is actually published —
      // the static build has no page for draft-only posts.
      const client = getClient({apiVersion: '2026-08-01'})
      const isPublished = publishedId
        ? await client.fetch<boolean>('defined(*[_id == $id][0]._id)', {id: publishedId})
        : false

      if (isPublished && slug) {
        return `${previewOrigin}/${slug}`
      }

      // Draft-only post: use the client-side draft preview page.
      const params = new URLSearchParams()
      if (slug) params.set('slug', slug)
      if (publishedId) params.set('id', publishedId)
      return params.size > 0 ? `${previewOrigin}/preview?${params.toString()}` : prev
    },
  },

  schema: {
    types: schemaTypes,
  },
})
