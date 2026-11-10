import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import { categoryHref, categoryPageCount, CategoryArchive } from '@/components/story/taxonomy-archive'
import { getCategories, getCategory } from '@/lib/content'
import { parsePageParam } from '@/lib/content/pagination'
import { pageMetadata } from '@/lib/seo/metadata'

export async function generateStaticParams() {
  const categories = await getCategories()
  const params: { slug: string; page: string }[] = []
  for (const category of categories) {
    const total = await categoryPageCount(category.slug)
    for (let page = 2; page <= total; page++) params.push({ slug: category.slug, page: String(page) })
  }
  // Cache Components needs at least one param; out-of-range pages 404.
  return params.length ? params : [{ slug: categories[0]?.slug ?? 'daily-diary', page: '2' }]
}

export async function generateMetadata({ params }: PageProps<'/category/[slug]/page/[page]'>): Promise<Metadata> {
  const { slug, page } = await params
  const category = await getCategory(slug)
  const n = parsePageParam(page) ?? 2
  if (!category) return { title: 'Category not found', robots: { index: false } }
  return pageMetadata({
    title: `${category.title} — page ${n}`,
    description: category.description,
    path: categoryHref(slug)(n),
  })
}

export default async function CategoryPaged({ params }: PageProps<'/category/[slug]/page/[page]'>) {
  const { slug, page } = await params
  const n = parsePageParam(page)
  if (!(await getCategory(slug)) || !n) notFound()
  if (n === 1) redirect(categoryHref(slug)(1) as Route)
  if (n > (await categoryPageCount(slug))) notFound()
  return <CategoryArchive slug={slug} page={n} />
}
