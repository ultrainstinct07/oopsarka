import { ArrowRight, BookOpen, Camera, Mail, Scissors, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableBody } from '@/components/article/portable-body'
import { PersonnelFile } from '@/components/home/personnel-file'
import { ArkaImage } from '@/components/media/arka-image'
import { Annotation, CatEarFrame, Eyebrow, Sticker } from '@/components/media/decor'
import { Breadcrumbs } from '@/components/story/archive'
import { ButtonLink } from '@/components/ui/button-link'
import { getGallery, getProfile, getSettings } from '@/lib/content'
import type { Accent } from '@/lib/content/types'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'About Arka — meet the cat behind the chaos',
  description:
    'Meet Arka: a fluffy Persian cat, Chief Mischief Officer, and the author (allegedly) of OopsArka. Plus a word from his human.',
  path: '/about',
  type: 'profile',
})

const EXPECT = [
  {
    icon: BookOpen,
    title: 'The diary',
    text: 'Everyday life, told by the cat himself. Naps, patrols, negotiations.',
    href: '/diary',
  },
  {
    icon: Zap,
    title: 'Oops moments',
    text: 'An honest record of incidents. Gravity is tested regularly.',
    href: '/category/oops-moments',
  },
  {
    icon: Scissors,
    title: 'Persian life',
    text: 'Gentle, practical notes on grooming, coats and calm routines — vet first, always.',
    href: '/category/persian-life',
  },
  { icon: Camera, title: 'The Arka Files', text: 'Photographs and clips, entered into evidence.', href: '/gallery' },
] as const

const TRAIT_TONES: Accent[] = ['lavender', 'butter', 'sage', 'rose', 'marmalade']

export default async function AboutPage() {
  const [profile, settings, gallery] = await Promise.all([getProfile(), getSettings(), getGallery()])
  const extraPhoto = gallery.find(
    (item) => item.kind === 'photo' && item.image.src !== profile.portrait.src && item.image.src !== settings.heroImage.src,
  )

  return (
    <>
      <section className="grain relative overflow-hidden bg-lavender-soft pt-8 pb-24 sm:pb-32">
        <div className="shell relative z-10">
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'About Arka', path: '/about' },
            ]}
          />
          <div className="mt-12 grid gap-16 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Eyebrow>About Arka</Eyebrow>
              <h1 className="mt-5 font-display text-hero font-semibold">
                Meet the cat <span className="text-lavender-ink italic">behind</span> the chaos.
              </h1>
              <p className="mt-8 max-w-[52ch] text-lede">{profile.intro}</p>
            </div>
            <div className="relative mx-auto w-full max-w-[24rem] pt-8 lg:col-span-5 lg:max-w-none">
              <CatEarFrame tone="butter" rotate={2}>
                <ArkaImage
                  image={profile.portrait}
                  aspect={4 / 5}
                  preload
                  sizes="(min-width: 1024px) 34vw, 24rem"
                  className="rounded-[0.25rem]"
                />
              </CatEarFrame>
              <Annotation arrow="up-left" className="absolute -bottom-12 left-6 text-[1.3rem]">
                official portrait. very serious.
              </Annotation>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="own-words" className="shell py-20 sm:py-28">
        <h2 id="own-words" className="text-center font-display text-headline font-semibold">
          In his own <span className="text-lavender-ink italic">words</span>
        </h2>
        <PortableBody value={profile.aboutBody} toc={[]} className="mt-10" />
      </section>

      <section aria-labelledby="personality" className="border-y border-line bg-bg-deep py-20 sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Personality</Eyebrow>
            <h2 id="personality" className="mt-4 font-display text-display font-semibold">
              Small cat. <span className="text-lavender-ink italic">Large opinions.</span>
            </h2>
            <ul className="mt-8 flex flex-wrap gap-3">
              {profile.traits.map((trait, index) => (
                <li key={trait}>
                  <Sticker
                    tone={TRAIT_TONES[index % TRAIT_TONES.length]}
                    angle={index % 2 ? 2 : -2}
                    className="px-4 py-2 text-[0.72rem]"
                  >
                    {trait}
                  </Sticker>
                </li>
              ))}
            </ul>
          </div>
          <PersonnelFile profile={profile} />
        </div>
      </section>

      <section aria-labelledby="why" className="shell grid gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <Eyebrow>Why this blog exists</Eyebrow>
          <h2 id="why" className="mt-4 font-display text-headline font-semibold">
            The small moments deserve to be <span className="marker">written down.</span>
          </h2>
          <p className="mt-6 max-w-[58ch] text-lede text-ink-muted">{settings.human.whyThisBlog}</p>
        </div>
        {extraPhoto?.kind === 'photo' ? (
          <div className="mx-auto w-full max-w-[20rem] lg:col-span-4 lg:col-start-9">
            <div className="rotate-[-3deg] rounded-print bg-frame p-2 shadow-print">
              <ArkaImage image={extraPhoto.image} aspect={4 / 5} sizes="20rem" className="rounded-[0.25rem]" />
            </div>
            {extraPhoto.caption ? <p className="hand mt-4 text-center text-lg text-ink-muted">{extraPhoto.caption}</p> : null}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="expect" className="shell pb-20 sm:pb-28">
        <h2 id="expect" className="font-display text-headline font-semibold">
          What to expect
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXPECT.map(({ icon: Icon, title, text, href }) => (
            <li key={title}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-[1.5rem] border border-line-strong bg-surface p-6 transition-colors hover:bg-lavender-soft"
              >
                <Icon aria-hidden className="size-6 text-lavender-ink" />
                <span className="mt-5 font-display text-xl font-semibold">{title}</span>
                <span className="mt-2 text-ink-muted">{text}</span>
                <span aria-hidden className="mt-auto pt-5">
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="human" className="grain relative overflow-hidden bg-butter-soft py-20 sm:py-28">
        <div className="shell relative z-10 max-w-3xl text-center">
          <Eyebrow className="justify-center">Meet the human</Eyebrow>
          <h2 id="human" className="mt-4 font-display text-headline font-semibold">
            {settings.human.name ? settings.human.name : 'Arka’s human'}
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lede text-ink-muted">{settings.human.intro}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/diary" roll="Read the diary" icon={<ArrowRight aria-hidden className="size-4" />} />
            <ButtonLink href="/contact" variant="secondary">
              <Mail aria-hidden className="size-4" /> Say hello
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
