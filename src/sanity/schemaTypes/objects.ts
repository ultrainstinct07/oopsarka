import { defineField, defineType } from 'sanity'

const ACCENTS = [
  { title: 'Lavender', value: 'lavender' },
  { title: 'Butter', value: 'butter' },
  { title: 'Sage', value: 'sage' },
  { title: 'Rose', value: 'rose' },
  { title: 'Marmalade', value: 'marmalade' },
]

export const accentOptions = ACCENTS

/** Every image on the site: hotspot/crop for editorial crops, alt text is mandatory. */
export const arkaImage = defineType({
  name: 'arkaImage',
  title: 'Image',
  type: 'image',
  options: { hotspot: true, metadata: ['lqip', 'palette'] },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'Describe what is in the picture for someone who cannot see it, e.g. "Arka asleep on a black office chair". Required.',
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional, shown under the image.',
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'illustration',
      title: 'This is an illustration (not a photo of Arka)',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})

export const figure = defineType({
  name: 'figure',
  title: 'Photo',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'arkaImage', validation: (rule) => rule.required() }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'In the text column', value: 'inline' },
          { title: 'Wide', value: 'wide' },
        ],
        layout: 'radio',
      },
      initialValue: 'inline',
    }),
  ],
  preview: {
    select: { media: 'image', title: 'image.caption', subtitle: 'image.alt' },
    prepare: ({ media, title, subtitle }) => ({ media, title: title || 'Photo', subtitle }),
  },
})

export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Quote', type: 'text', rows: 2, validation: (rule) => rule.required().max(240) }),
    defineField({ name: 'attribution', title: 'Attribution', type: 'string' }),
  ],
  preview: { select: { title: 'text' }, prepare: ({ title }) => ({ title, subtitle: 'Pull quote' }) },
})

export const arkaNote = defineType({
  name: 'arkaNote',
  title: "Arka's note (handwritten aside)",
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Note',
      type: 'string',
      description: 'A short aside in Arka’s handwriting. Shown in the margin on wide screens.',
      validation: (rule) => rule.required().max(140),
    }),
  ],
  preview: { select: { title: 'text' }, prepare: ({ title }) => ({ title, subtitle: "Arka's note" }) },
})

export const careNote = defineType({
  name: 'careNote',
  title: 'Care note (ask your vet)',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'A note from the human' }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 4, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'title', subtitle: 'text' } },
})

export const humanNote = defineType({
  name: 'humanNote',
  title: "Human's own experience",
  type: 'object',
  description: 'Personal experience, kept separate from general guidance. Hidden on the site until filled in.',
  fields: [
    defineField({ name: 'prompt', title: 'What goes here', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'text', title: 'Your experience', type: 'text', rows: 5 }),
  ],
  preview: {
    select: { title: 'prompt', text: 'text' },
    prepare: ({ title, text }) => ({ title, subtitle: text ? 'Filled in' : 'Empty — hidden on the site' }),
  },
})

export const clip = defineType({
  name: 'clip',
  title: 'Video clip',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      title: 'Video (MP4)',
      type: 'file',
      options: { accept: 'video/mp4' },
      description: 'Short, muted clips work best. Clips never autoplay with sound.',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'poster', title: 'Poster frame', type: 'arkaImage', validation: (rule) => rule.required() }),
    defineField({
      name: 'description',
      title: 'What happens in the clip',
      type: 'string',
      description: 'Read by screen readers. Describe the action.',
      validation: (rule) => rule.required().max(240),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
  ],
  preview: { select: { title: 'caption', subtitle: 'description', media: 'poster' } },
})

export const embed = defineType({
  name: 'embed',
  title: 'YouTube / Vimeo embed',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            !value || /^(https:\/\/)(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(value)
              ? true
              : 'Only YouTube and Vimeo links are supported.',
          ),
    }),
    defineField({ name: 'title', title: 'Title (for screen readers)', type: 'string', validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'title', subtitle: 'url' } },
})

export const pawDivider = defineType({
  name: 'pawDivider',
  title: 'Paw divider',
  type: 'object',
  fields: [defineField({ name: 'style', type: 'string', hidden: true, initialValue: 'paw' })],
  preview: { prepare: () => ({ title: '· · · paw divider · · ·' }) },
})

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'title', title: 'SEO title', type: 'string', validation: (rule) => rule.max(70) }),
    defineField({ name: 'description', title: 'SEO description', type: 'text', rows: 3, validation: (rule) => rule.max(170) }),
    defineField({ name: 'ogImage', title: 'Social image', type: 'arkaImage' }),
  ],
})
