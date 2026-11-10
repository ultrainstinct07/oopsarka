import { ArrowRight } from 'lucide-react'
import { exhibitLabel, ExhibitThumb, toExhibits } from '@/components/gallery/exhibits'
import { ExhibitTrigger, LightboxProvider } from '@/components/gallery/lightbox'
import { Eyebrow, TornEdge } from '@/components/media/decor'
import { ButtonLink } from '@/components/ui/button-link'
import type { GalleryItem } from '@/lib/content/types'
import { cn } from '@/lib/utils'

const LAYOUT = [
  'lg:col-span-3 lg:mt-0 lg:-rotate-[1.5deg]',
  'lg:col-span-2 lg:mt-24 lg:rotate-[2deg]',
  'lg:col-span-3 lg:mt-6 lg:rotate-[1deg]',
  'lg:col-span-2 lg:mt-28 lg:-rotate-[2deg]',
  'lg:col-span-2 lg:mt-2 lg:rotate-[1.5deg]',
]

export function EvidencePreview({ items }: { items: GalleryItem[] }) {
  const exhibits = toExhibits(items)
  const shown = exhibits.slice(0, 5)
  if (!shown.length) return null

  return (
    <section aria-labelledby="evidence-title" className="relative overflow-hidden bg-bg-deep py-24 sm:py-32">
      <TornEdge side="top" />
      <TornEdge side="bottom" />
      <div className="shell">
        <header data-reveal className="max-w-2xl">
          <Eyebrow>The Arka Files</Eyebrow>
          <h2 id="evidence-title" className="mt-4 font-display text-display font-semibold">
            Evidence of <span className="text-lavender-ink italic">mischief.</span>
          </h2>
          <p className="mt-5 text-lede text-ink-muted">
            Photographs and clips, entered into the record. The suspect has declined to comment.
          </p>
        </header>

        <LightboxProvider items={exhibits}>
          <ul
            data-reveal-stagger="pop"
            className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-12 lg:gap-x-6"
          >
            {shown.map((exhibit, index) => (
              <li
                key={exhibit.id}
                className={cn(
                  'transition-[rotate,translate] duration-300 hover:-translate-y-1.5 lg:hover:rotate-0',
                  LAYOUT[index],
                  index === 4 && 'hidden sm:block',
                )}
              >
                <ExhibitTrigger index={index} label={exhibitLabel(exhibit)}>
                  <ExhibitThumb
                    exhibit={exhibit}
                    aspect={3 / 4}
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
                  />
                </ExhibitTrigger>
              </li>
            ))}
          </ul>
        </LightboxProvider>

        <div data-reveal className="mt-14 flex justify-center">
          <ButtonLink
            href="/gallery"
            variant="secondary"
            roll="Open the Arka Files"
            icon={<ArrowRight aria-hidden className="size-4" />}
          />
        </div>
      </div>
    </section>
  )
}
