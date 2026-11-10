import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'
import { BackToTop } from '@/components/layout/back-to-top'
import { DraftModeTools } from '@/components/layout/draft-mode-tools'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader, SkipLink } from '@/components/layout/site-header'
import { LocalContentNotice } from '@/components/layout/local-content-notice'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <LocalContentNotice />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <BackToTop />
      <Suspense fallback={null}>
        <DraftModeTools />
      </Suspense>
      {/* Cookieless Vercel Web Analytics — opt-in, and named in the privacy policy when on. */}
      {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === '1' ? (
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      ) : null}
    </>
  )
}
