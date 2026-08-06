import {defineArrayMember, defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'wordpressId',
      title: 'WordPress ID',
      type: 'string',
      description: 'Legacy WordPress post ID used by import scripts for upserts.',
      readOnly: true,
    }),
    defineField({
      name: 'wordpressUrl',
      title: 'WordPress URL',
      type: 'url',
      description: 'Original WordPress permalink for this post.',
      readOnly: true,
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'categoryRefs',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      description: 'Select structured categories (preferred for new posts)',
    }),
    defineField({
      name: 'categories',
      title: 'Legacy Categories (strings)',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: 'Legacy string categories from WordPress import — use Categories above for new posts.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
        }),
        defineArrayMember({
          name: 'embed',
          title: 'Embedded Media',
          type: 'object',
          fields: [
            defineField({
              name: 'url',
              title: 'Embed URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'provider',
              title: 'Provider',
              type: 'string',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      date: 'publishedAt',
    },
    prepare({title, media, date}) {
      return {
        title,
        media,
        subtitle: date ? new Date(date).toLocaleDateString() : 'No date',
      }
    },
  },
})

