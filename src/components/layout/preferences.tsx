'use client'

import { Moon, Sparkles, Sun, Wind } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

export const THEME_KEY = 'oopsarka:theme'
export const CALM_KEY = 'oopsarka:calm'

/** Runs before first paint (see layout.tsx) so there's no flash of the wrong theme. */
export const preferencesScript = `(function(){try{var d=document.documentElement;if(localStorage.getItem('${THEME_KEY}')==='night')d.setAttribute('data-theme','night');if(localStorage.getItem('${CALM_KEY}')==='true')d.setAttribute('data-calm','true')}catch(e){}})()`

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-calm'] })
  return () => observer.disconnect()
}

function useHtmlAttribute(name: 'data-theme' | 'data-calm', fallback: string) {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute(name) ?? fallback,
    () => fallback,
  )
}

function persist(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* private mode — the toggle still works for this visit */
  }
}

const toggleClass =
  'press inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong px-4 text-sm font-semibold text-ink transition-colors hover:bg-bg-deep aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useHtmlAttribute('data-theme', 'light')
  const night = theme === 'night'
  return (
    <button
      type="button"
      aria-pressed={night}
      className={cn(toggleClass, className)}
      onClick={() => {
        const next = night ? 'light' : 'night'
        document.documentElement.setAttribute('data-theme', next)
        persist(THEME_KEY, next === 'night' ? 'night' : null)
      }}
    >
      {night ? <Moon aria-hidden className="size-4" /> : <Sun aria-hidden className="size-4" />}3 AM mode
    </button>
  )
}

export function CalmToggle({ className }: { className?: string }) {
  const calm = useHtmlAttribute('data-calm', 'false') === 'true'
  return (
    <button
      type="button"
      aria-pressed={calm}
      className={cn(toggleClass, className)}
      onClick={() => {
        if (calm) document.documentElement.removeAttribute('data-calm')
        else document.documentElement.setAttribute('data-calm', 'true')
        persist(CALM_KEY, calm ? null : 'true')
      }}
    >
      {calm ? <Wind aria-hidden className="size-4" /> : <Sparkles aria-hidden className="size-4" />}
      Calm mode
      <span className="sr-only">(stops animations and moving elements)</span>
    </button>
  )
}
