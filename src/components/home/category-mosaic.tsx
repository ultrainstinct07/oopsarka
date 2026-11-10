import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { ArkaImage } from '@/components/media/arka-image'
import { ACCENT_FILL, ACCENT_SOFT, Eyebrow, Tape } from '@/components/media/decor'
import { Doodle } from '@/components/media/doodles'
import type { Category } from '@/lib/content/types'
import { cn, pluralize } from '@/lib/utils'

interface Tile {
  category: Category
  count: number
}

function CategoryTile({ category, count, size }: Tile & { size: 'hero' | 'photo' | 'text' }) {
  const hero = size === 'hero'
  return (
    <article
      className={cn(
        'group relative isolate flex min-h-[15rem] flex-col overflow-hidden rounded-[1.75rem] p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-print sm:p-8',
        hero && 'min-h-[24rem] lg:row-span-2 lg:min-h-0',
        size === 'text' && 'justify-between',
      )}
      style={{ background: ACCENT_SOFT[category.accent] }}
    >
      <Doodle
        name={category.doodle}
        className={cn(
          'pointer-events-none absolute -z-10 opacity-25 transition-transform duration-500 group-hover:rotate-6',
          hero ? '-right-6 -bottom-6 size-56' : 'top-5 right-5 size-20',
        )}
        style={{ color: 'var(--ink)' }}
      />
      <div className={cn('relative z-[1] max-w-[22rem]', size === 'photo' && 'max-w-[58%]')}>
        <p className="inline-flex items-center gap-2 label text-ink-muted">
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: ACCENT_FILL[category.accent] }} />
          {pluralize(count, 'story', 'stories')}
        </p>
        <h3 className={cn('mt-3 font-display font-semibold', hero ? 'text-display' : 'text-title')}>
          <Link href={`/category/${category.slug}`} className="stretched outline-none">
            {category.title}
          </Link>
        </h3>
        <p className={cn('mt-3 text-ink-muted', hero && 'text-lede')}>{hero ? category.description : category.tagline}</p>
      </div>

      {category.cover && size !== 'text' ? (
        <div
          className={cn(
            'relative mt-8 self-end rounded-[0.3rem] bg-frame p-1.5 shadow-print transition-transform duration-500',
            hero
              ? 'w-[min(17rem,62%)] rotate-[3deg] group-hover:rotate-0'
              : 'absolute right-5 bottom-5 mt-0 w-[34%] max-w-[9.5rem] -rotate-[4deg] group-hover:-rotate-1',
          )}
        >
          <ArkaImage image={category.cover} aspect={hero ? 4 / 5 : 3 / 4} alt="" sizes={hero ? '17rem' : '9.5rem'} />
          <Tape
            className="-top-3 left-1/2 w-16 -translate-x-1/2"
            angle={-4}
            tone={category.accent === 'butter' ? 'lavender' : 'butter'}
          />
        </div>
      ) : null}

      <span
        aria-hidden
        className="absolute bottom-6 left-6 inline-grid size-11 place-items-center rounded-full border-2 border-ink bg-surface transition-transform duration-300 group-hover:-rotate-12 sm:bottom-8 sm:left-8"
      >
        <ArrowUpRight className="size-5" />
      </span>
    </article>
  )
}

export function CategoryMosaic({ tiles }: { tiles: Tile[] }) {
  const find = (slug: string) => tiles.find((tile) => tile.category.slug === slug)
  const order: { slug: string; size: 'hero' | 'photo' | 'text' }[] = [
    { slug: 'oops-moments', size: 'hero' },
    { slug: 'daily-diary', size: 'photo' },
    { slug: 'adventures', size: 'photo' },
    { slug: 'persian-life', size: 'text' },
    { slug: 'human-observations', size: 'text' },
  ]
  const known = order.flatMap(({ slug, size }) => {
    const tile = find(slug)
    return tile ? [{ ...tile, size }] : []
  })
  // Categories added later in the CMS still get a tile.
  const extra = tiles
    .filter((tile) => !order.some((o) => o.slug === tile.category.slug))
    .map((tile) => ({ ...tile, size: 'text' as const }))

  return (
    <section aria-labelledby="categories-title" className="shell py-20 sm:py-28">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>The filing cabinet</Eyebrow>
          <h2 id="categories-title" className="mt-4 font-display text-display font-semibold">
            Pick a <span className="text-lavender-ink italic">file.</span>
          </h2>
        </div>
        <Link href="/categories" className="link-draw font-bold">
          All categories
        </Link>
      </header>
      <div
        data-reveal-stagger="pop"
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[repeat(2,minmax(17rem,auto))]"
      >
        {[...known, ...extra].map((tile) => (
          <CategoryTile key={tile.category.slug} {...tile} />
        ))}
      </div>
    </section>
  )
}
