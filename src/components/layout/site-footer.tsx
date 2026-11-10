import type { Route } from 'next'
import { Rss } from 'lucide-react'
import Link from 'next/link'
import { PawIcon } from '@/components/media/doodles'
import { getCopyrightYear, getSettings } from '@/lib/content'
import type { SocialPlatform } from '@/lib/content/types'
import { site } from '@/lib/site'
import { FooterWordmark } from './footer-wordmark'
import { CalmToggle, ThemeToggle } from './preferences'

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  threads: 'Threads',
  bluesky: 'Bluesky',
  facebook: 'Facebook',
  pinterest: 'Pinterest',
}

const columns = [
  {
    title: 'Explore',
    links: [
      { href: '/', label: 'Home' },
      { href: '/diary', label: "Arka's Diary" },
      { href: '/categories', label: 'Categories' },
      { href: '/gallery', label: 'The Arka Files' },
      { href: '/play', label: 'Playroom' },
      { href: '/about', label: 'About Arka' },
    ],
  },
  {
    title: 'Say hello',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/newsletter', label: 'Newsletter' },
      { href: '/rss.xml', label: 'RSS feed' },
      { href: '/search', label: 'Search' },
    ],
  },
  {
    title: 'Small print',
    links: [
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
]

export async function SiteFooter() {
  const [year, settings] = await Promise.all([getCopyrightYear(), getSettings()])

  return (
    <footer className="grain relative overflow-hidden border-t border-line bg-bg-deep">
      <div className="shell relative z-10 pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <p className="font-display text-2xl leading-snug font-semibold">
              A tiny Persian cat. A giant personality. An endless supply of <em className="text-lavender-ink">oops</em>.
            </p>
            <p className="mt-4 text-ink-muted">
              {site.shortDescription} The diary of Arka, written with paws, typed by his human.
            </p>
            <div className="mt-6">
              <p className="label text-ink-muted">Elsewhere</p>
              {settings.socials.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {settings.socials.map((social) => (
                    <li key={social.url}>
                      <a
                        href={social.url}
                        rel="me noopener noreferrer"
                        target="_blank"
                        className="press inline-flex min-h-11 items-center rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold"
                      >
                        {PLATFORM_LABEL[social.platform]}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">
                  Social accounts are coming soon. Until then:{' '}
                  <Link href="/newsletter" className="underline">
                    the newsletter
                  </Link>{' '}
                  or{' '}
                  <a href="/rss.xml" className="underline">
                    RSS
                  </a>
                  .
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="label text-ink-muted">{column.title}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href as Route}
                        className="link-draw font-semibold"
                        prefetch={link.href.endsWith('.xml') ? false : undefined}
                      >
                        {link.href === '/rss.xml' ? <Rss aria-hidden className="mr-1.5 inline size-3.5" /> : null}
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <span className="mr-1 label text-ink-muted">Display</span>
          <ThemeToggle />
          <CalmToggle />
        </div>
      </div>

      <div className="shell relative z-10 -mb-[0.16em]">
        <FooterWordmark />
      </div>

      {/* The bar sits over the wordmark's descenders — a cropped, editorial sign-off. */}
      <div className="relative z-20 border-t border-line bg-bg-deep">
        <div className="shell flex flex-col gap-2 py-5 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} OopsArka. Words, photos and fluff belong to Arka and his human.</p>
          <p className="inline-flex items-center gap-2">
            Made with love, supervised by Arka <PawIcon className="size-3.5 text-lavender-ink" />
          </p>
        </div>
      </div>
    </footer>
  )
}
