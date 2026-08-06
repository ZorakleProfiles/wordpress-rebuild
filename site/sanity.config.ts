import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './src/sanity/schemaTypes'

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

  schema: {
    types: schemaTypes,
  },
})
