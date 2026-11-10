import type { Author, Post, PostSummary } from '@/lib/content/types'
import { absoluteUrl, site } from '@/lib/site'

const ORGANIZATION_ID = `${site.url}/#organization`
const WEBSITE_ID = `${site.url}/#website`

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.name,
    url: site.url,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png'), width: 512, height: 512 },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(),
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: site.url,
        name: site.name,
        description: site.description,
        inLanguage: 'en',
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  }
}

/**
 * Cats are credited on the page, but structured data only describes real people.
 * A named human author becomes a Person; otherwise the publication is the author.
 */
function authorNode(author: Author) {
  if (!author.isCat && author.name && author.name !== "Arka's human") {
    return { '@type': 'Person', name: author.name }
  }
  return { '@id': ORGANIZATION_ID }
}

export function blogJsonLd(posts: PostSummary[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${site.url}/diary#blog`,
    url: absoluteUrl('/diary'),
    name: "Arka's Diary",
    description: site.description,
    publisher: { '@id': ORGANIZATION_ID },
    blogPost: posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: absoluteUrl(`/diary/${post.slug}`),
      datePublished: post.publishedAt,
    })),
  }
}

export function blogPostingJsonLd(post: Post, imageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(`/diary/${post.slug}`)}#article`,
    mainEntityOfPage: absoluteUrl(`/diary/${post.slug}`),
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: authorNode(post.author),
    publisher: organization(),
    articleSection: post.category.title,
    keywords: post.tags.map((tag) => tag.title).join(', ') || undefined,
    wordCount: post.plainText.split(/\s+/).filter(Boolean).length,
    inLanguage: 'en',
    isPartOf: { '@id': `${site.url}/diary#blog` },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
