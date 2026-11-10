import { HeartHandshake, Link2, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from 'next-sanity'
import { ArkaImage } from '@/components/media/arka-image'
import { ArkaVideo } from '@/components/media/arka-video'
import { PawIcon } from '@/components/media/doodles'
import { imageUrl } from '@/components/media/image-url'
import type {
  ArkaNoteBlock,
  BodyBlock,
  CareNoteBlock,
  ClipBlock,
  EmbedBlock,
  FigureBlock,
  HumanNoteBlock,
  PullQuoteBlock,
  TocItem,
} from '@/lib/content/types'
import { cn } from '@/lib/utils'
import { LiteEmbed } from './lite-embed'

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

function components(toc: TocItem[]): PortableTextComponents {
  const idFor = (key?: string) => toc.find((item) => item.key === key)?.id

  const Heading = ({ level, children, value }: { level: 2 | 3; children: React.ReactNode; value: { _key?: string } }) => {
    const id = idFor(value._key)
    const Tag = level === 2 ? 'h2' : 'h3'
    return (
      <Tag id={id} className="group relative scroll-mt-28">
        {children}
        {id ? (
          <a
            href={`#${id}`}
            className="ml-2 inline-flex align-middle text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Link to this section"
          >
            <Link2 aria-hidden className="size-[0.6em]" />
          </a>
        ) : null}
      </Tag>
    )
  }

  return {
    block: {
      normal: ({ children }) => <p>{children}</p>,
      h2: ({ children, value }) => (
        <Heading level={2} value={value}>
          {children}
        </Heading>
      ),
      h3: ({ children, value }) => (
        <Heading level={3} value={value}>
          {children}
        </Heading>
      ),
      h4: ({ children }) => <h4>{children}</h4>,
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
    list: {
      bullet: ({ children }) => <ul>{children}</ul>,
      number: ({ children }) => <ol>{children}</ol>,
    },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => <code>{children}</code>,
      link: ({ children, value }) => {
        const href: string = value?.href ?? '#'
        if (isInternal(href)) return <Link href={href as never}>{children}</Link>
        return (
          <a href={href} rel="noopener noreferrer" target={href.startsWith('mailto:') ? undefined : '_blank'}>
            {children}
            {href.startsWith('mailto:') ? null : <span className="sr-only"> (opens in a new tab)</span>}
          </a>
        )
      },
    },
    types: {
      figure: ({ value }: { value: FigureBlock }) => (
        <figure data-reveal className={cn(value.layout === 'wide' && 'breakout')}>
          <div className="rounded-print bg-frame p-1.5 shadow-print">
            <ArkaImage
              image={value.image}
              sizes={value.layout === 'wide' ? '(min-width: 1024px) 60rem, 92vw' : '(min-width: 768px) 40rem, 92vw'}
              className="rounded-[0.25rem]"
            />
          </div>
          {value.image.caption ? <figcaption className="mt-3 text-sm text-ink-muted">{value.image.caption}</figcaption> : null}
        </figure>
      ),
      pullQuote: ({ value }: { value: PullQuoteBlock }) => (
        <figure data-reveal="pop" className="breakout relative my-14 text-center">
          <PawIcon className="mx-auto size-6 text-lavender-ink" />
          <blockquote className="mx-auto mt-4 max-w-[24ch] border-0 p-0 font-display text-[clamp(1.8rem,1.3rem+2vw,3rem)] leading-[1.08] font-semibold text-ink not-italic">
            <span className="text-lavender-ink italic">“</span>
            {value.text}
            <span className="text-lavender-ink italic">”</span>
          </blockquote>
          {value.attribution ? <figcaption className="mt-4 text-sm text-ink-muted">— {value.attribution}</figcaption> : null}
        </figure>
      ),
      arkaNote: ({ value }: { value: ArkaNoteBlock }) => (
        <aside className="arka-note" aria-label="Arka's note">
          <div className="arka-note-inner">
            <span className="block label text-[0.62rem] text-lavender-ink">Arka&apos;s note</span>
            <span className="hand mt-1 block text-[1.35rem] leading-snug text-ink">{value.text}</span>
          </div>
        </aside>
      ),
      careNote: ({ value }: { value: CareNoteBlock }) => (
        <aside
          className="flex gap-4 rounded-2xl border-2 border-sage bg-sage-soft p-5 text-[0.97rem] leading-relaxed"
          aria-label={value.title ?? 'Care note'}
        >
          <Stethoscope aria-hidden className="mt-1 size-5 shrink-0 text-sage-ink" />
          <div>
            {value.title ? <p className="font-bold">{value.title}</p> : null}
            <p className={cn(value.title && 'mt-1')}>{value.text}</p>
          </div>
        </aside>
      ),
      humanNote: ({ value }: { value: HumanNoteBlock }) => {
        if (value.text) {
          return (
            <aside className="rounded-2xl border-2 border-rose bg-rose-soft p-5" aria-label="From Arka's household">
              <p className="flex items-center gap-2 label text-rose-ink">
                <HeartHandshake aria-hidden className="size-4" /> From Arka&apos;s household
              </p>
              <p className="mt-2 whitespace-pre-line">{value.text}</p>
            </aside>
          )
        }
        if (process.env.NODE_ENV === 'production') return null
        return (
          <aside className="rounded-2xl border-2 border-dashed border-rose p-5 text-sm text-ink-muted">
            <span className="label text-rose-ink">Dev only · Human&apos;s note (hidden until filled in)</span>
            <p className="mt-1">{value.prompt}</p>
          </aside>
        )
      },
      clip: ({ value }: { value: ClipBlock }) => (
        <figure className="mx-auto max-w-sm!">
          <div className="rounded-print bg-frame p-1.5 shadow-print">
            <ArkaVideo video={value.video} posterSrc={imageUrl(value.video.poster, 640)} ambient className="rounded-[0.25rem]" />
          </div>
          {value.caption ? <figcaption className="mt-3 text-center text-sm text-ink-muted">{value.caption}</figcaption> : null}
        </figure>
      ),
      embed: ({ value }: { value: EmbedBlock }) => <LiteEmbed url={value.url} title={value.title} />,
      pawDivider: () => (
        <div aria-hidden className="flex justify-center gap-4 py-4 text-lavender">
          <PawIcon className="size-4" />
          <PawIcon className="size-4 -translate-y-1.5" />
          <PawIcon className="size-4" />
        </div>
      ),
    },
  }
}

export function PortableBody({
  value,
  toc,
  className,
  dropcap = true,
}: {
  value: BodyBlock[]
  toc: TocItem[]
  className?: string
  dropcap?: boolean
}) {
  return (
    <div className={cn('prose-arka', dropcap && 'dropcap', className)}>
      <PortableText value={value as never} components={components(toc)} />
    </div>
  )
}
