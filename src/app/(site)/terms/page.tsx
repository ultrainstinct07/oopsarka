import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/story/archive'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Terms of use',
  description: 'The friendly rules for reading, sharing and quoting OopsArka.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The small print"
        title="Terms of use"
        description="Friendly rules for reading, sharing and quoting OopsArka. Last updated 25 October 2026."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Terms', path: '/terms' },
        ]}
      />
      <div className="shell py-14 sm:py-20">
        <div className="prose-arka">
          <h2>Reading and sharing</h2>
          <p>
            You&apos;re very welcome to read, link to and share stories from OopsArka. Quoting a few lines with a link back is
            lovely.
          </p>

          <h2>Photos and words</h2>
          <p>
            The photographs, videos, illustrations and writing on this site belong to Arka&apos;s human unless stated otherwise.
            Please don&apos;t republish them, use them commercially or use them to train AI models without asking first — get in
            touch through the <Link href="/contact">contact page</Link>.
          </p>

          <h2>Sample and playful content</h2>
          <p>
            Stories are written in Arka&apos;s voice, for fun. Some starter stories are clearly labelled as sample content and are
            not accounts of real events.
          </p>

          <h2>Not veterinary advice</h2>
          <p>
            The Persian Life notes share general information and one household&apos;s experience. They are not veterinary advice.
            For anything to do with your own cat&apos;s health, please talk to a qualified vet.
          </p>

          <h2>Messages you send</h2>
          <p>
            If you contact us, please be kind and don&apos;t send anything unlawful or anyone else&apos;s private information. We
            may not reply to every message.
          </p>

          <h2>Links to other sites</h2>
          <p>
            We occasionally link elsewhere. We aren&apos;t responsible for other sites&apos; content or how they handle your data.
          </p>

          <h2>No guarantees</h2>
          <p>
            We do our best to keep things accurate and online, but the site is provided as is. To the extent the law allows, we
            aren&apos;t liable for losses arising from its use.
          </p>

          <h2>Changes</h2>
          <p>
            These terms may change from time to time; the date above shows the latest version. Your privacy is covered separately
            in the <Link href="/privacy">privacy policy</Link>.
          </p>
        </div>
      </div>
    </>
  )
}
