import type { MetadataRoute } from 'next'
import { getAllPosts, getCategories, getTagsWithCounts } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

/** Published content only (drafts never reach the content layer). Search, Studio and APIs are excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags] = await Promise.all([getAllPosts(), getCategories(), getTagsWithCounts()])
  const newest = posts[0] ? new Date(posts[0].updatedAt ?? posts[0].publishedAt) : undefined

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: newest, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/diary'), lastModified: newest, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/gallery'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/play'), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/categories'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/tags'), changeFrequency: 'monthly', priority: 0.3 },
    { url: absoluteUrl('/newsletter'), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/terms'), changeFrequency: 'yearly', priority: 0.2 },
  ]

  return [
    ...pages,
    ...posts.map((post) => ({
      url: absoluteUrl(`/diary/${post.slug}`),
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      lastModified: newest,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...tags.map(({ tag }) => ({ url: absoluteUrl(`/tags/${tag.slug}`), changeFrequency: 'monthly' as const, priority: 0.3 })),
  ]
}
