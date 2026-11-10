import { ArrowRight, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { ArkaImage } from '@/components/media/arka-image'
import { Eyebrow } from '@/components/media/decor'
import { SampleBadge } from '@/components/story/story-bits'
import type { PostSummary } from '@/lib/content/types'

export function CareCallout({ className }: { className?: string }) {
  return (
    <aside
      className={`flex gap-4 rounded-2xl border-2 border-sage bg-sage-soft p-5 ${className ?? ''}`}
      aria-label="A note about health advice"
    >
      <Stethoscope aria-hidden className="mt-0.5 size-6 shrink-0 text-sage-ink" />
      <p className="text-[0.95rem]">
        <strong>Ask your vet.</strong> These are general notes from one Persian household, not veterinary advice. Personal
        experience is clearly marked as such. For anything health-related, your vet knows your cat best.
      </p>
    </aside>
  )
}

export function PersianLife({ guides }: { guides: PostSummary[] }) {
  if (!guides.length) return null
  const lead = guides.find((guide) => guide.featured) ?? guides[0]
  const others = guides.filter((guide) => guide.slug !== lead.slug)

  return (
    <section aria-labelledby="persian-title" className="shell py-24 sm:py-32">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div data-reveal-stagger className="lg:col-span-5">
          <Eyebrow>Persian Life</Eyebrow>
          <h2 id="persian-title" className="mt-4 font-display text-display font-semibold">
            The Persian life, <span className="text-sage-ink italic">honestly.</span>
          </h2>
          <p className="mt-6 max-w-[46ch] text-lede text-ink-muted">
            Long coats, flat-ish faces and strong opinions. Gentle, practical notes on living well with a Persian — what tends to
            help, what to watch for, and when to hand over to a professional.
          </p>
          <CareCallout className="mt-8 max-w-lg" />
          <Link href="/category/persian-life" className="link-draw mt-8 inline-flex items-center gap-2 font-bold">
            All Persian Life notes <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="lg:col-span-7">
          <article
            data-reveal
            className="group relative grid gap-6 rounded-[1.75rem] bg-sage-soft p-5 sm:grid-cols-[0.8fr_1fr] sm:items-center sm:p-7"
          >
            <div className="rotate-[-2deg] rounded-print bg-frame p-1.5 shadow-print transition-transform duration-500 group-hover:rotate-0">
              <ArkaImage image={lead.cover} aspect={1} sizes="(min-width: 1024px) 22vw, 80vw" className="rounded-[0.25rem]" />
            </div>
            <div>
              <p className="flex items-center gap-2 label text-sage-ink">Start here {lead.sample ? <SampleBadge /> : null}</p>
              <h3 className="mt-3 font-display text-title font-semibold">
                <Link href={`/diary/${lead.slug}`} className="stretched outline-none">
                  {lead.title}
                </Link>
              </h3>
              <p className="mt-3 text-ink-muted">{lead.excerpt}</p>
              <p className="mt-4 text-sm text-ink-muted">{lead.readingMinutes} min read</p>
            </div>
          </article>

          <ol data-reveal-stagger className="mt-8 divide-y divide-line border-y border-line">
            {others.slice(0, 4).map((guide, index) => (
              <li key={guide.slug}>
                <Link href={`/diary/${guide.slug}`} className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-5">
                  <span className="font-display text-2xl font-semibold text-sage-ink tabular-nums">
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block font-display text-[1.3rem] leading-snug font-semibold transition-[color,translate] duration-300 group-hover:translate-x-1.5 group-hover:text-lavender-ink">
                      {guide.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-muted">{guide.readingMinutes} min read</span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-5 self-center text-ink-muted transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
