import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/story/archive'
import { activeServices } from '@/lib/integrations/config'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'What OopsArka collects (very little), why, which services are involved, and how to get in touch about your data.',
  path: '/privacy',
})

const LAST_UPDATED = '25 October 2026'

/** Generated from the integrations that are actually switched on for this deployment. */
export default function PrivacyPage() {
  const services = activeServices()

  return (
    <>
      <PageHeader
        eyebrow="The small print"
        title="Privacy policy"
        description={`The short version: OopsArka collects as little as possible, sells nothing, and runs no advertising trackers. Last updated ${LAST_UPDATED}.`}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Privacy', path: '/privacy' },
        ]}
      />
      <div className="shell py-14 sm:py-20">
        <div className="prose-arka">
          <h2>Who runs this site</h2>
          <p>
            OopsArka (oopsarka.space) is a personal blog about Arka, a Persian cat, written and run by his human. You can reach us
            through the <Link href="/contact">contact page</Link>.
          </p>

          <h2>Visiting the site</h2>
          <p>
            The site is hosted on Vercel. Like any web host, it processes technical information needed to deliver pages and keep
            the site secure — such as your IP address, browser type and the pages requested — in short-lived server logs. We
            don&apos;t use these logs to identify you.
          </p>
          <p>
            Your display choices (3 AM mode and Calm mode) are saved in your own browser&apos;s local storage. They never leave
            your device.
          </p>
          {services.analytics ? (
            <p>
              We use Vercel Web Analytics to count page views. It is cookieless, collects aggregated data and does not build a
              profile of you.
            </p>
          ) : (
            <p>We don&apos;t run analytics or advertising scripts.</p>
          )}

          <h2>The newsletter</h2>
          {services.newsletter ? (
            <>
              <p>
                If you sign up, your email address is stored by our newsletter provider, Buttondown, so we can send you the
                occasional story. You&apos;ll receive a confirmation email first and nothing is sent until you confirm. Every
                email includes an unsubscribe link, and you can ask us to delete your address at any time.
              </p>
              <p>
                Buttondown&apos;s own policy applies to how it processes your address:{' '}
                <a href="https://buttondown.com/legal/privacy">buttondown.com/legal/privacy</a>.
              </p>
            </>
          ) : (
            <p>The newsletter isn&apos;t active yet, so no email addresses are being collected.</p>
          )}

          <h2>The contact form</h2>
          {services.contact ? (
            <p>
              Messages you send are delivered to our inbox through an email service (Resend). We use your name and email only to
              reply, keep the conversation in our mailbox for as long as it&apos;s useful, and never add you to a mailing list.
            </p>
          ) : (
            <p>The contact form isn&apos;t connected yet, so messages are not being sent or stored.</p>
          )}

          <h2>Spam protection</h2>
          <p>
            To stop automated abuse, the forms limit how often they can be used from one place. This uses a one-way hash of your
            IP address, never the address itself
            {services.rateLimit
              ? ', stored briefly with our database provider (Upstash) and deleted automatically within an hour'
              : ''}
            .
          </p>
          {services.turnstile ? (
            <p>
              The contact form uses Cloudflare Turnstile to check that messages come from a person. Turnstile processes limited
              device and browser signals for this purpose only.
            </p>
          ) : null}

          <h2>Embedded videos</h2>
          <p>
            If a story contains a YouTube or Vimeo video, it only loads when you choose to play it. At that point the provider may
            set its own cookies, under its own privacy policy.
          </p>

          <h2>Cookies</h2>
          <p>
            Visitors get no tracking cookies. The only cookie this site sets is a preview cookie for the site&apos;s own editors
            while they review drafts.
          </p>

          <h2>Your choices and rights</h2>
          <p>
            You can ask what we hold about you, ask us to correct or delete it, or unsubscribe at any time. Just get in touch
            through the <Link href="/contact">contact page</Link>. If you are unhappy with how we handle your data, you can also
            contact your local data protection authority.
          </p>

          <h2>Changes</h2>
          <p>If the services above change, this page changes with them. The date at the top shows when it was last updated.</p>
        </div>
      </div>
    </>
  )
}
