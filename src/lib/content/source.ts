import type { Category, GalleryItem, Post, PostSummary, Profile, Settings, Tag } from './types'

export interface SourceOptions {
  /** Draft Mode: include unpublished drafts and encode edit overlays. */
  preview: boolean
}

export interface SearchDocument {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  categorySlug: string
  tags: string
  text: string
  publishedAt: string
  readingMinutes: number
}

/**
 * Anything that can feed the site content. Implemented by the local fixtures and by Sanity.
 * Implementations return *published* content only, unless `preview` is set.
 */
export interface ContentSource {
  readonly name: 'local' | 'sanity'
  getPostSummaries(options: SourceOptions): Promise<PostSummary[]>
  getPost(slug: string, options: SourceOptions): Promise<Post | null>
  getSearchDocuments(options: SourceOptions): Promise<SearchDocument[]>
  getCategories(options: SourceOptions): Promise<Category[]>
  getTags(options: SourceOptions): Promise<Tag[]>
  getGallery(options: SourceOptions): Promise<GalleryItem[]>
  getProfile(options: SourceOptions): Promise<Profile>
  getSettings(options: SourceOptions): Promise<Settings>
}

export function isSanityConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim())
}

let cached: Promise<ContentSource> | undefined

export function getSource(): Promise<ContentSource> {
  cached ??= isSanityConfigured()
    ? import('./source-sanity').then((m) => m.sanitySource)
    : import('./source-local').then((m) => m.localSource)
  return cached
}
