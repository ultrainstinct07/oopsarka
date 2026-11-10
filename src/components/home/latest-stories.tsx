import type { Route } from 'next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { HoverImageList } from '@/components/fx/HoverImageList'
import { Eyebrow } from '@/components/media/decor'
import { imageUrl } from '@/components/media/image-url'
import { CategorySticker, SampleBadge } from '@/components/story/story-bits'
import { FeatureCard, StackCard } from '@/components/story/story-cards'
import type { PostSummary } from '@/lib/content/types'
import { formatDate } from '@/lib/utils'

function IncidentRow({ post }: { post: PostSummary }) {
  return (
    <span className="grid grid-cols-[1fr_auto] items-center gap-6 lg:grid-cols-[10rem_1fr_auto]">
      <span className="hidden lg:block">
        <CategorySticker category={post.category} />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 lg:hidden">
          <span className="label text-[0.68rem] text-ink-muted">{post.category.title}</span>
          {post.sample ? <SampleBadge /> : null}
        </span>
        <span className="mt-1 block font-display text-[1.45rem] leading-tight font-semibold text-ink transition-[color,translate] duration-300 group-hover:translate-x-1.5 group-hover:text-lavender-ink sm:text-[1.75rem] lg:mt-0">
          {post.title}
        </span>
        <span className="mt-1.5 block text-sm text-ink-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min read
          {post.sample ? <span className="hidden lg:inline"> · Sample story</span> : null}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden
        className="size-6 text-ink-muted transition-[translate,color] duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-lavender-ink"
      />
    </span>
  )
}

export function LatestStories({ featured, rest }: { featured?: PostSummary; rest: PostSummary[] }) {
  if (!featured) return null
  const stacked = rest.slice(0, 2)
  const index = rest.slice(2)

  return (
    <section aria-labelledby="latest-title" className="shell py-20 sm:py-28">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Latest incidents</Eyebrow>
          <h2 id="latest-title" className="mt-4 font-display text-display font-semibold">
            Fresh out of <span className="marker italic">trouble.</span>
          </h2>
        </div>
        <Link href="/diary" className="link-draw inline-flex items-center gap-2 font-bold">
          Read the whole diary <ArrowRight aria-hidden className="size-4" />
        </Link>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div data-reveal className="lg:col-span-7">
          <FeatureCard post={featured} />
        </div>
        <div data-reveal-stagger className="flex flex-col gap-10 lg:col-span-5 lg:border-l lg:border-line lg:pl-10">
          {stacked.map((post) => (
            <StackCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      {index.length ? (
        <div data-reveal className="mt-20">
          <h3 className="mb-2 label text-ink-muted">More incidents</h3>
          <HoverImageList
            items={index.map((post) => ({
              id: post.slug,
              href: `/diary/${post.slug}` as Route,
              image: imageUrl(post.cover, 420, 4 / 5),
              content: <IncidentRow post={post} />,
            }))}
          />
        </div>
      ) : null}
    </section>
  )
}
