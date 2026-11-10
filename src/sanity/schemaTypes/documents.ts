import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { TagIcon } from '@sanity/icons/Tag'
import { TagsIcon } from '@sanity/icons/Tags'
import { UserIcon } from '@sanity/icons/User'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { accentOptions } from './objects'

const DOODLES = ['notebook', 'oops', 'comb', 'compass', 'eye', 'box', 'plant', 'clock', 'mug', 'door', 'paw', 'yarn']

export const post = defineType({
  name: 'post',
  title: 'Story',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Details' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(110),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'content',
      description: 'The story lives at oopsarka.space/diary/<slug>. Generate it from the title.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'One or two sentences for story cards, search results and social previews.',
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'arkaImage',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'body', title: 'Story', type: 'body', group: 'content' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'tag' }] })],
      validation: (rule) => rule.unique().max(8),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published',
      type: 'datetime',
      group: 'meta',
      description: 'Future dates stay hidden until that time (the site checks hourly).',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated',
      type: 'datetime',
      group: 'meta',
      description: 'Set this when you make a meaningful edit to an older story.',
    }),
    defineField({
      name: 'featured',
      title: 'Feature on the homepage',
      type: 'boolean',
      group: 'meta',
      initialValue: false,
    }),
    defineField({
      name: 'sample',
      title: 'Sample content',
      type: 'boolean',
      group: 'meta',
      description: 'Shows a "Sample story" label on the site. Switch off once the story is real.',
      initialValue: false,
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', category: 'category.title', date: 'publishedAt', media: 'cover', sample: 'sample' },
    prepare: ({ title, category, date, media, sample }) => ({
      title,
      media,
      subtitle: [sample ? 'Sample' : null, category, date ? new Date(date).toLocaleDateString() : 'No date']
        .filter(Boolean)
        .join(' · '),
    }),
  },
})

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', validation: (rule) => rule.required().max(90) }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: (rule) => rule.required() }),
    defineField({
      name: 'accent',
      title: 'Accent colour',
      type: 'string',
      options: { list: accentOptions, layout: 'radio' },
      initialValue: 'lavender',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'doodle',
      title: 'Doodle',
      type: 'string',
      options: { list: DOODLES },
      initialValue: 'paw',
    }),
    defineField({ name: 'cover', title: 'Cover image', type: 'arkaImage' }),
    defineField({ name: 'order', title: 'Order', type: 'number', initialValue: 10 }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'tagline', media: 'cover' } },
})

export const tag = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'string' }),
  ],
})

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'bio', title: 'Short bio', type: 'text', rows: 3 }),
    defineField({ name: 'avatar', title: 'Avatar', type: 'arkaImage' }),
    defineField({
      name: 'isCat',
      title: 'This author is a cat',
      type: 'boolean',
      description: 'Cats are credited on the page but never marked up as a "Person" for search engines.',
      initialValue: false,
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'avatar' } },
})
