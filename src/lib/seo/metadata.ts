import type { Metadata } from 'next'
import { site } from '@/lib/site'

interface PageMetaInput {
  title: string
  description: string
  /** Path on this site, e.g. "/diary". Canonical and og:url are built from it. */
  path: string
  type?: 'website' | 'article' | 'profile'
  /**
   * Social image. Defaults to the generated site image; `null` leaves it to a
   * file-based opengraph-image in the route (e.g. per-story cards).
   */
  image?: { url: string; width?: number; height?: number; alt?: string } | null
  noindex?: boolean
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  /** Set when the title shouldn't get the " · OopsArka" suffix. */
  absoluteTitle?: boolean
}

export const RSS_ALTERNATE = { 'application/rss+xml': [{ url: '/rss.xml', title: 'OopsArka — Arka’s Diary' }] }

const DEFAULT_IMAGE = {
  url: site.ogImagePath,
  width: 1200,
  height: 630,
  alt: 'Arka, a fluffy ginger Persian cat, under the words “Oops. Arka did it again.”',
}

export function pageMetadata(input: PageMetaInput): Metadata {
  const image = input.image === undefined ? DEFAULT_IMAGE : input.image
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path, types: RSS_ALTERNATE },
    openGraph: {
      type: input.type ?? 'website',
      url: input.path,
      siteName: site.name,
      locale: site.locale,
      title: input.title,
      description: input.description,
      ...(image ? { images: [image] } : {}),
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            section: input.section,
            tags: input.tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      ...(image ? { images: [image.url] } : {}),
    },
    robots: input.noindex ? { index: false, follow: true } : undefined,
  }
}
