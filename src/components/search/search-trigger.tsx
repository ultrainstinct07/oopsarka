'use client'

import { Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const SearchDialog = dynamic(() => import('./search-dialog').then((m) => m.SearchDialog), { ssr: false })

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * A real link to /search that upgrades to the instant-search dialog once JavaScript
 * is ready. ⌘K / Ctrl+K / "/" open it from anywhere. The dialog code loads on intent.
 */
export function SearchTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [wanted, setWanted] = useState(false)
  const triggerRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const combo = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
      const slash = event.key === '/' && !isTypingTarget(event.target)
      if (combo || slash) {
        event.preventDefault()
        setWanted(true)
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <a
        ref={triggerRef}
        href="/search"
        aria-keyshortcuts="Meta+K Control+K /"
        onPointerEnter={() => setWanted(true)}
        onFocus={() => setWanted(true)}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return
          event.preventDefault()
          setWanted(true)
          setOpen(true)
        }}
        className={cn(
          'press inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong bg-surface px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-bg-deep',
          className,
        )}
      >
        <Search aria-hidden className="size-4" />
        <span className="sr-only sm:not-sr-only">Search</span>
        <kbd aria-hidden className="hidden rounded border border-line px-1.5 font-sans text-[0.7rem] text-ink-muted xl:inline">
          ⌘K
        </kbd>
      </a>
      {wanted ? <SearchDialog open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} /> : null}
    </>
  )
}
