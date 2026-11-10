import { Rss } from 'lucide-react'
import { NewsletterForm } from '@/components/forms/newsletter-form'
import { ArkaImage } from '@/components/media/arka-image'
import { CatEarFrame, Eyebrow, TornEdge } from '@/components/media/decor'
import type { ArkaImage as ArkaImageData } from '@/lib/content/types'
import { isNewsletterConfigured } from '@/lib/integrations/config'

/** Shown instead of the form in production until a real provider is connected — no emails are collected. */
export function NewsletterUnavailable() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6">
      <p className="font-display text-xl font-semibold">The newsletter opens soon.</p>
      <p className="mt-2 text-ink-muted">
        Arka is still negotiating the terms. Until then, follow along with the{' '}
        <a href="/rss.xml" className="inline-flex items-center gap-1 font-semibold text-lavender-ink underline">
          <Rss aria-hidden className="size-3.5" /> RSS feed
        </a>
        .
      </p>
    </div>
  )
}

export function NewsletterBlock({ idPrefix }: { idPrefix?: string }) {
  const configured = isNewsletterConfigured()
  const isDev = process.env.NODE_ENV !== 'production'
  if (!configured && !isDev) return <NewsletterUnavailable />
  return <NewsletterForm configured={configured} showDevNotice={isDev} idPrefix={idPrefix} />
}

export function NewsletterSection({ photo, pitch }: { photo: ArkaImageData; pitch: string }) {
  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-title"
      className="grain relative overflow-hidden bg-butter-soft py-24 sm:py-32"
    >
      <TornEdge side="top" />
      <div className="shell relative z-10 grid gap-14 lg:grid-cols-12 lg:items-center">
        <div data-reveal="pop" className="mx-auto w-full max-w-[18rem] pt-6 sm:max-w-[20rem] lg:col-span-4 lg:max-w-none">
          <CatEarFrame tone="sage" rotate={-3}>
            <ArkaImage image={photo} aspect={4 / 5} sizes="(min-width: 1024px) 26vw, 20rem" className="rounded-[0.25rem]" />
          </CatEarFrame>
        </div>
        <div data-reveal-stagger className="lg:col-span-7 lg:col-start-6">
          <Eyebrow>Newsletter</Eyebrow>
          <h2 id="newsletter-title" className="mt-4 font-display text-display font-semibold">
            Get the occasional <span className="text-lavender-ink italic">oops.</span>
          </h2>
          <p className="mt-5 max-w-[46ch] text-lede text-ink-muted">{pitch}</p>
          <div className="mt-8 max-w-xl">
            <NewsletterBlock idPrefix="home-nl" />
          </div>
        </div>
      </div>
    </section>
  )
}
