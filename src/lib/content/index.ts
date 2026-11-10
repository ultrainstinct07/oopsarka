import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { draftMode } from 'next/headers'
import { buildSearchIndex, loadSearchIndex, runSearch } from './search'
import { getSource, type SourceOptions } from './source'
import type { Category, Post, PostSummary, Tag } from './types'

/**
 * The content facade. Every read is cached (`'use cache'`) and tagged so a Sanity
 * webhook can refresh exactly what changed; Draft Mode bypasses the cache
 * automatically and switches the source into preview.
 */

export const GUIDE_CATEGORY = 'persian-life'

async function sourceOptions(): Promise<SourceOptions> {
  const { isEnabled } = await draftMode()
  return { preview: isEnabled }
}

const byNewest = (a: PostSummary, b: PostSummary) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)

function isLive(post: Pick<PostSummary, 'publishedAt'>, options: SourceOptions, now: number) {
  return options.preview || Date.parse(post.publishedAt) <= now
}

/* ── Posts ───────────────────────────────────────────────────── */

export async function getAllPosts(): Promise<PostSummary[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')
  const options = await sourceOptions()
  const source = await getSource()
  const now = Date.now()
  const posts = await source.getPostSummaries(options)
  return posts.filter((post) => isLive(post, options, now)).sort(byNewest)
}

export async function getPost(slug: string): Promise<Post | null> {
  'use cache'
  cacheLife('hours')
  cacheTag('posts', `post:${slug}`)
  const options = await sourceOptions()
  const source = await getSource()
  const post = await source.getPost(slug, options)
  if (!post || !isLive(post, options, Date.now())) return null
  return post
}

/** Homepage "Fresh out of trouble": stories only (guides get their own section). */
export async function getLatestStories(limit = 6) {
  const posts = (await getAllPosts()).filter((post) => post.category.slug !== GUIDE_CATEGORY)
  const featured = posts.find((post) => post.featured) ?? posts[0]
  const rest = posts.filter((post) => post.slug !== featured?.slug)
  return { featured, rest: rest.slice(0, Math.max(0, limit - 1)) }
}

export async function getGuides() {
  return (await getAllPosts()).filter((post) => post.category.slug === GUIDE_CATEGORY)
}

export async function getPostsByCategory(slug: string) {
  return (await getAllPosts()).filter((post) => post.category.slug === slug)
}

export async function getPostsByTag(slug: string) {
  return (await getAllPosts()).filter((post) => post.tags.some((tag) => tag.slug === slug))
}

/** Chronological neighbours: `newer` is the next story forward in time. */
export async function getAdjacentPosts(slug: string) {
  const posts = await getAllPosts()
  const index = posts.findIndex((post) => post.slug === slug)
  if (index === -1) return { newer: undefined, older: undefined }
  return { newer: posts[index - 1], older: posts[index + 1] }
}

/** Same category first, then shared tags, then recency. */
export async function getRelatedPosts(slug: string, limit = 3) {
  const posts = await getAllPosts()
  const current = posts.find((post) => post.slug === slug)
  if (!current) return []
  const tagSet = new Set(current.tags.map((tag) => tag.slug))
  return posts
    .filter((post) => post.slug !== slug)
    .map((post) => ({
      post,
      score: (post.category.slug === current.category.slug ? 3 : 0) + post.tags.filter((tag) => tagSet.has(tag.slug)).length * 2,
    }))
    .sort((a, b) => b.score - a.score || byNewest(a.post, b.post))
    .slice(0, limit)
    .map(({ post }) => post)
}

/* ── Taxonomy ────────────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('categories')
  const source = await getSource()
  const categories = await source.getCategories(await sourceOptions())
  return [...categories].sort((a, b) => a.order - b.order)
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((category) => category.slug === slug)
}

export async function getCategoriesWithCounts() {
  const [categories, posts] = await Promise.all([getCategories(), getAllPosts()])
  return categories.map((category) => {
    const inCategory = posts.filter((post) => post.category.slug === category.slug)
    return { category, count: inCategory.length, latest: inCategory[0] }
  })
}

export async function getTags(): Promise<Tag[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('tags')
  const source = await getSource()
  return source.getTags(await sourceOptions())
}

export async function getTag(slug: string) {
  return (await getTags()).find((tag) => tag.slug === slug)
}

/** Tags that actually appear on at least one live post, most used first. */
export async function getTagsWithCounts() {
  const [tags, posts] = await Promise.all([getTags(), getAllPosts()])
  return tags
    .map((tag) => ({ tag, count: posts.filter((post) => post.tags.some((t) => t.slug === tag.slug)).length }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count || a.tag.title.localeCompare(b.tag.title))
}

/* ── Singletons ──────────────────────────────────────────────── */

export async function getGallery() {
  'use cache'
  cacheLife('hours')
  cacheTag('gallery')
  const source = await getSource()
  return source.getGallery(await sourceOptions())
}

export async function getProfile() {
  'use cache'
  cacheLife('hours')
  cacheTag('profile')
  const source = await getSource()
  return source.getProfile(await sourceOptions())
}

export async function getSettings() {
  'use cache'
  cacheLife('hours')
  cacheTag('settings')
  const source = await getSource()
  return source.getSettings(await sourceOptions())
}

/* ── Search ──────────────────────────────────────────────────── */

/** Serialized MiniSearch index, served to the ⌘K dialog from /search-index.json. */
export async function getSearchIndexJson(): Promise<string> {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')
  const options = await sourceOptions()
  const source = await getSource()
  const now = Date.now()
  const documents = (await source.getSearchDocuments(options)).filter((doc) => isLive(doc, options, now))
  return JSON.stringify(buildSearchIndex(documents))
}

let loaded: { json: string; index: ReturnType<typeof loadSearchIndex> } | undefined

export async function searchPosts(query: string, categorySlug?: string) {
  const json = await getSearchIndexJson()
  if (loaded?.json !== json) loaded = { json, index: loadSearchIndex(json) }
  return runSearch(loaded.index, query, { categorySlug })
}

/* ── Misc ────────────────────────────────────────────────────── */

export async function getCopyrightYear() {
  'use cache'
  cacheLife('days')
  return new Date().getUTCFullYear()
}
