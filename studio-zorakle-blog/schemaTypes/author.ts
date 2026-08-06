import {defineField, defineType} from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'wordpressAuthorId',
      title: 'WordPress Author ID',
      type: 'string',
      description: 'Legacy WordPress author ID used by import scripts for upserts.',
      readOnly: true,
    }),
    defineField({
      name: 'wordpressUrl',
      title: 'WordPress URL',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
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
  ],
  preview: {
    select: {
      title: 'name',
      media: 'avatar',
      subtitle: 'wordpressAuthorId',
    },
    prepare({title, media, subtitle}) {
      return {
        title,
        media,
        subtitle: subtitle ? `WP ID: ${subtitle}` : undefined,
      }
    },
  },
})

