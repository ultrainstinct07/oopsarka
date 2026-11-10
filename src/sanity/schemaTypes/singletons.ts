import { CogIcon } from '@sanity/icons/Cog'
import { ImagesIcon } from '@sanity/icons/Images'
import { StarIcon } from '@sanity/icons/Star'
import { defineArrayMember, defineField, defineType } from 'sanity'

const TO_BE_FILLED = 'Leave empty to show "to be filled in by Arka’s human".'

export const profile = defineType({
  name: 'profile',
  title: "Arka's profile",
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', initialValue: 'Arka', validation: (rule) => rule.required() }),
    defineField({ name: 'species', title: 'Species', type: 'string', initialValue: 'Cat' }),
    defineField({ name: 'breed', title: 'Breed', type: 'string', initialValue: 'Persian' }),
    defineField({ name: 'jobTitle', title: 'Job title', type: 'string', initialValue: 'Chief Mischief Officer' }),
    defineField({ name: 'specialSkill', title: 'Special skill', type: 'string' }),
    defineField({ name: 'coat', title: 'Coat', type: 'string' }),
    defineField({ name: 'eyes', title: 'Eyes', type: 'string' }),
    defineField({ name: 'favoriteActivity', title: 'Favourite activity', type: 'string', description: TO_BE_FILLED }),
    defineField({ name: 'favoriteSnack', title: 'Favourite snack', type: 'string', description: TO_BE_FILLED }),
    defineField({ name: 'currentObsession', title: 'Current obsession', type: 'string', description: TO_BE_FILLED }),
    defineField({
      name: 'traits',
      title: 'Personality strip',
      type: 'array',
      description: 'The labels on the caution-tape strip on the homepage.',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.min(3).max(10),
    }),
    defineField({ name: 'intro', title: 'Short introduction (homepage)', type: 'text', rows: 4 }),
    defineField({ name: 'portrait', title: 'Portrait', type: 'arkaImage', validation: (rule) => rule.required() }),
    defineField({ name: 'aboutBody', title: 'About page story', type: 'body' }),
  ],
  preview: { prepare: () => ({ title: "Arka's profile" }) },
})

const galleryFields = [
  defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required().max(80) }),
  defineField({ name: 'caption', title: 'Caption', type: 'string', validation: (rule) => rule.max(200) }),
  defineField({
    name: 'date',
    title: 'Date taken',
    type: 'date',
    description: 'Optional. Leave empty if you are not sure — the site never guesses.',
  }),
]

export const gallery = defineType({
  name: 'gallery',
  title: 'The Arka Files (gallery)',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Exhibits',
      description: 'Drag to reorder. Exhibit letters (A, B, C…) follow this order.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'galleryPhoto',
          title: 'Photo',
          type: 'object',
          fields: [
            ...galleryFields,
            defineField({ name: 'image', title: 'Photo', type: 'arkaImage', validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: 'title', subtitle: 'caption', media: 'image' } },
        }),
        defineArrayMember({
          name: 'galleryVideo',
          title: 'Video',
          type: 'object',
          fields: [
            ...galleryFields,
            defineField({
              name: 'video',
              title: 'Video (MP4)',
              type: 'file',
              options: { accept: 'video/mp4' },
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'poster', title: 'Poster frame', type: 'arkaImage', validation: (rule) => rule.required() }),
            defineField({
              name: 'description',
              title: 'What happens in the clip',
              type: 'string',
              validation: (rule) => rule.required().max(240),
            }),
          ],
          preview: {
            select: { title: 'title', media: 'poster' },
            prepare: ({ title, media }) => ({ title, media, subtitle: 'Video' }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'The Arka Files' }) },
})

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Homepage hero portrait',
      type: 'arkaImage',
      description: 'Portrait works best (4:5). Set the hotspot on Arka’s face.',
    }),
    defineField({ name: 'newsletterImage', title: 'Newsletter section photo', type: 'arkaImage' }),
    defineField({
      name: 'socials',
      title: 'Social profiles',
      type: 'array',
      description: 'Only profiles added here appear on the site.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'social',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: { list: ['instagram', 'youtube', 'tiktok', 'x', 'threads', 'bluesky', 'facebook', 'pinterest'] },
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'url', type: 'url', validation: (rule) => rule.required().uri({ scheme: ['https'] }) }),
            defineField({ name: 'handle', type: 'string' }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({ name: 'humanName', title: "Arka's human — name (optional)", type: 'string' }),
    defineField({ name: 'humanIntro', title: "Arka's human — introduction", type: 'text', rows: 4 }),
    defineField({ name: 'whyThisBlog', title: 'Why this blog exists', type: 'text', rows: 4 }),
    defineField({ name: 'contactIntro', title: 'Contact page introduction', type: 'text', rows: 3 }),
    defineField({ name: 'newsletterPitch', title: 'Newsletter pitch', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
