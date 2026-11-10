import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryArchive } from '@/components/story/taxonomy-archive'
import { getCategories, getCategory } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.length ? categories.map((category) => ({ slug: category.slug })) : [{ slug: 'daily-diary' }]
}

export async function generateMetadata({ params }: PageProps<'/category/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return { title: 'Category not found', robots: { index: false } }
  return pageMetadata({
    title: `${category.title} — ${category.tagline.replace(/\.$/, '')}`,
    description: category.description,
    path: `/category/${category.slug}`,
  })
}

export default async function CategoryPage({ params }: PageProps<'/category/[slug]'>) {
  const { slug } = await params
  if (!(await getCategory(slug))) notFound()
  return <CategoryArchive slug={slug} page={1} />
}
