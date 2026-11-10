import { Hash } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState, PageHeader } from '@/components/story/archive'
import { getTagsWithCounts } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Tags',
  description: 'Every tag in Arka’s Diary — zoomies, boxes, grooming, gravity experiments and more.',
  path: '/tags',
})

export default async function TagsPage() {
  const tags = await getTagsWithCounts()
  const max = Math.max(1, ...tags.map(({ count }) => count))

  return (
    <>
      <PageHeader
        eyebrow="The tag index"
        title={
          <>
            Cross-<span className="text-lavender-ink italic">referenced.</span>
          </>
        }
        description="Every tag that appears on at least one story. Bigger means busier."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tags', path: '/tags' },
        ]}
      />
      <div className="shell py-14 sm:py-20">
        {tags.length ? (
          <ul className="flex flex-wrap gap-3">
            {tags.map(({ tag, count }) => (
              <li key={tag.slug}>
                <Link
                  href={`/tags/${tag.slug}`}
                  className="press inline-flex min-h-12 items-center gap-2 rounded-pill border border-line-strong bg-surface px-5 font-semibold transition-colors hover:bg-lavender-soft"
                  style={{ fontSize: `${1 + (count / max) * 0.35}rem` }}
                >
                  <Hash aria-hidden className="size-4 text-lavender-ink" />
                  {tag.title}
                  <span className="text-sm font-normal text-ink-muted tabular-nums">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No tags yet." />
        )}
      </div>
    </>
  )
}
