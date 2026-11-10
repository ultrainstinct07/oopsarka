'use client'

import { Dialog } from '@base-ui/react/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { ArkaImage } from '@/components/media/arka-image'
import { ArkaVideo } from '@/components/media/arka-video'
import { formatLongDate } from '@/lib/utils'
import type { Exhibit } from './types'

/** The lightbox itself — loaded the first time an exhibit is opened. */
export default function LightboxDialog({
  items,
  index,
  onIndexChange,
}: {
  items: Exhibit[]
  index: number | null
  onIndexChange: (index: number | null) => void
}) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const open = index !== null
  const count = items.length
  const item = index === null ? null : items[index]
  const go = useCallback(
    (delta: number) => {
      if (index === null) return
      onIndexChange((index + delta + count) % count)
    },
    [index, count, onIndexChange],
  )

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onIndexChange(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#141a2e]/92 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className="fixed inset-0 z-50 flex flex-col text-[#f3efe7] transition-opacity duration-200 outline-none data-ending-style:opacity-0 data-starting-style:opacity-0"
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              go(1)
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault()
              go(-1)
            }
          }}
        >
          {item ? (
            <>
              <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <p className="label text-[#c3bdb3]">
                  Exhibit {item.letter}{' '}
                  <span className="opacity-60">
                    · {index! + 1} of {count}
                  </span>
                </p>
                <Dialog.Close
                  aria-label="Close"
                  className="press inline-grid size-11 place-items-center rounded-full border border-white/25 hover:bg-white/10"
                >
                  <X aria-hidden className="size-5" />
                </Dialog.Close>
              </div>

              <div
                className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
                onPointerDown={(event) => {
                  pointerStart.current = { x: event.clientX, y: event.clientY }
                }}
                onPointerUp={(event) => {
                  const start = pointerStart.current
                  pointerStart.current = null
                  if (!start) return
                  const dx = event.clientX - start.x
                  const dy = event.clientY - start.y
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1)
                }}
              >
                <div
                  key={item.id}
                  className="h-full max-h-[min(78dvh,60rem)] motion-ok:animate-in motion-ok:fade-in-0 motion-ok:zoom-in-95"
                >
                  {item.kind === 'photo' ? (
                    <ArkaImage
                      image={item.image}
                      sizes="(min-width: 1024px) 60vw, 92vw"
                      className="h-full max-h-[min(78dvh,60rem)] w-auto max-w-[92vw] rounded-md bg-transparent"
                      imgClassName="object-contain"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <ArkaVideo
                      video={item.video}
                      posterSrc={item.posterSrc}
                      className="h-full max-h-[min(78dvh,60rem)] w-auto max-w-[92vw] rounded-md"
                    />
                  )}
                </div>

                {count > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Previous exhibit"
                      className="press absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#141a2e]/60 hover:bg-white/10 sm:grid"
                    >
                      <ChevronLeft aria-hidden className="size-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label="Next exhibit"
                      className="press absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#141a2e]/60 hover:bg-white/10 sm:grid"
                    >
                      <ChevronRight aria-hidden className="size-6" />
                    </button>
                  </>
                ) : null}
              </div>

              <div
                className="mx-auto w-full max-w-3xl px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center"
                aria-live="polite"
              >
                <Dialog.Title className="font-display text-2xl font-semibold sm:text-3xl">{item.title}</Dialog.Title>
                {item.caption ? <Dialog.Description className="mt-2 text-[#c3bdb3]">{item.caption}</Dialog.Description> : null}
                {item.date ? <p className="mt-1 text-sm text-[#c3bdb3]/80">Taken {formatLongDate(item.date)}</p> : null}
                {count > 1 ? (
                  <div className="mt-4 flex justify-center gap-3 sm:hidden">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      className="press inline-flex min-h-11 items-center gap-1 rounded-pill border border-white/25 px-4"
                    >
                      <ChevronLeft aria-hidden className="size-4" /> Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      className="press inline-flex min-h-11 items-center gap-1 rounded-pill border border-white/25 px-4"
                    >
                      Next <ChevronRight aria-hidden className="size-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
