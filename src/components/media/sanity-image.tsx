'use client'

import Image, { type ImageLoaderProps, type ImageProps } from 'next/image'
import type { SanityImageRef } from '@/lib/content/types'
import { sanityImageUrl } from '@/sanity/image'

type Props = Omit<ImageProps, 'src' | 'loader'> & { image: SanityImageRef; aspect?: number }

/** next/image backed by the Sanity CDN: AVIF/WebP, sized per breakpoint, crop + hotspot aware. */
export function SanityImage({ image, aspect, quality, alt, ...props }: Props) {
  const loader = ({ width, quality: q }: ImageLoaderProps) => sanityImageUrl(image, width, aspect, q ?? 75)
  return <Image {...props} alt={alt} quality={quality} loader={loader} src={image.asset._ref} />
}
