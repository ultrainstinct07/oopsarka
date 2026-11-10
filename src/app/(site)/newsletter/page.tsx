import { Inbox, Rss, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterBlock } from '@/components/home/newsletter-section'
import { ArkaImage } from '@/components/media/arka-image'
import { CatEarFrame } from '@/components/media/decor'
import { PageHeader } from '@/components/story/archive'
import { getSettings } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Newsletter — get the occasional oops',
  description:
    'New adventures, questionable decisions, and an unreasonable amount of fluff. Delivered occasionally, never spammed.',
  path: '/newsletter',
})

export default async function NewsletterPage() {
  const settings = await getSettings()
  return (
    <>
      <PageHeader
        eyebrow="Follow the chaos"
        title={
          <>
            Get the occasional <span className="text-lavender-ink italic">oops.</span>
          </>
        }
        description={settings.newsletterPitch}
        accent="butter"
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Newsletter', path: '/newsletter' },
        ]}
      />
      <div className="shell grid gap-16 py-16 sm:py-24 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <NewsletterBlock idPrefix="page-nl" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            <li className="rounded-2xl border border-line-strong p-5">
              <Sparkles aria-hidden className="size-5 text-lavender-ink" />
              <p className="mt-3 font-semibold">New stories</p>
              <p className="mt-1 text-sm text-ink-muted">The latest incidents, as they&apos;re filed.</p>
            </li>
            <li className="rounded-2xl border border-line-strong p-5">
              <Inbox aria-hidden className="size-5 text-lavender-ink" />
              <p className="mt-3 font-semibold">Rarely</p>
              <p className="mt-1 text-sm text-ink-muted">Occasional means occasional. No daily digests.</p>
            </li>
            <li className="rounded-2xl border border-line-strong p-5">
              <Rss aria-hidden className="size-5 text-lavender-ink" />
              <p className="mt-3 font-semibold">Prefer RSS?</p>
              <p className="mt-1 text-sm text-ink-muted">
                <a href="/rss.xml" className="underline">
                  Subscribe to the feed
                </a>{' '}
                instead.
              </p>
            </li>
          </ul>
          <p className="mt-10 text-sm text-ink-muted">
            You&apos;ll get a confirmation email first — nothing arrives until you confirm. Every email has an unsubscribe link.
            Read how your email address is handled in the{' '}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
        <div className="mx-auto w-full max-w-[20rem] pt-6 lg:col-span-4 lg:col-start-9">
          <CatEarFrame tone="sage" rotate={3}>
            <ArkaImage image={settings.newsletterImage} aspect={4 / 5} sizes="20rem" className="rounded-[0.25rem]" />
          </CatEarFrame>
        </div>
      </div>
    </>
  )
}
