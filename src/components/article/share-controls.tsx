'use client'

import { Check, Link2, Mail, Share2 } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

/** Plain intent links — no third-party scripts, no tracking pixels. */
function intents(url: string, title: string, image?: string) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return [
    { label: 'X', href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { label: 'Bluesky', href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    ...(image
      ? [
          {
            label: 'Pinterest',
            href: `https://pinterest.com/pin/create/button/?url=${u}&media=${encodeURIComponent(image)}&description=${t}`,
          },
        ]
      : []),
  ]
}

const pill =
  'press inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-bg-deep'

export function ShareControls({ url, title, image }: { url: string; title: string; image?: string }) {
  const [copied, setCopied] = useState(false)
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === 'function',
    () => false,
  )
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <div>
      <p className="label text-ink-muted">Share this incident</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {canShare ? (
          <li>
            <button
              type="button"
              className={cn(pill, 'bg-butter text-on-fill')}
              onClick={() => navigator.share({ title, url }).catch(() => {})}
            >
              <Share2 aria-hidden className="size-4" /> Share…
            </button>
          </li>
        ) : null}
        <li>
          <button
            type="button"
            className={pill}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
              } catch {
                setCopied(false)
              }
            }}
          >
            {copied ? <Check aria-hidden className="size-4 text-success" /> : <Link2 aria-hidden className="size-4" />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </li>
        {intents(url, title, image).map((intent) => (
          <li key={intent.label}>
            <a className={pill} href={intent.href} target="_blank" rel="noopener noreferrer">
              {intent.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
        <li>
          <a className={pill} href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}>
            <Mail aria-hidden className="size-4" /> Email
          </a>
        </li>
      </ul>
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </p>
    </div>
  )
}
