import { Clock, MessageCircleHeart, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/forms/contact-form'
import { PageHeader } from '@/components/story/archive'
import { getSettings } from '@/lib/content'
import { integrations, isContactConfigured } from '@/lib/integrations/config'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Contact Arka',
  description:
    'Write to Arka the Persian cat. Fan mail, collaboration ideas and cat-care questions — his human reads every message.',
  path: '/contact',
})

export default async function ContactPage() {
  const settings = await getSettings()
  const configured = isContactConfigured()
  const isDev = process.env.NODE_ENV !== 'production'

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Write to <span className="text-lavender-ink italic">Arka.</span>
          </>
        }
        description={settings.contactIntro}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />
      <div className="shell grid gap-14 py-14 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {configured || isDev ? (
            <ContactForm configured={configured} showDevNotice={isDev} turnstileSiteKey={integrations.turnstile.siteKey} />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-7">
              <p className="font-display text-2xl font-semibold">The mailbox isn&apos;t open yet.</p>
              <p className="mt-2 text-ink-muted">
                The contact form will be switched on shortly. Nothing you type here is stored or sent until it is.
              </p>
            </div>
          )}
        </div>
        <aside className="flex flex-col gap-5 lg:col-span-4 lg:col-start-9" aria-label="About your message">
          <div className="rounded-2xl bg-lavender-soft p-6">
            <MessageCircleHeart aria-hidden className="size-6 text-lavender-ink" />
            <h2 className="mt-3 font-display text-xl font-semibold">Good things to write about</h2>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-ink-muted">
              <li>Fan mail (Arka accepts compliments)</li>
              <li>Collaboration and press ideas</li>
              <li>Questions about living with a Persian</li>
              <li>Your own cat&apos;s best oops moment</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-butter-soft p-6">
            <Clock aria-hidden className="size-6" />
            <h2 className="mt-3 font-display text-xl font-semibold">Replies</h2>
            <p className="mt-2 text-ink-muted">
              Every message is read by a human. Replies can take a few days — longer if Arka is sitting on the keyboard. For
              urgent questions about your own cat&apos;s health, please call your vet.
            </p>
          </div>
          <div className="rounded-2xl bg-sage-soft p-6">
            <ShieldCheck aria-hidden className="size-6 text-sage-ink" />
            <h2 className="mt-3 font-display text-xl font-semibold">Your details</h2>
            <p className="mt-2 text-ink-muted">
              Your name and email are used only to reply to you and are never added to a mailing list. See the{' '}
              <a href="/privacy" className="font-semibold underline">
                privacy policy
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
