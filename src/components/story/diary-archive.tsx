import Link from 'next/link'
import { JsonLd } from '@/components/seo/json-ld'
import { getAllPosts, getCategoriesWithCounts } from '@/lib/content'
import { paginate } from '@/lib/content/pagination'
import { blogJsonLd } from '@/lib/seo/structured-data'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'
import { EmptyState, PageHeader, Pagination, PostGrid } from './archive'

export const diaryHref = (page: number) => (page <= 1 ? '/diary' : `/diary/page/${page}`)

export async function DiaryArchive({ page }: { page: number }) {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategoriesWithCounts()])
  const current = paginate(posts, page, site.postsPerPage)

  return (
    <>
      {page === 1 ? <JsonLd data={blogJsonLd(posts)} /> : null}
      <PageHeader
        eyebrow={page > 1 ? `The diary · page ${current.page} of ${current.totalPages}` : 'The diary'}
        title={
          <>
            Arka&apos;s <span className="text-lavender-ink italic">Diary.</span>
          </>
        }
        description="Every oops, in order. Stories from the life of a small Persian cat, newest first."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Diary', path: '/diary' },
          ...(page > 1 ? [{ name: `Page ${current.page}`, path: diaryHref(current.page) }] : []),
        ]}
      >
        <nav aria-label="Browse by category" className="mt-8 flex flex-wrap gap-2">
          {categories
            .filter(({ count }) => count > 0)
            .map(({ category, count }) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={cn(
                  'press inline-flex min-h-10 items-center gap-2 rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-bg-deep',
                )}
              >
                {category.title}
                <span className="text-ink-muted tabular-nums">{count}</span>
              </Link>
            ))}
        </nav>
      </PageHeader>

      <div className="shell py-14 sm:py-20">
        {current.items.length ? (
          <PostGrid posts={current.items} lead={current.page === 1} />
        ) : (
          <EmptyState title="The diary is empty — for now.">Arka is drafting. Check back soon.</EmptyState>
        )}
        <Pagination page={current.page} totalPages={current.totalPages} href={diaryHref} />
      </div>
    </>
  )
}
