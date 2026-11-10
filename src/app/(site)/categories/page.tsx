import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArkaImage } from '@/components/media/arka-image'
import { ACCENT_FILL, ACCENT_SOFT } from '@/components/media/decor'
import { Doodle } from '@/components/media/doodles'
import { PageHeader } from '@/components/story/archive'
import { getCategoriesWithCounts } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'
import { formatDate, pluralize } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Categories',
  description: 'Daily Diary, Oops Moments, Persian Life, Adventures and Human Observations — every file in the OopsArka cabinet.',
  path: '/categories',
})

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts()

  return (
    <>
      <PageHeader
        eyebrow="The filing cabinet"
        title={
          <>
            Every <span className="text-lavender-ink italic">file</span>, open for inspection.
          </>
        }
        description="Stories are sorted into five drawers. Some drawers are fuller than others. That is Arka's doing."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Categories', path: '/categories' },
        ]}
      />
      <div className="shell py-14 sm:py-20">
        <ul className="grid gap-6 md:grid-cols-2">
          {categories.map(({ category, count, latest }) => (
            <li key={category.slug}>
              <article
                className="group relative isolate flex h-full flex-col gap-6 overflow-hidden rounded-[1.75rem] p-7 sm:flex-row sm:p-9"
                style={{ background: ACCENT_SOFT[category.accent] }}
              >
                <div className="relative z-[1] flex-1">
                  <p className="inline-flex items-center gap-2 label text-ink-muted">
                    <span aria-hidden className="size-2.5 rounded-full" style={{ background: ACCENT_FILL[category.accent] }} />
                    {pluralize(count, 'story', 'stories')}
                  </p>
                  <h2 className="mt-3 font-display text-headline font-semibold">
                    <Link href={`/category/${category.slug}`} className="stretched outline-none">
                      {category.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-ink-muted">{category.description}</p>
                  {latest ? (
                    <p className="mt-5 text-sm">
                      <span className="label text-[0.62rem] text-ink-muted">Latest:</span>{' '}
                      <span className="font-semibold">{latest.title}</span>{' '}
                      <span className="text-ink-muted">· {formatDate(latest.publishedAt)}</span>
                    </p>
                  ) : null}
                </div>
                {category.cover ? (
                  <div className="w-32 shrink-0 rotate-3 self-end rounded-[0.3rem] bg-frame p-1.5 shadow-print transition-transform duration-500 group-hover:rotate-0 sm:w-36">
                    <ArkaImage image={category.cover} aspect={3 / 4} sizes="9rem" alt="" />
                  </div>
                ) : (
                  <Doodle name={category.doodle} className="size-28 shrink-0 self-end opacity-30" strokeWidth={2} />
                )}
                <ArrowUpRight
                  aria-hidden
                  className="absolute top-7 right-7 size-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-center text-ink-muted">
          Looking for something specific? Try the{' '}
          <Link href="/tags" className="font-semibold text-lavender-ink underline">
            tag index
          </Link>{' '}
          or{' '}
          <Link href="/search" className="font-semibold text-lavender-ink underline">
            search
          </Link>
          .
        </p>
      </div>
    </>
  )
}
