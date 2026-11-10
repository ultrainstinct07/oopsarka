import type { SchemaTypeDefinition } from 'sanity'
import { body } from './body'
import { author, category, post, tag } from './documents'
import { arkaImage, arkaNote, careNote, clip, embed, figure, humanNote, pawDivider, pullQuote, seo } from './objects'
import { gallery, profile, siteSettings } from './singletons'

export const singletonTypes = new Set(['profile', 'gallery', 'siteSettings'])

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  post,
  category,
  tag,
  author,
  // singletons
  profile,
  gallery,
  siteSettings,
  // objects
  body,
  arkaImage,
  figure,
  pullQuote,
  arkaNote,
  careNote,
  humanNote,
  clip,
  embed,
  pawDivider,
  seo,
]
