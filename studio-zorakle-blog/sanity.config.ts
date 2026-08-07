import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

type SlugValue = {current?: string}

function resolvePreviewOrigin(): string {
  const env = (globalThis as {process?: {env?: Record<string, string | undefined>}}).process?.env || {}
  return env.SANITY_STUDIO_PREVIEW_ORIGIN || env.PUBLIC_SITE_URL || 'http://localhost:4321'
}

const previewOrigin = resolvePreviewOrigin().replace(/\/$/, '')

export default defineConfig({
  name: 'default',
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
    visionTool(),
  ],

  document: {
    productionUrl: async (prev, {document}) => {
      if (document?._type !== 'post') {
        return prev
      }

      const slug = (document.slug as SlugValue | undefined)?.current
      return slug ? `${previewOrigin}/${slug}` : prev
    },
  },

  schema: {
    types: schemaTypes,
  },
})


