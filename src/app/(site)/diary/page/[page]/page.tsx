import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DiaryArchive, diaryHref } from '@/components/story/diary-archive'
import { getAllPosts } from '@/lib/content'
import { parsePageParam } from '@/lib/content/pagination'
import { pageMetadata } from '@/lib/seo/metadata'
import { site } from '@/lib/site'

async function totalPages() {
  const posts = await getAllPosts()
  return Math.max(1, Math.ceil(posts.length / site.postsPerPage))
}

export async function generateStaticParams() {
  const total = await totalPages()
  const pages = Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ page: String(i + 2) }))
  // Cache Components needs at least one param; an out-of-range page simply 404s.
  return pages.length ? pages : [{ page: '2' }]
}

export async function generateMetadata({ params }: PageProps<'/diary/page/[page]'>): Promise<Metadata> {
  const page = parsePageParam((await params).page) ?? 2
  return pageMetadata({
    title: `Arka's Diary — page ${page}`,
    description: `Older stories from Arka's Diary, page ${page}.`,
    path: diaryHref(page),
  })
}

export default async function DiaryPaged({ params }: PageProps<'/diary/page/[page]'>) {
  const page = parsePageParam((await params).page)
  if (!page || page < 2 || page > (await totalPages())) notFound()
  return <DiaryArchive page={page} />
}
