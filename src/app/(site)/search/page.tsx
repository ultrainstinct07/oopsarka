import { ArrowRight, Search, X } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Highlight } from '@/components/search/highlight'
import { PageHeader } from '@/components/story/archive'
import { getAllPosts, getCategories, getTagsWithCounts, searchPosts } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'
import { cn, formatDate } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Search the diary',
  description: 'Search every story in Arka’s Diary — zoomies, boxes, grooming and more.',
  path: '/search',
  noindex: true,
})

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 120) ?? ''
}

function SearchForm({ query = '', category = '' }: { query?: string; category?: string }) {
  return (
    <form action="/search" method="get" role="search" className="mt-8 max-w-2xl">
      <label htmlFor="search-q" className="sr-only">
        Search stories
      </label>
      <div className="flex items-center gap-2 rounded-pill border-2 border-ink bg-surface p-1.5 pl-5 focus-within:shadow-[0_0_0_5px_color-mix(in_oklab,var(--lavender)_65%,transparent)]">
        <Search aria-hidden className="size-5 shrink-0 text-ink-muted" />
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="zoomies, cardboard, grooming…"
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full min-w-0 bg-transparent font-display text-xl outline-none placeholder:text-ink-muted/70 focus-visible:shadow-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {query ? (
          <Link
            href="/search"
            aria-label="Clear search"
            className="press grid size-11 shrink-0 place-items-center rounded-full hover:bg-bg-deep"
          >
            <X aria-hidden className="size-5" />
          </Link>
        ) : null}
        <button type="submit" className="press inline-flex h-11 shrink-0 items-center rounded-pill bg-ink px-5 font-bold text-bg">
          Search
        </button>
      </div>
    </form>
  )
}

async function Results({ searchParams }: Pick<PageProps<'/search'>, 'searchParams'>) {
  const params = await searchParams
  const query = first(params.q)
  const category = first(params.category)
  const [categories, tags, latest] = await Promise.all([getCategories(), getTagsWithCounts(), getAllPosts()])
  const activeCategory = categories.find((c) => c.slug === category)
  const hits = query ? await searchPosts(query, activeCategory?.slug) : []
  const href = (slug?: string) => `/search?${new URLSearchParams({ q: query, ...(slug ? { category: slug } : {}) })}` as Route

  return (
    <div>
      {query ? (
        <>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            <Link
              href={href()}
              aria-current={!activeCategory ? 'true' : undefined}
              className={cn(chip, !activeCategory && chipActive)}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={href(c.slug)}
                aria-current={activeCategory?.slug === c.slug ? 'true' : undefined}
                className={cn(chip, activeCategory?.slug === c.slug && chipActive)}
              >
                {c.title}
              </Link>
            ))}
          </div>
          <p role="status" className="mt-8 text-ink-muted">
            {hits.length
              ? `${hits.length} ${hits.length === 1 ? 'story matches' : 'stories match'} “${query}”${activeCategory ? ` in ${activeCategory.title}` : ''}.`
              : `No stories match “${query}”${activeCategory ? ` in ${activeCategory.title}` : ''}.`}
          </p>
          {hits.length ? (
            <ol className="mt-6 divide-y divide-line border-y border-line">
              {hits.map((hit) => (
                <li key={hit.slug}>
                  <Link
                    href={`/diary/${hit.slug}`}
                    className="group grid gap-1 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
                  >
                    <span>
                      <span className="label text-[0.68rem] text-ink-muted">
                        {hit.category} · {formatDate(hit.publishedAt)} · {hit.readingMinutes} min read
                      </span>
                      <span className="mt-1.5 block font-display text-2xl leading-snug font-semibold group-hover:text-lavender-ink">
                        <Highlight text={hit.title} terms={hit.terms} />
                      </span>
                      <span className="mt-1.5 block max-w-[70ch] text-ink-muted">
                        <Highlight text={hit.excerpt} terms={hit.terms} />
                      </span>
                    </span>
                    <ArrowRight aria-hidden className="hidden size-5 transition-transform group-hover:translate-x-1 sm:block" />
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-6 rounded-[2rem] border-2 border-dashed border-line-strong p-8">
              <p className="font-display text-2xl font-semibold">Arka searched under the sofa. Nothing.</p>
              <p className="mt-2 text-ink-muted">Try a shorter word, check the spelling, or start from one of these:</p>
              <Suggestions tags={tags.slice(0, 8).map((t) => t.tag)} />
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="font-display text-2xl font-semibold">Not sure what you&apos;re looking for?</p>
          <Suggestions tags={tags.slice(0, 10).map((t) => t.tag)} />
          <h2 className="mt-12 label text-ink-muted">Latest stories</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {latest.slice(0, 5).map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/diary/${post.slug}`}
                  className="flex items-center justify-between gap-6 py-4 font-display text-xl font-semibold hover:text-lavender-ink"
                >
                  {post.title}
                  <ArrowRight aria-hidden className="size-5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

async function SearchFormFromParams({ searchParams }: Pick<PageProps<'/search'>, 'searchParams'>) {
  const params = await searchParams
  return <SearchForm query={first(params.q)} category={first(params.category) || undefined} />
}

const chip =
  'press inline-flex min-h-10 items-center rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-bg-deep'
const chipActive = 'border-ink bg-ink text-bg hover:bg-ink'

function Suggestions({ tags }: { tags: { slug: string; title: string }[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link href={`/search?q=${encodeURIComponent(tag.title)}`} className={chip}>
            {tag.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={
          <>
            Search the <span className="text-lavender-ink italic">case files.</span>
          </>
        }
        description="Every story, searchable. Typos forgiven."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Search', path: '/search' },
        ]}
      >
        <Suspense fallback={<SearchForm />}>
          <SearchFormFromParams searchParams={searchParams} />
        </Suspense>
      </PageHeader>
      <section aria-label="Search results" className="shell py-12 sm:py-16">
        <Suspense fallback={<p className="text-ink-muted">Searching the case files…</p>}>
          <Results searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  )
}
