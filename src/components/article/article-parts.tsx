import { ArrowLeft, ArrowRight, Hash } from 'lucide-react'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { ArkaImage } from '@/components/media/arka-image'
import { Stamp } from '@/components/media/decor'
import { PawIcon } from '@/components/media/doodles'
import { Breadcrumbs } from '@/components/story/archive'
import { CategorySticker, SampleBadge } from '@/components/story/story-bits'
import { StackCard } from '@/components/story/story-cards'
import type { Post, PostSummary, Tag } from '@/lib/content/types'
import { formatLongDate, stampDate } from '@/lib/utils'

function Byline({ post }: { post: Post }) {
  const { author } = post
  return (
    <div className="flex items-center gap-3">
      {author.avatar ? (
        <span className="w-11 shrink-0 overflow-hidden rounded-full border-2 border-frame shadow-[var(--shadow-sticker)]">
          <ArkaImage image={author.avatar} aspect={1} sizes="44px" alt="" />
        </span>
      ) : (
        <span aria-hidden className="grid size-11 place-items-center rounded-full bg-lavender-soft text-lavender-ink">
          <PawIcon className="size-5" />
        </span>
      )}
      <p className="text-sm leading-snug">
        {author.isCat ? (
          <>
            <span className="font-semibold">Words by {author.name}</span>
            <span className="block text-ink-muted">typed by his human</span>
          </>
        ) : (
          <>
            <span className="font-semibold">By {author.name}</span>
            {author.role ? <span className="block text-ink-muted">{author.role}</span> : null}
          </>
        )}
      </p>
    </div>
  )
}

export function ArticleHeader({ post }: { post: Post }) {
  return (
    <header className="shell pt-8">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Diary', path: '/diary' },
          { name: post.category.title, path: `/category/${post.category.slug}` },
          { name: post.title, path: `/diary/${post.slug}` },
        ]}
      />
      <div className="mx-auto mt-12 max-w-4xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <CategorySticker category={post.category} asLink />
          {post.sample ? <SampleBadge /> : null}
        </div>
        <h1 className="mt-6 font-display text-[clamp(2.6rem,1.6rem+4.2vw,5.6rem)] leading-[0.98] font-semibold tracking-[-0.03em]">
          {post.title}
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-lede text-ink-muted">{post.excerpt}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Byline post={post} />
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            <Stamp>
              Filed <time dateTime={post.publishedAt}>{stampDate(post.publishedAt)}</time>
            </Stamp>
            {post.updatedAt ? (
              <span>
                Updated <time dateTime={post.updatedAt}>{formatLongDate(post.updatedAt)}</time>
              </span>
            ) : null}
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </div>
      {post.sample ? (
        <p className="mx-auto mt-8 max-w-xl rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-center text-sm text-ink-muted">
          This is sample content — a starter story written to show the site off, not an account of real events. It will be
          replaced or edited by Arka&apos;s human.
        </p>
      ) : null}
    </header>
  )
}

export function ArticleCover({ post }: { post: Post }) {
  const caption =
    post.cover.caption ?? (post.cover.illustration ? 'Illustration — a stand-in until the real evidence turns up.' : undefined)
  return (
    <figure className="shell mt-12 sm:mt-16">
      <div className="mx-auto max-w-[34rem] -rotate-1 rounded-print bg-frame p-2 shadow-print sm:p-2.5">
        <ViewTransition name={`cover-${post.slug}`} share="morph" default="none">
          <ArkaImage
            image={post.cover}
            aspect={4 / 5}
            preload
            sizes="(min-width: 640px) 34rem, 92vw"
            className="rounded-[0.25rem]"
          />
        </ViewTransition>
      </div>
      {caption ? (
        <figcaption className="mx-auto mt-4 max-w-[34rem] text-center text-sm text-ink-muted">{caption}</figcaption>
      ) : null}
    </figure>
  )
}

export function TagList({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null
  return (
    <div>
      <p className="label text-ink-muted">Tagged</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag.slug}>
            <Link
              href={`/tags/${tag.slug}`}
              className="press inline-flex min-h-10 items-center gap-1 rounded-pill bg-lavender-soft px-4 text-sm font-semibold hover:bg-lavender"
            >
              <Hash aria-hidden className="size-3.5" />
              {tag.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PrevNext({ newer, older }: { newer?: PostSummary; older?: PostSummary }) {
  if (!newer && !older) return null
  return (
    <nav aria-label="More stories" className="grid gap-4 sm:grid-cols-2">
      {older ? (
        <Link
          href={`/diary/${older.slug}`}
          rel="prev"
          className="group rounded-2xl border border-line-strong p-5 transition-colors hover:bg-bg-deep"
        >
          <span className="inline-flex items-center gap-2 label text-ink-muted">
            <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover:-translate-x-1" /> Previous incident
          </span>
          <span className="mt-2 block font-display text-xl leading-snug font-semibold">{older.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {newer ? (
        <Link
          href={`/diary/${newer.slug}`}
          rel="next"
          className="group rounded-2xl border border-line-strong p-5 text-right transition-colors hover:bg-bg-deep"
        >
          <span className="inline-flex items-center gap-2 label text-ink-muted">
            Next incident <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="mt-2 block font-display text-xl leading-snug font-semibold">{newer.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}

export function RelatedStories({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) return null
  return (
    <section aria-labelledby="related-title" className="border-t border-line bg-bg-deep py-20">
      <div className="shell">
        <h2 id="related-title" className="font-display text-headline font-semibold">
          Related <span className="text-lavender-ink italic">incidents</span>
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {posts.map((post) => (
            <StackCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function ReadingProgress() {
  return <div aria-hidden className="reading-progress fixed inset-x-0 top-0 z-50 h-1 bg-lavender-ink" />
}
