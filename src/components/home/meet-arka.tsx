import { ArrowRight } from 'lucide-react'
import { ArkaImage } from '@/components/media/arka-image'
import { Annotation, CatEarFrame, Eyebrow, TornEdge } from '@/components/media/decor'
import { ButtonLink } from '@/components/ui/button-link'
import type { Profile } from '@/lib/content/types'
import { PersonnelFile } from './personnel-file'

export function MeetArka({ profile }: { profile: Profile }) {
  return (
    <section aria-labelledby="meet-title" className="grain relative overflow-hidden bg-lavender-soft py-24 sm:py-32">
      <TornEdge side="top" />
      <TornEdge side="bottom" />
      <div className="shell relative z-10 grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div data-reveal="pop" className="relative mx-auto w-full max-w-[24rem] pt-8 lg:col-span-5 lg:max-w-none lg:pr-8">
          <CatEarFrame tone="butter" rotate={2.5}>
            <ArkaImage
              image={profile.portrait}
              aspect={4 / 5}
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 24rem, 88vw"
              className="rounded-[0.25rem]"
            />
          </CatEarFrame>
          <Annotation arrow="up-left" angle={-3} className="absolute -right-2 -bottom-10 text-[1.3rem] sm:-right-14">
            the face of innocence (allegedly)
          </Annotation>
        </div>

        <div data-reveal-stagger className="lg:col-span-7">
          <Eyebrow>Meet the suspect</Eyebrow>
          <h2 id="meet-title" className="mt-5 font-display text-display font-semibold">
            Nice to meet you.
            <br />
            <span className="text-lavender-ink italic">I&apos;m the problem.</span>
          </h2>
          <p className="mt-7 max-w-[54ch] text-lede">{profile.intro}</p>
          <PersonnelFile profile={profile} className="mt-10 max-w-2xl" />
          <ButtonLink
            href="/about"
            className="mt-10"
            roll="Get to know Arka"
            icon={<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />}
          />
        </div>
      </div>
    </section>
  )
}
