import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { isSanityConfigured } from '@/sanity/env'
import { Studio } from './studio'

export const metadata: Metadata = {
  title: { absolute: 'OopsArka Studio' },
  robots: { index: false, follow: false },
  referrer: 'same-origin',
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

/** Marks the Studio as intentionally request-time (its tool paths are unknown at build). */
async function RequestTime() {
  await connection()
  return null
}

/** The embedded Sanity Studio — or, until a project is connected, a friendly setup screen. */
export default function StudioPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RequestTime />
      </Suspense>
      {isSanityConfigured ? <Studio /> : <StudioSetup />}
    </>
  )
}

function StudioSetup() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 py-16 text-ink">
      <div className="max-w-xl">
        <p className="label text-ink-muted">OopsArka Studio</p>
        <h1 className="mt-4 font-display text-display font-semibold">The Studio isn&apos;t connected yet.</h1>
        <p className="mt-5 text-lede text-ink-muted">
          The site is running on its built-in sample content. To write and publish stories in the browser, connect a Sanity
          project:
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5">
          <li>
            Create a free project at <span className="font-semibold">sanity.io/manage</span> with a dataset called{' '}
            <code>production</code>.
          </li>
          <li>
            Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and optionally <code>NEXT_PUBLIC_SANITY_DATASET</code>) in{' '}
            <code>.env.local</code> and in Vercel.
          </li>
          <li>
            Run <code>npm run seed</code> to copy the sample stories, photos and clips into Sanity.
          </li>
        </ol>
        <p className="mt-6 text-ink-muted">
          The full walkthrough is in <code>docs/SANITY.md</code>.{' '}
          <Link href="/" className="font-semibold text-lavender-ink underline">
            Back to the site
          </Link>
        </p>
      </div>
    </main>
  )
}
