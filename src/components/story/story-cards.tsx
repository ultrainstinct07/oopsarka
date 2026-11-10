import { ArrowRight } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { ArkaImage } from '@/components/media/arka-image'
import { Stamp } from '@/components/media/decor'
import type { PostSummary } from '@/lib/content/types'
import { cn, stampDate } from '@/lib/utils'
import { CategorySticker, SampleBadge, StoryMeta } from './story-bits'

const href = (post: PostSummary) => `/diary/${post.slug}` as Route

function Cover({
  post,
  sizes,
  aspect,
  className,
  preload,
}: {
  post: PostSummary
  sizes: string
  aspect: number
  className?: string
  preload?: boolean
}) {
  return (
    <ViewTransition name={`cover-${post.slug}`} share="morph" default="none">
      <ArkaImage
        image={post.cover}
        sizes={sizes}
        aspect={aspect}
        preload={preload}
        className={cn('rounded-[0.3rem]', className)}
        imgClassName="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
      />
    </ViewTransition>
  )
}

/** Hover/focus-revealed handwritten "oops!" — decorative. */
function OopsTag() {
  return (
    <span
      aria-hidden
      className="hand pointer-events-none absolute -top-3 -right-2 z-[4] rotate-6 rounded-md bg-butter px-2 py-0.5 text-lg text-on-fill opacity-0 shadow-[var(--shadow-sticker)] transition-[opacity,transform] duration-300 group-focus-within:-rotate-3 group-focus-within:opacity-100 group-hover:-rotate-3 group-hover:opacity-100"
    >
      oops!
    </span>
  )
}

/** The cover story: a portrait print beside a big headline. */
export function FeatureCard({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <article
      className={cn('group relative grid gap-7 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:items-center', className)}
    >
      <div className="relative">
        <div className="relative -rotate-[1.5deg] rounded-print bg-frame p-2 shadow-print transition-transform duration-500 group-hover:rotate-0">
          <Cover post={post} aspect={4 / 5} sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 92vw" />
          <OopsTag />
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <CategorySticker category={post.category} asLink />
          {post.sample ? <SampleBadge /> : null}
        </div>
        <h3 className="mt-4 font-display text-[clamp(1.9rem,1.2rem+1.9vw,3rem)] leading-[1.04] font-semibold tracking-[-0.02em]">
          <Link href={href(post)} className="stretched outline-none">
            {post.title}
          </Link>
        </h3>
        <p className="mt-4 max-w-[46ch] text-lede text-ink-muted">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Stamp>Filed {stampDate(post.publishedAt)}</Stamp>
          <StoryMeta post={post} />
        </div>
        <p aria-hidden className="mt-6 inline-flex items-center gap-2 font-bold text-ink">
          Read the incident report <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  )
}

/** Compact story with a small portrait thumbnail. */
export function StackCard({
  post,
  className,
  headingLevel = 'h3',
}: {
  post: PostSummary
  className?: string
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  return (
    <article className={cn('group relative grid grid-cols-[minmax(6.5rem,0.36fr)_1fr] gap-5 sm:gap-6', className)}>
      <div className="relative self-start rounded-print bg-frame p-1.5 shadow-print transition-transform duration-500 group-odd:rotate-[1.5deg] group-even:-rotate-[1.5deg] group-hover:rotate-0">
        <Cover post={post} aspect={3 / 4} sizes="(min-width: 1024px) 12vw, 30vw" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <CategorySticker category={post.category} asLink />
          {post.sample ? <SampleBadge /> : null}
        </div>
        <Heading className="mt-3 font-display text-title font-semibold">
          <Link href={href(post)} className="stretched outline-none">
            {post.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 text-ink-muted">{post.excerpt}</p>
        <StoryMeta post={post} className="mt-3" />
      </div>
      <OopsTag />
    </article>
  )
}

/** Archive grid card. `size="lead"` for the first, larger slot. */
export function GridCard({
  post,
  size = 'regular',
  headingLevel = 'h2',
}: {
  post: PostSummary
  size?: 'regular' | 'lead'
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  const lead = size === 'lead'
  return (
    <article className={cn('group relative flex flex-col', lead && 'sm:col-span-2 lg:row-span-2')}>
      <div className="relative rounded-print bg-frame p-1.5 shadow-print transition-transform duration-500 group-hover:-rotate-1">
        <Cover
          post={post}
          aspect={lead ? 4 / 5 : 4 / 3}
          sizes={lead ? '(min-width: 1024px) 40vw, 92vw' : '(min-width: 1024px) 26vw, (min-width: 640px) 44vw, 92vw'}
        />
        <OopsTag />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <CategorySticker category={post.category} asLink />
        {post.sample ? <SampleBadge /> : null}
      </div>
      <Heading className={cn('mt-3 font-display font-semibold', lead ? 'text-headline' : 'text-title')}>
        <Link href={href(post)} className="stretched outline-none">
          {post.title}
        </Link>
      </Heading>
      <p className={cn('mt-2 text-ink-muted', lead ? 'text-lede' : 'line-clamp-3')}>{post.excerpt}</p>
      <StoryMeta post={post} className="mt-3" />
    </article>
  )
}
