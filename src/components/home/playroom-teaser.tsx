import { ArrowRight } from 'lucide-react'
import { Sticker } from '@/components/media/decor'
import { ObstacleArt, Runner, TreatArt } from '@/components/play/art'
import { ButtonLink } from '@/components/ui/button-link'

/** A short invitation to the mini games. */
export function PlayroomTeaser() {
  return (
    <section aria-labelledby="playroom-title" className="shell pt-20 sm:pt-28">
      <div
        data-reveal
        className="relative flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-[1.75rem] bg-lavender-soft p-7 sm:p-10"
      >
        <div>
          <div aria-hidden className="flex flex-wrap gap-2.5">
            <Sticker angle={-3} tone="butter">
              Knock It Off
            </Sticker>
            <Sticker angle={2}>Paw Pairs</Sticker>
            <Sticker angle={-2} tone="rose">
              3 AM Zoomies
            </Sticker>
          </div>
          <h2 id="playroom-title" className="mt-5 font-display text-headline font-semibold">
            Bored? <span className="text-lavender-ink italic">So is Arka.</span>
          </h2>
          <p className="mt-3 max-w-[44ch] text-lede text-ink-muted">
            Three small games from the case files. Clear a table, match the evidence, outrun a slipper.
          </p>
        </div>
        {/* A glimpse of the hallway game */}
        <div aria-hidden className="relative hidden h-28 w-60 shrink-0 lg:block">
          <Runner pose="jump" className="float-soft absolute top-0 left-6 w-28 -rotate-6" />
          <ObstacleArt kind="slipper" className="absolute bottom-1 left-12 w-16" />
          <TreatArt className="absolute top-6 right-6 w-10 rotate-12" />
          <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ink/25" />
        </div>
        <ButtonLink
          href="/play"
          variant="butter"
          size="lg"
          roll="Enter the playroom"
          icon={<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />}
        />
      </div>
    </section>
  )
}
