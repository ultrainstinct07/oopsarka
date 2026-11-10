'use client'

import { Dialog } from '@base-ui/react/dialog'
import { ArrowUpRight, Search } from 'lucide-react'
import Link from 'next/link'
import type { RefObject } from 'react'
import { PawIcon } from '@/components/media/doodles'
import { nav } from '@/lib/site'
import { CalmToggle, ThemeToggle } from './preferences'
import { WordmarkText } from './wordmark'

/** Full-screen menu for small screens: focus-trapped, Esc to close, scroll locked. Loaded on first use. */
export default function MobileMenuDialog({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusTo: RefObject<HTMLElement | null>
}) {
  const close = () => onOpenChange(false)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Popup
          finalFocus={returnFocusTo}
          className="grain fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg text-ink transition-[opacity,translate] duration-300 ease-[var(--ease-out-soft)] data-ending-style:-translate-y-2 data-ending-style:opacity-0 data-starting-style:-translate-y-2 data-starting-style:opacity-0"
        >
          <div className="shell relative z-10 flex h-16 items-center justify-between">
            <Link href="/" onClick={close} className="text-[1.65rem]" aria-label="OopsArka — home">
              <WordmarkText />
            </Link>
            <Dialog.Close
              aria-label="Close menu"
              className="press inline-grid size-11 place-items-center rounded-pill border border-line-strong bg-surface"
            >
              <span aria-hidden className="relative block size-5">
                <span className="absolute top-1/2 left-0 h-[2px] w-5 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute top-1/2 left-0 h-[2px] w-5 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <Dialog.Description className="sr-only">Site navigation and display preferences.</Dialog.Description>

          <nav aria-label="Mobile" className="shell relative z-10 mt-6 flex-1">
            <ul className="stagger-in flex flex-col">
              {nav.map((item, index) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    onClick={close}
                    className="group flex items-center justify-between py-4 font-display text-[2.1rem] leading-tight font-semibold tracking-tight"
                  >
                    <span>
                      <span className="mr-3 align-middle font-sans text-xs font-bold text-ink-muted tabular-nums">
                        0{index + 1}
                      </span>
                      {item.label}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-6 text-ink-muted transition-transform group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                onClick={close}
                className="press inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong px-5 font-semibold"
              >
                <Search aria-hidden className="size-4" /> Search the diary
              </Link>
              <Link
                href="/newsletter"
                onClick={close}
                className="press inline-flex min-h-11 items-center gap-2 rounded-pill bg-butter px-5 font-semibold text-on-fill"
              >
                <PawIcon className="size-4" /> Follow the chaos
              </Link>
            </div>
          </nav>

          <div className="shell relative z-10 mt-10 mb-[max(2rem,env(safe-area-inset-bottom))] flex flex-wrap gap-3 border-t border-line pt-6">
            <ThemeToggle />
            <CalmToggle />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
