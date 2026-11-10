import { cacheLife, cacheTag } from 'next/cache'
import { imageUrl } from '@/components/media/image-url'
import { getAllPosts } from '@/lib/content'
import { buildRss } from '@/lib/seo/rss'
import { site } from '@/lib/site'

async function feed() {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')
  const posts = (await getAllPosts()).slice(0, 30)
  return buildRss({
    siteUrl: site.url,
    title: 'OopsArka — Arka’s Diary',
    description: site.description,
    posts,
    imageFor: (post) => new URL(imageUrl(post.cover, 1200), site.url).toString(),
  })
}

export async function GET() {
  return new Response(await feed(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  })
}
