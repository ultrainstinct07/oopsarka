'use client'

import { type ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { ExhibitTrigger, LightboxProvider } from './lightbox'
import type { Exhibit } from './types'

type Filter = 'all' | 'photo' | 'video'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All evidence' },
  { value: 'photo', label: 'Photos' },
  { value: 'video', label: 'Clips' },
]

/**
 * The full Arka Files grid. Thumbnails are rendered on the server and passed in;
 * this only handles the filter chips and the lightbox. Without JavaScript every
 * exhibit is simply shown.
 */
export function GalleryGrid({ exhibits, thumbs, labels }: { exhibits: Exhibit[]; thumbs: ReactNode[]; labels: string[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const counts = {
    all: exhibits.length,
    photo: exhibits.filter((e) => e.kind === 'photo').length,
    video: exhibits.filter((e) => e.kind === 'video').length,
  }
  const visible = exhibits
    .map((exhibit, index) => ({ exhibit, index }))
    .filter(({ exhibit }) => filter === 'all' || exhibit.kind === filter)

  return (
    <LightboxProvider items={exhibits}>
      <div role="group" aria-label="Filter the evidence" className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            disabled={counts[value] === 0}
            className="press inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-bg-deep disabled:opacity-50 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg"
          >
            {label} <span className="tabular-nums opacity-70">{counts[value]}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} of {exhibits.length} exhibits.
      </p>
      <ul data-reveal-stagger="pop" className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ exhibit, index }, position) => (
          <li
            key={exhibit.id}
            className={cn(
              position % 2 === 1 && 'sm:max-lg:translate-y-8',
              position % 3 === 1 && 'lg:translate-y-10',
              position % 3 === 0 ? 'lg:-rotate-1' : 'lg:rotate-1',
            )}
          >
            <ExhibitTrigger index={index} label={labels[index]}>
              {thumbs[index]}
            </ExhibitTrigger>
          </li>
        ))}
      </ul>
    </LightboxProvider>
  )
}
