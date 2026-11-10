'use client'

import { RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { PawIcon } from '@/components/media/doodles'

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="shell flex flex-col items-center py-24 text-center sm:py-32">
      <PawIcon className="size-12 text-lavender-ink" />
      <h1 className="mt-6 font-display text-headline font-semibold">Something got knocked over.</h1>
      <p className="mt-4 max-w-[46ch] text-lede text-ink-muted">
        This part of the page didn&apos;t load. It&apos;s probably temporary — try again, or head back to the diary.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="press inline-flex min-h-12 items-center gap-2 rounded-pill bg-ink px-6 font-bold text-bg"
        >
          <RotateCcw aria-hidden className="size-4" /> Try again
        </button>
        <Link href="/diary" className="press inline-flex min-h-12 items-center rounded-pill border-2 border-ink px-6 font-bold">
          Go to the diary
        </Link>
      </div>
      {error.digest ? <p className="mt-8 text-xs text-ink-muted">Reference: {error.digest}</p> : null}
    </section>
  )
}
