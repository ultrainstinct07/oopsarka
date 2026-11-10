import type { Metadata } from 'next'
import { imageUrl } from '@/components/media/image-url'
import { Playroom } from '@/components/play/playroom'
import { PageHeader } from '@/components/story/archive'
import { getAllPosts } from '@/lib/content'
import { isLeaderboardConfigured } from '@/lib/integrations/config'
import type { Face } from '@/lib/play/pairs'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'The Playroom — mini games with Arka',
  description:
    'Three small games from the OopsArka case files: knock things off the table, match the evidence photos, and survive the 3 AM zoomies.',
  path: '/play',
})

// Used when there are fewer than six story covers to draw on.
const SPARE_FACES: Face[] = ['zoomies', 'boxes', 'houseplant', 'tables', 'toys', 'grooming'].map((name) => ({
  id: `illustration-${name}`,
  src: `/images/illustrations/${name}.svg`,
  label: `an illustration: ${name}`,
}))

/** Card faces for Paw Pairs: the story covers (photos and illustrations), each once. */
async function cardFaces(): Promise<Face[]> {
  const posts = await getAllPosts()
  const seen = new Set<string>()
  const faces: Face[] = []
  for (const post of posts) {
    if (seen.has(post.cover.src)) continue
    seen.add(post.cover.src)
    faces.push({ id: post.slug, src: imageUrl(post.cover, 320, 1), label: post.cover.alt })
  }
  for (const spare of SPARE_FACES) {
    if (faces.length >= 6) break
    if (!faces.some((face) => face.src === spare.src)) faces.push(spare)
  }
  return faces.slice(0, 6)
}

export default async function PlayPage() {
  const faces = await cardFaces()
  return (
    <>
      <PageHeader
        eyebrow="The playroom"
        title={
          <>
            Arka&apos;s playroom. <span className="text-lavender-ink italic">Mind the breakables.</span>
          </>
        }
        description="Three small games from the case files. Sound is off until you switch it on. No sign-up; your best scores stay in this browser."
        accent="lavender"
        crumbs={[{ name: 'Playroom', path: '/play' }]}
      />
      <div className="shell py-14 sm:py-20">
        <Playroom faces={faces} sharedBoard={isLeaderboardConfigured()} />
      </div>
    </>
  )
}
