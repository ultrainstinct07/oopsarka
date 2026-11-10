import 'server-only'
import { getImageProps } from 'next/image'
import type { ArkaImage } from '@/lib/content/types'
import { sanityImageUrl } from '@/sanity/image'

/** A single optimised URL for an image at a given width (thumbnails, previews, feeds). */
export function imageUrl(image: ArkaImage, width: number, aspect?: number) {
  if (image.kind === 'sanity' && image.sanity) return sanityImageUrl(image.sanity, width, aspect)
  if (image.src.endsWith('.svg')) return image.src
  const { props } = getImageProps({
    src: image.src,
    alt: '',
    width,
    height: Math.round(width / (aspect ?? image.width / image.height)),
    quality: 75,
  })
  // For a fixed width, `src` is the 2x candidate; the first srcset entry is the requested (1x) width.
  return props.srcSet?.split(' ')[0] ?? props.src
}
