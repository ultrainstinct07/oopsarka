import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TagArchive } from '@/components/story/taxonomy-archive'
import { getTag, getTagsWithCounts } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'

export async function generateStaticParams() {
  const tags = await getTagsWithCounts()
  return tags.length ? tags.map(({ tag }) => ({ slug: tag.slug })) : [{ slug: 'zoomies' }]
}

export async function generateMetadata({ params }: PageProps<'/tags/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTag(slug)
  if (!tag) return { title: 'Tag not found', robots: { index: false } }
  return pageMetadata({
    title: `#${tag.title}`,
    description: tag.description ?? `Stories tagged “${tag.title}” in Arka’s Diary.`,
    path: `/tags/${tag.slug}`,
  })
}

export default async function TagPage({ params }: PageProps<'/tags/[slug]'>) {
  const { slug } = await params
  if (!(await getTag(slug))) notFound()
  return <TagArchive slug={slug} page={1} />
}
