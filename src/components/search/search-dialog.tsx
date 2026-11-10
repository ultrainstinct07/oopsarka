'use client'

import type { Route } from 'next'
import { Autocomplete } from '@base-ui/react/autocomplete'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'
import type MiniSearch from 'minisearch'
import { useRouter } from 'next/navigation'
import { type RefObject, useEffect, useMemo, useState } from 'react'
import { loadSearchIndex, runSearch, type SearchHit } from '@/lib/content/search'
import type { SearchDocument } from '@/lib/content/source'
import { formatDate } from '@/lib/utils'
import { Highlight } from './highlight'

interface IndexPayload {
  index: string
  recent: SearchHit[]
}

type Status = 'loading' | 'ready' | 'error'

let indexPromise: Promise<{ index: MiniSearch<SearchDocument>; recent: SearchHit[] }> | undefined

function loadIndex() {
  indexPromise ??= fetch('/search-index.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Search index unavailable (${response.status})`)
      return response.json() as Promise<IndexPayload>
    })
    .then((payload) => ({ index: loadSearchIndex(payload.index), recent: payload.recent }))
    .catch((error) => {
      indexPromise = undefined
      throw error
    })
  return indexPromise
}

export function SearchDialog({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusTo: RefObject<HTMLElement | null>
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [failedAttempt, setFailedAttempt] = useState<number | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [data, setData] = useState<{ index: MiniSearch<SearchDocument>; recent: SearchHit[] } | null>(null)
  const status: Status = data ? 'ready' : failedAttempt === attempt ? 'error' : 'loading'

  useEffect(() => {
    if (!open || data) return
    let cancelled = false
    loadIndex()
      .then((loaded) => !cancelled && setData(loaded))
      .catch(() => !cancelled && setFailedAttempt(attempt))
    return () => {
      cancelled = true
    }
  }, [open, data, attempt])

  const trimmed = query.trim()
  const results = useMemo(() => {
    if (!data) return []
    return trimmed ? runSearch(data.index, trimmed).slice(0, 8) : data.recent
  }, [data, trimmed])

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href as Route)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/35 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden px-3 pt-[min(12vh,7rem)] pb-3">
          <Dialog.Popup
            finalFocus={returnFocusTo}
            aria-label="Search the diary"
            className="relative flex max-h-[min(40rem,calc(100dvh-4rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface text-ink shadow-[0_30px_80px_-30px_rgb(36_33_31/0.55)] transition-[opacity,translate,scale] duration-200 ease-[var(--ease-out-soft)] data-ending-style:-translate-y-2 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:-translate-y-2 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
          >
            <Autocomplete.Root
              open
              inline
              items={results}
              filter={null}
              value={query}
              onValueChange={setQuery}
              itemToStringValue={(item: SearchHit) => item.title}
              autoHighlight="always"
              keepHighlight
            >
              <div className="flex items-center gap-3 border-b border-line px-5">
                <Search aria-hidden className="size-5 shrink-0 text-ink-muted" />
                <Autocomplete.Input
                  aria-label="Search stories"
                  aria-describedby="search-dialog-help"
                  placeholder="Search zoomies, boxes, grooming…"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && trimmed && results.length === 0) go(`/search?q=${encodeURIComponent(trimmed)}`)
                  }}
                  className="h-16 w-full border-0 bg-transparent font-display text-xl outline-none placeholder:text-ink-muted/80 focus-visible:shadow-none focus-visible:outline-none"
                />
                <Dialog.Close className="shrink-0 rounded-md border border-line px-2 py-1 label text-ink-muted">Esc</Dialog.Close>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2" aria-live="polite">
                {status === 'loading' ? <p className="px-4 py-8 text-ink-muted">Fetching the case files…</p> : null}
                {status === 'error' ? (
                  <p className="px-4 py-8 text-ink-muted">
                    Search couldn&apos;t load.{' '}
                    <button
                      type="button"
                      className="font-semibold text-lavender-ink underline"
                      onClick={() => setAttempt((n) => n + 1)}
                    >
                      Try again
                    </button>{' '}
                    or use the{' '}
                    <a className="text-lavender-ink underline" href={`/search?q=${encodeURIComponent(trimmed)}`}>
                      full search page
                    </a>
                    .
                  </p>
                ) : null}
                {status === 'ready' ? (
                  <>
                    <p className="px-3 pt-2 pb-1 label text-ink-muted">
                      {trimmed ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}` : 'Latest from the diary'}
                    </p>
                    <Autocomplete.Empty>
                      <p className="px-4 py-8 text-ink-muted">Arka searched under the sofa. Nothing for “{trimmed}”.</p>
                    </Autocomplete.Empty>
                    <Autocomplete.List className="flex flex-col gap-1">
                      {(hit: SearchHit) => (
                        <Autocomplete.Item
                          key={hit.slug}
                          value={hit}
                          onClick={() => go(`/diary/${hit.slug}`)}
                          className="group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 rounded-xl px-4 py-3 outline-none data-highlighted:bg-lavender-soft"
                        >
                          <span className="min-w-0">
                            <span className="block label text-[0.68rem] text-ink-muted">
                              {hit.category} · {formatDate(hit.publishedAt)}
                            </span>
                            <span className="mt-1 block truncate font-display text-lg font-semibold">
                              <Highlight text={hit.title} terms={hit.terms} />
                            </span>
                            <span className="mt-0.5 line-clamp-1 text-sm text-ink-muted">
                              <Highlight text={hit.excerpt} terms={hit.terms} />
                            </span>
                          </span>
                          <CornerDownLeft
                            aria-hidden
                            className="size-4 text-ink-muted opacity-0 group-data-highlighted:opacity-100"
                          />
                        </Autocomplete.Item>
                      )}
                    </Autocomplete.List>
                  </>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-line bg-bg px-5 py-3 text-sm">
                <span id="search-dialog-help" className="text-ink-muted">
                  <span className="hidden sm:inline">↑ ↓ to move · Enter to open · </span>Esc to close
                </span>
                <button
                  type="button"
                  onClick={() => go(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')}
                  className="link-draw inline-flex items-center gap-1 font-semibold text-lavender-ink"
                >
                  {trimmed ? 'See all results' : 'Open search page'} <ArrowRight aria-hidden className="size-4" />
                </button>
              </div>
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
