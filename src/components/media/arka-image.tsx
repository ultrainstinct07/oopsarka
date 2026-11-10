import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { ArkaImage as ArkaImageData } from '@/lib/content/types'
import { cn } from '@/lib/utils'
import { SanityImage } from './sanity-image'

interface ArkaImageProps {
  image: ArkaImageData
  /** Responsive `sizes` — required, so the browser never downloads more than it needs. */
  sizes: string
  /** Crop to this aspect ratio (width / height). Defaults to the image's own ratio. */
  aspect?: number
  className?: string
  imgClassName?: string
  /** Preload in <head> — only for the LCP image. */
  preload?: boolean
  quality?: number
  /** Override alt (e.g. empty for decorative duplicates). */
  alt?: string
  style?: CSSProperties
}

/**
 * The single image component for the site. Reserves space with aspect-ratio (no CLS),
 * shows the blur placeholder, and keeps Arka's face in frame using the focal point.
 */
export function ArkaImage({ image, sizes, aspect, className, imgClassName, preload, quality, alt, style }: ArkaImageProps) {
  const ratio = aspect ?? image.width / image.height
  const objectPosition = image.focal ? `${(image.focal.x * 100).toFixed(1)}% ${(image.focal.y * 100).toFixed(1)}%` : undefined
  const common = {
    alt: alt ?? image.alt,
    fill: true,
    sizes,
    quality,
    preload,
    fetchPriority: preload ? ('high' as const) : undefined,
    placeholder: image.lqip ? ('blur' as const) : ('empty' as const),
    blurDataURL: image.lqip,
    className: cn('object-cover', imgClassName),
    style: objectPosition ? { objectPosition } : undefined,
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio: String(ratio), backgroundColor: image.dominant ?? 'var(--bg-deep)', ...style }}
    >
      {image.kind === 'sanity' && image.sanity ? (
        <SanityImage {...common} alt={common.alt} image={image.sanity} aspect={aspect} />
      ) : (
        <Image {...common} alt={common.alt} src={image.src} unoptimized={image.src.endsWith('.svg') || undefined} />
      )}
    </div>
  )
}
