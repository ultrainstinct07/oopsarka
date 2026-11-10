import { ArkaImage } from '@/components/media/arka-image'
import { ArkaVideo } from '@/components/media/arka-video'
import { imageUrl } from '@/components/media/image-url'
import type { GalleryItem } from '@/lib/content/types'
import { cn, exhibitLetter } from '@/lib/utils'
import type { Exhibit } from './types'

/** Server-side: turn gallery items into lightbox-ready exhibits (letters follow the order). */
export function toExhibits(items: GalleryItem[]): Exhibit[] {
  return items.map((item, index) => {
    const base = { id: item.id, letter: exhibitLetter(index), title: item.title, caption: item.caption, date: item.date }
    return item.kind === 'photo'
      ? { ...base, kind: 'photo', image: item.image }
      : { ...base, kind: 'video', video: item.video, posterSrc: imageUrl(item.video.poster, 720) }
  })
}

/** The framed thumbnail with its evidence tag. Videos loop silently when motion is allowed. */
export function ExhibitThumb({
  exhibit,
  sizes,
  aspect,
  className,
}: {
  exhibit: Exhibit
  sizes: string
  aspect?: number
  className?: string
}) {
  return (
    <figure className={cn('relative', className)}>
      <div className="relative rounded-print bg-frame p-1.5 shadow-print transition-transform duration-500 group-focus-within:-rotate-1 group-hover:-rotate-1">
        <div className="overflow-hidden rounded-[0.25rem]">
          {exhibit.kind === 'photo' ? (
            <ArkaImage
              image={exhibit.image}
              sizes={sizes}
              aspect={aspect}
              alt=""
              imgClassName="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
            />
          ) : (
            <ArkaVideo video={exhibit.video} posterSrc={exhibit.posterSrc} ambient playButton={false} aspect={aspect} />
          )}
        </div>
        <span className="absolute top-3 left-3 rounded-[0.3rem] bg-surface px-2 py-1 label text-[0.62rem] text-on-fill shadow-[var(--shadow-sticker)] dark:bg-frame">
          Exhibit {exhibit.letter}
          {exhibit.kind === 'video' ? ' · clip' : ''}
        </span>
      </div>
      <figcaption className="mt-3 px-1">
        <span className="block font-display text-lg leading-snug font-semibold">{exhibit.title}</span>
        {exhibit.caption ? <span className="mt-0.5 block text-sm text-ink-muted">{exhibit.caption}</span> : null}
      </figcaption>
    </figure>
  )
}

export function exhibitLabel(exhibit: Exhibit) {
  const what = exhibit.kind === 'photo' ? exhibit.image.alt : exhibit.video.description
  return `Open exhibit ${exhibit.letter}: ${exhibit.title}. ${what}`
}
