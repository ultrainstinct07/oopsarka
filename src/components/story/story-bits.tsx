import Link from 'next/link'
import { Doodle } from '@/components/media/doodles'
import { ACCENT_FILL } from '@/components/media/decor'
import type { Category, PostSummary } from '@/lib/content/types'
import { cn, formatDate } from '@/lib/utils'

export function CategorySticker({
  category,
  className,
  asLink = false,
}: {
  category: Category
  className?: string
  asLink?: boolean
}) {
  const content = (
    <>
      <Doodle name={category.doodle} className="size-3.5" strokeWidth={4} />
      {category.title}
    </>
  )
  const classes = cn(
    'relative inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 label text-[0.68rem] text-on-fill',
    asLink && 'z-[3] transition-transform hover:-rotate-2',
    className,
  )
  const style = { background: ACCENT_FILL[category.accent] }
  return asLink ? (
    <Link href={`/category/${category.slug}`} className={classes} style={style}>
      {content}
    </Link>
  ) : (
    <span className={classes} style={style}>
      {content}
    </span>
  )
}

export function StoryMeta({
  post,
  className,
}: {
  post: Pick<PostSummary, 'publishedAt' | 'readingMinutes'>
  className?: string
}) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 text-sm text-ink-muted', className)}>
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} min read</span>
    </p>
  )
}

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border border-dashed border-ink-muted/60 px-2 py-0.5 label text-[0.62rem] text-ink-muted',
        className,
      )}
      title="Sample story — written to show the site off. Replace or edit it in the Studio."
    >
      Sample story
    </span>
  )
}
