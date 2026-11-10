'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/content/types'
import { cn } from '@/lib/utils'

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const headings = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el))
    if (!headings.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [ids])
  return active
}

function TocList({ items, active }: { items: TocItem[]; active: string | null }) {
  return (
    <ol className="flex flex-col gap-1 border-l border-line">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? 'location' : undefined}
            className={cn(
              '-ml-px block border-l-2 border-transparent py-1.5 text-[0.92rem] leading-snug text-ink-muted transition-colors hover:text-ink',
              item.level === 3 ? 'pl-7' : 'pl-4',
              'aria-[current=location]:border-lavender-ink aria-[current=location]:font-semibold aria-[current=location]:text-ink',
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

/** Sticky outline on wide screens; a collapsible "In this story" on small ones. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items.map((item) => item.id))
  if (items.length < 3) return null
  return (
    <>
      <details className="group mb-10 rounded-2xl border border-line-strong bg-surface p-4 xl:hidden">
        <summary className="cursor-pointer list-none label text-ink-muted marker:hidden">
          <span className="inline-flex items-center gap-2">
            In this story{' '}
            <span aria-hidden className="transition-transform group-open:rotate-90">
              ›
            </span>
          </span>
        </summary>
        <nav aria-label="In this story" className="mt-4">
          <TocList items={items} active={active} />
        </nav>
      </details>
      <nav aria-label="On this page" className="sticky top-28 hidden max-h-[calc(100dvh-9rem)] overflow-y-auto xl:block">
        <p className="mb-4 label text-ink-muted">In this story</p>
        <TocList items={items} active={active} />
      </nav>
    </>
  )
}
