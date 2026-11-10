import type { Metadata } from 'next'
import { exhibitLabel, ExhibitThumb, toExhibits } from '@/components/gallery/exhibits'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { EmptyState, PageHeader } from '@/components/story/archive'
import { getGallery } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'
import { pluralize } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'The Arka Files — evidence of mischief',
  description: 'Photographs and short clips of Arka the Persian cat, entered into evidence. Open any exhibit for a closer look.',
  path: '/gallery',
})

export default async function GalleryPage() {
  const exhibits = toExhibits(await getGallery())

  return (
    <>
      <PageHeader
        eyebrow={`The Arka Files · ${pluralize(exhibits.length, 'exhibit')}`}
        title={
          <>
            Evidence of <span className="text-lavender-ink italic">mischief.</span>
          </>
        }
        description="Photographs and clips, entered into the record. The suspect has declined to comment, and has also fallen asleep."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'The Arka Files', path: '/gallery' },
        ]}
      />
      <div className="shell py-12 sm:py-16">
        {exhibits.length ? (
          <GalleryGrid
            exhibits={exhibits}
            labels={exhibits.map(exhibitLabel)}
            thumbs={exhibits.map((exhibit) => (
              <ExhibitThumb
                key={exhibit.id}
                exhibit={exhibit}
                aspect={3 / 4}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
              />
            ))}
          />
        ) : (
          <EmptyState title="The evidence locker is empty.">
            Photos and clips added in the Studio (The Arka Files) will appear here, in the order you arrange them.
          </EmptyState>
        )}
      </div>
    </>
  )
}
