import 'server-only'
import { guides } from '@/content/local/posts/guides'
import { stories } from '@/content/local/posts/stories'
import type { LocalPost } from '@/content/local/posts/types'
import { gallery, profile, settings } from '@/content/local/singletons'
import { authorBySlug, categories, categoryBySlug, tagBySlug, tags } from '@/content/local/taxonomy'
import { buildToc, readingMinutes, toPlainText } from './pt'
import type { ContentSource, SearchDocument } from './source'
import type { Post, PostSummary } from './types'

const localPosts: LocalPost[] = [...stories, ...guides]

function toPost(input: LocalPost): Post {
  const plainText = toPlainText(input.body)
  return {
    id: `post.${input.slug}`,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    category: categoryBySlug(input.category),
    tags: input.tags.map(tagBySlug),
    author: authorBySlug(input.author),
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt,
    cover: input.cover,
    featured: Boolean(input.featured),
    sample: input.sample,
    readingMinutes: readingMinutes(plainText),
    body: input.body,
    toc: buildToc(input.body),
    plainText,
    seo: input.seo,
  }
}

const posts = localPosts.map(toPost)

function summary(post: Post): PostSummary {
  const { body: _body, toc: _toc, plainText: _plainText, seo: _seo, ...rest } = post
  return rest
}

export const localSource: ContentSource = {
  name: 'local',
  async getPostSummaries() {
    return posts.map(summary)
  },
  async getPost(slug) {
    return posts.find((post) => post.slug === slug) ?? null
  },
  async getSearchDocuments() {
    return posts.map((post): SearchDocument => ({
      id: post.slug,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category.title,
      categorySlug: post.category.slug,
      tags: post.tags.map((tag) => tag.title).join(' '),
      text: post.plainText,
      publishedAt: post.publishedAt,
      readingMinutes: post.readingMinutes,
    }))
  },
  async getCategories() {
    return categories
  },
  async getTags() {
    return tags
  },
  async getGallery() {
    return gallery
  },
  async getProfile() {
    return profile
  },
  async getSettings() {
    return settings
  },
}

/** Exposed for the Sanity seed script and tests. */
export const localData = { posts, localPosts, categories, tags, gallery, profile, settings }
