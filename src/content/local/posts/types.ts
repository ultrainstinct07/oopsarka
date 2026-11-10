import type { ArkaImage, BodyBlock } from '@/lib/content/types'

export interface LocalPost {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  author: 'arka' | 'human'
  publishedAt: string
  updatedAt?: string
  cover: ArkaImage
  featured?: boolean
  /** Starter content written to show the site off. Displayed with a "Sample" label until edited. */
  sample: boolean
  body: BodyBlock[]
  seo?: { title?: string; description?: string }
}
