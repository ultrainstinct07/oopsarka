'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'

function embedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}?autoplay=1&rel=0`
    if (host === 'youtube.com') {
      const id = parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop()
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null
    }
    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` : null
    }
  } catch {
    return null
  }
  return null
}

/** Click-to-load video embed: no third-party requests until the reader asks for it. */
export function LiteEmbed({ url, title }: { url: string; title: string }) {
  const [active, setActive] = useState(false)
  const src = embedUrl(url)
  if (!src) return null
  const provider = src.includes('vimeo') ? 'Vimeo' : 'YouTube'
  return (
    <figure className="breakout">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
        {active ? (
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 text-bg"
          >
            <span className="grid size-16 place-items-center rounded-full bg-butter text-on-fill transition-transform group-hover:scale-105">
              <Play aria-hidden className="size-7 fill-current" />
            </span>
            <span className="font-display text-xl font-semibold">{title}</span>
            <span className="text-sm opacity-75">
              Plays from {provider}. Loading it shares your visit with {provider}.
            </span>
          </button>
        )}
      </div>
    </figure>
  )
}
