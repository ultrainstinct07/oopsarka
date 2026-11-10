import Link from 'next/link'
import { Suspense } from 'react'
import { PawIcon } from '@/components/media/doodles'
import { SearchTrigger } from '@/components/search/search-trigger'
import { HeaderShell } from './header-shell'
import { MobileMenu } from './mobile-menu'
import { NavLinks, NavLinksStatic } from './nav-links'
import { Wordmark } from './wordmark'

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="shell flex h-16 items-center justify-between gap-4 lg:h-20">
        <Wordmark />
        <nav aria-label="Main" className="hidden lg:block">
          <Suspense fallback={<NavLinksStatic />}>
            <NavLinks />
          </Suspense>
        </nav>
        <div className="flex items-center gap-2">
          <SearchTrigger />
          <Link
            href="/newsletter"
            className="press hidden h-11 items-center gap-2 rounded-pill bg-butter px-4 text-sm font-bold text-on-fill shadow-[inset_0_-2px_0_rgb(36_33_31/0.12)] transition-transform hover:-rotate-2 sm:inline-flex"
          >
            <PawIcon className="size-4" />
            Follow the chaos
          </Link>
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </HeaderShell>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only-focusable fixed top-3 left-3 z-[60] rounded-pill bg-ink px-5 py-3 font-semibold text-bg focus:not-sr-only"
    >
      Skip to content
    </a>
  )
}
