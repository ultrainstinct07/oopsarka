import { cacheLife, cacheTag } from 'next/cache'
import { getAllPosts, getSearchIndexJson } from '@/lib/content'
import type { SearchHit } from '@/lib/content/search'

/** The serialized MiniSearch index plus a few recent stories, for the ⌘K dialog. */
async function payload() {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')
  const [index, posts] = await Promise.all([getSearchIndexJson(), getAllPosts()])
  const recent: SearchHit[] = posts.slice(0, 5).map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category.title,
    categorySlug: post.category.slug,
    publishedAt: post.publishedAt,
    readingMinutes: post.readingMinutes,
    score: 0,
    terms: [],
  }))
  return JSON.stringify({ index, recent })
}

export async function GET() {
  return new Response(await payload(), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
  })
}
