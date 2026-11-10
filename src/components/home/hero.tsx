import type { Route } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MagneticSticker, OopsBadge } from '@/components/fx/magnetic'
import { YarnBall } from '@/components/fx/yarn/yarn-ball'
import { ArkaImage } from '@/components/media/arka-image'
import { Annotation, CatEarFrame, Eyebrow, Sticker } from '@/components/media/decor'
import { PawIcon, PawTrail, Sparkle } from '@/components/media/doodles'
import { Runner } from '@/components/play/art'
import { ButtonLink } from '@/components/ui/button-link'
import type { ArkaImage as ArkaImageData } from '@/lib/content/types'

function Word({ children, i, className }: { children: React.ReactNode; i: number; className?: string }) {
  return (
    <span className={`w ${className ?? ''}`} style={{ ['--i' as string]: i }}>
      {children}
    </span>
  )
}

/** The thread from the yarn ball, underlining "again." */
function ThreadUnderline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 40"
      preserveAspectRatio="none"
      className="draw-on-load absolute -bottom-[0.14em] left-[-0.04em] h-[0.28em] w-[104%] overflow-visible text-lavender-ink"
    >
      <path
        d="M4 24c40-14 76 12 116-2s70-14 104-4 52 8 70-6c8-6 14-2 18 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        style={{ ['--len' as string]: 360 }}
      />
    </svg>
  )
}

export function Hero({ portrait, latestHref }: { portrait: ArkaImageData; latestHref: Route }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-x-clip">
      <div className="shell grid gap-12 pt-6 pb-20 sm:pt-10 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-8 lg:pb-28">
        <div className="relative z-10 lg:col-span-7 xl:col-span-7">
          <Eyebrow className="rise-in">The internet is now 1 cat more chaotic</Eyebrow>
          <h1 id="hero-title" className="mt-6 font-display text-hero font-semibold">
            <span className="settle-words block">
              <Word i={0} className="text-lavender-ink italic">
                Oops.
              </Word>
            </span>
            <span className="settle-words block">
              <Word i={1}>Arka</Word> <Word i={2}>did</Word>
            </span>
            <span className="settle-words block">
              <Word i={3}>it</Word>{' '}
              <Word i={4} className="relative">
                again.
                <ThreadUnderline />
              </Word>
            </span>
          </h1>
          <p className="rise-in mt-8 max-w-[36ch] text-lede text-ink-muted [--d:380ms]">
            Tiny paws. Fluffy cheeks. Questionable decisions. Welcome to the wonderfully chaotic life of a Persian cat.
          </p>
          <div className="rise-in mt-9 flex flex-wrap items-center gap-3 [--d:480ms]">
            <ButtonLink
              href="/diary"
              roll="Enter Arka's world"
              icon={<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />}
            />
            <ButtonLink href={latestHref} variant="secondary">
              Read the latest oops
            </ButtonLink>
          </div>

          {/* The mini games, announced where people land */}
          <Link
            href="/play"
            className="rise-in press group mt-7 inline-flex max-w-full items-center gap-3 rounded-pill border-2 border-ink bg-lavender-soft py-1.5 pr-5 pl-1.5 transition-[translate,box-shadow] duration-300 [--d:580ms] hover:-translate-y-0.5 hover:shadow-print"
          >
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink bg-[#161d36]"
            >
              <Runner
                pose="jump"
                className="w-10 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-6"
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block label text-[0.62rem] text-lavender-ink">The Playroom</span>
              <span className="block font-semibold">Three mini games starring Arka. Beat the high score.</span>
            </span>
            <ArrowRight aria-hidden className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[25rem] pt-10 sm:max-w-[28rem] lg:col-span-5 lg:max-w-none lg:pt-0 lg:pl-4 xl:pl-10">
          {/* Transform-only entrance: the photo is painted from the first frame, so LCP isn't delayed. */}
          <div className="drop-in">
            <CatEarFrame rotate={-2.5} tone="lavender" className="float-soft" printClassName="p-2.5 sm:p-3">
              <ArkaImage
                image={portrait}
                aspect={4 / 5}
                preload
                quality={75}
                sizes="(min-width: 1280px) 34vw, (min-width: 1024px) 38vw, (min-width: 640px) 28rem, 92vw"
                className="rounded-[0.25rem]"
              />
            </CatEarFrame>
          </div>

          {/* Annotations — decorative; the same jokes are in the copy and the alt text. */}
          <MagneticSticker className="pop-in absolute top-[10%] -left-3 z-20 [--d:900ms] sm:-left-10 lg:top-[30%] lg:-left-[52%] xl:-left-[46%]">
            <Annotation arrow="down-right" className="hidden text-[1.35rem] lg:inline-flex" arrowClassName="translate-y-7">
              professional troublemaker
            </Annotation>
            <Sticker angle={-5} className="text-[0.72rem] lg:hidden">
              Professional troublemaker
            </Sticker>
          </MagneticSticker>
          <MagneticSticker className="pop-in absolute top-[52%] -right-2 z-20 [--d:1050ms] sm:-right-6 lg:-right-[3%]">
            <Sticker angle={6} tone="butter" className="hand text-[1.15rem] font-normal tracking-normal normal-case">
              100% fluff
            </Sticker>
          </MagneticSticker>
          <MagneticSticker className="pop-in absolute right-[8%] -bottom-16 z-20 hidden [--d:1200ms] sm:block">
            <Annotation arrow="up-left" angle={3} className="text-[1.3rem]">
              zero regrets
            </Annotation>
          </MagneticSticker>

          <OopsBadge className="pop-in absolute -top-2 -right-3 z-20 hidden rounded-full bg-butter p-1 shadow-[var(--shadow-sticker)] [--d:750ms] sm:block lg:-top-8 lg:-right-6">
            <span className="absolute inset-0 grid place-items-center">
              <PawIcon className="size-8 text-on-fill" />
            </span>
          </OopsBadge>

          <div className="roll-in absolute -bottom-12 -left-6 z-20 w-28 [--d:450ms] sm:-left-12 sm:w-36 lg:-bottom-16 lg:-left-20 lg:w-44">
            <YarnBall />
          </div>

          <Sparkle className="absolute top-[6%] left-[44%] z-0 hidden size-6 text-butter lg:block" />
          <Sparkle className="absolute -bottom-2 left-[46%] z-0 size-4 text-lavender-ink/60" />
        </div>
      </div>
      {/* Where he came from: a trail of prints leading up to the yarn. */}
      <PawTrail className="absolute bottom-7 left-[7%] hidden w-[30rem] text-lavender-ink/30 lg:block xl:w-[36rem]" />
    </section>
  )
}
