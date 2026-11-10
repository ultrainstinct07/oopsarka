import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import { tagHref, tagPageCount, TagArchive } from '@/components/story/taxonomy-archive'
import { getTag, getTagsWithCounts } from '@/lib/content'
import { parsePageParam } from '@/lib/content/pagination'
import { pageMetadata } from '@/lib/seo/metadata'

export async function generateStaticParams() {
  const tags = await getTagsWithCounts()
  const params: { slug: string; page: string }[] = []
  for (const { tag } of tags) {
    const total = await tagPageCount(tag.slug)
    for (let page = 2; page <= total; page++) params.push({ slug: tag.slug, page: String(page) })
  }
  return params.length ? params : [{ slug: tags[0]?.tag.slug ?? 'zoomies', page: '2' }]
}

export async function generateMetadata({ params }: PageProps<'/tags/[slug]/page/[page]'>): Promise<Metadata> {
  const { slug, page } = await params
  const tag = await getTag(slug)
  const n = parsePageParam(page) ?? 2
  if (!tag) return { title: 'Tag not found', robots: { index: false } }
  return pageMetadata({
    title: `#${tag.title} — page ${n}`,
    description: `Stories tagged “${tag.title}”, page ${n}.`,
    path: tagHref(slug)(n),
  })
}

export default async function TagPaged({ params }: PageProps<'/tags/[slug]/page/[page]'>) {
  const { slug, page } = await params
  const n = parsePageParam(page)
  if (!(await getTag(slug)) || !n) notFound()
  if (n === 1) redirect(tagHref(slug)(1) as Route)
  if (n > (await tagPageCount(slug))) notFound()
  return <TagArchive slug={slug} page={n} />
}
