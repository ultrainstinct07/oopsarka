import type { Metadata } from 'next'
import { NotFoundView } from '@/components/layout/not-found-view'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader, SkipLink } from '@/components/layout/site-header'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

/** Unmatched URLs render outside the (site) group, so this brings its own chrome. */
export default function RootNotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <NotFoundView />
      </main>
      <SiteFooter />
    </>
  )
}
