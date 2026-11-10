import { ArrowRight, Search } from 'lucide-react'
import { ArkaImage } from '@/components/media/arka-image'
import { Annotation, CatEarFrame, Eyebrow } from '@/components/media/decor'
import { photo } from '@/content/local/media'
import { ButtonLink } from '@/components/ui/button-link'

/** "This page has been knocked off the table." */
export function NotFoundView() {
  return (
    <section className="shell grid gap-14 py-16 sm:py-24 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        <Eyebrow>Error 404 · Missing page</Eyebrow>
        <h1 className="mt-5 font-display text-display font-semibold">
          This page has been <span className="text-lavender-ink italic">knocked off</span> the table.
        </h1>
        <p className="mt-6 max-w-[48ch] text-lede text-ink-muted">
          It was here a moment ago. Arka was last seen nearby, looking innocent. Try the diary, or search for what you were after.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/" roll="Back to the homepage" icon={<ArrowRight aria-hidden className="size-4" />} />
          <ButtonLink href="/search" variant="secondary">
            <Search aria-hidden className="size-4" /> Search the diary
          </ButtonLink>
          <ButtonLink href="/play" variant="ghost">
            Or play a game instead
          </ButtonLink>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-[20rem] pt-8 lg:col-span-4 lg:col-start-9">
        <CatEarFrame tone="rose" rotate={3}>
          <ArkaImage image={photo('blanket-lookup')} aspect={4 / 5} sizes="20rem" className="rounded-[0.25rem]" />
        </CatEarFrame>
        <Annotation arrow="up-left" className="absolute -bottom-12 left-0 text-[1.25rem]">
          “I have no idea where it went.”
        </Annotation>
      </div>
    </section>
  )
}
