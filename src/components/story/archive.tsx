import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ACCENT_FILL, ACCENT_SOFT, Eyebrow } from '@/components/media/decor'
import { Doodle, PawIcon } from '@/components/media/doodles'
import { JsonLd } from '@/components/seo/json-ld'
import { pageWindow } from '@/lib/content/pagination'
import type { Accent, DoodleName, PostSummary } from '@/lib/content/types'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { cn } from '@/lib/utils'
import { GridCard } from './story-cards'

export interface Crumb {
  name: string
  path: string
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
        <ol className="flex flex-wrap items-center gap-1.5 text-ink-muted">
          {items.map((item, index) => {
            const last = index === items.length - 1
            return (
              <li key={item.path} className="flex min-w-0 items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="max-w-[28ch] truncate font-semibold text-ink">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path as Route} className="link-draw">
                      {item.name}
                    </Link>
                    <ChevronRight aria-hidden className="size-3.5" />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

/** Editorial page header: eyebrow, huge title, standfirst, optional colour field + doodle. */
export function PageHeader({
  eyebrow,
  title,
  description,
  accent,
  doodle,
  crumbs,
  children,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  accent?: Accent
  doodle?: DoodleName
  crumbs?: Crumb[]
  children?: ReactNode
}) {
  return (
    <header
      className={cn('grain relative overflow-hidden', accent ? 'pt-8 pb-16 sm:pb-20' : 'pt-8 pb-10 sm:pb-14')}
      style={accent ? { background: ACCENT_SOFT[accent] } : undefined}
    >
      <div className="shell relative z-10">
        {crumbs ? <Breadcrumbs items={crumbs} className="mb-10" /> : null}
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-[16ch] font-display text-display font-semibold">{title}</h1>
        {description ? <div className="mt-6 max-w-[58ch] text-lede text-ink-muted">{description}</div> : null}
        {children}
      </div>
      {doodle ? (
        <Doodle
          name={doodle}
          className="pointer-events-none absolute top-1/2 right-[6%] hidden size-64 -translate-y-1/2 rotate-6 opacity-20 md:block"
          strokeWidth={2}
        />
      ) : null}
      {accent ? (
        <span aria-hidden className="absolute bottom-0 left-0 h-1.5 w-full" style={{ background: ACCENT_FILL[accent] }} />
      ) : null}
    </header>
  )
}

/** Archive grid: the first post on page one gets the big slot. */
export function PostGrid({ posts, lead = true }: { posts: PostSummary[]; lead?: boolean }) {
  return (
    <ul data-reveal-stagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <li key={post.slug} className={cn('flex', lead && index === 0 && 'sm:col-span-2 lg:row-span-2')}>
          <GridCard post={post} size={lead && index === 0 ? 'lead' : 'regular'} />
        </li>
      ))}
    </ul>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[2rem] border-2 border-dashed border-line-strong px-6 py-16 text-center">
      <PawIcon className="size-10 text-lavender-ink" />
      <h2 className="mt-5 font-display text-title font-semibold">{title}</h2>
      {children ? <div className="mt-3 max-w-[46ch] text-ink-muted">{children}</div> : null}
    </div>
  )
}

/** Numbered pagination with real links. `href(1)` must be the canonical first page. */
export function Pagination({ page, totalPages, href }: { page: number; totalPages: number; href: (page: number) => string }) {
  if (totalPages <= 1) return null
  const pages = pageWindow(page, totalPages)
  const base = 'press inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-3 font-semibold whitespace-nowrap'
  return (
    <nav aria-label="Pagination" className="mt-20 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1) as Route} rel="prev" className={cn(base, 'gap-2 border border-line-strong px-4')}>
          <ArrowLeft aria-hidden className="size-4" /> Newer
        </Link>
      ) : null}
      <ol className="flex items-center gap-1.5">
        {pages.map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-ink-muted">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span aria-current="page" className={cn(base, 'bg-ink text-bg')}>
                  {item}
                </span>
              ) : (
                <Link href={href(item) as Route} className={cn(base, 'hover:bg-bg-deep')} aria-label={`Page ${item}`}>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>
      {page < totalPages ? (
        <Link href={href(page + 1) as Route} rel="next" className={cn(base, 'gap-2 border border-line-strong px-4')}>
          Older <ArrowRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </nav>
  )
}
