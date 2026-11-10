'use client'

import { createContext, lazy, type ReactNode, Suspense, useContext, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Exhibit } from './types'

// The dialog, its focus trap and the full-size media only load when someone opens an exhibit.
const LightboxDialog = lazy(() => import('./lightbox-dialog'))

interface LightboxContextValue {
  open: (index: number) => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function useLightbox() {
  const value = useContext(LightboxContext)
  if (!value) throw new Error('useLightbox must be used inside <LightboxProvider>')
  return value
}

/**
 * Accessible lightbox for The Arka Files: modal dialog with focus trap and focus
 * return, Esc to close, ←/→ (and swipe) to move between exhibits.
 */
export function LightboxProvider({ items, children }: { items: Exhibit[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null)
  const [wanted, setWanted] = useState(false)
  const context = useMemo(
    () => ({
      open: (i: number) => {
        setWanted(true)
        setIndex(i)
      },
    }),
    [],
  )

  return (
    <LightboxContext.Provider value={context}>
      {children}
      {wanted ? (
        <Suspense fallback={null}>
          <LightboxDialog items={items} index={index} onIndexChange={setIndex} />
        </Suspense>
      ) : null}
    </LightboxContext.Provider>
  )
}

/**
 * Makes a server-rendered thumbnail open the lightbox: a full-size, labelled button
 * laid over the thumbnail (so the thumbnail markup can stay a real <figure>).
 */
export function ExhibitTrigger({
  index,
  label,
  children,
  className,
}: {
  index: number
  label: string
  children: ReactNode
  className?: string
}) {
  const { open } = useLightbox()
  return (
    <div className={cn('group relative', className)}>
      {children}
      <button
        type="button"
        onClick={() => open(index)}
        aria-label={label}
        className="absolute inset-0 z-10 cursor-zoom-in rounded-print"
      />
    </div>
  )
}
