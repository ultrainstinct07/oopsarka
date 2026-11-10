import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageRef } from '@/lib/content/types'
import { dataset, projectIdOrPlaceholder } from './env'

const builder = createImageUrlBuilder({ projectId: projectIdOrPlaceholder, dataset })

/**
 * Sanity CDN URL for a given rendered width. Passing the full image object plus
 * width *and* height lets the builder apply the editor's crop and hotspot.
 */
export function sanityImageUrl(image: SanityImageRef, width: number, aspect?: number, quality = 75) {
  let url = builder.image(image).width(Math.round(width)).quality(quality).auto('format')
  if (aspect) url = url.height(Math.round(width / aspect)).fit('crop')
  return url.url()
}
