'use client'

import { lazy, Suspense, useRef, useState } from 'react'

// The dialog (and its focus-trap library) is only downloaded when the menu is wanted.
const MobileMenuDialog = lazy(() => import('./mobile-menu-dialog'))

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [wanted, setWanted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={() => setWanted(true)}
        onFocus={() => setWanted(true)}
        onClick={() => {
          setWanted(true)
          setOpen(true)
        }}
        className="press group inline-grid size-11 place-items-center rounded-pill border border-line-strong bg-surface text-ink"
      >
        <span aria-hidden className="flex w-5 flex-col items-end gap-[5px]">
          <span className="h-[2px] w-5 rounded-full bg-current" />
          <span className="h-[2px] w-3.5 rounded-full bg-current transition-[width] duration-200 group-hover:w-5" />
          <span className="h-[2px] w-4 rounded-full bg-current" />
        </span>
      </button>
      {wanted ? (
        <Suspense fallback={null}>
          <MobileMenuDialog open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} />
        </Suspense>
      ) : null}
    </>
  )
}
