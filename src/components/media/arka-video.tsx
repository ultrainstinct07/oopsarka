'use client'

import { Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotionPreference, useSaveData } from '@/hooks/use-preferences'
import type { ArkaVideo as ArkaVideoData } from '@/lib/content/types'
import { cn } from '@/lib/utils'

interface ArkaVideoProps {
  video: ArkaVideoData
  /** Pre-sized poster URL (computed on the server). */
  posterSrc: string
  /** Loop silently while in view — only when motion is allowed. */
  ambient?: boolean
  /** Show our own "Play clip" button when not autoplaying. Off when the clip sits inside another control. */
  playButton?: boolean
  /** Crop to this aspect ratio (width / height) instead of the clip's own. */
  aspect?: number
  className?: string
}

/**
 * Silent clips of Arka. Never autoplays with sound, never downloads until needed
 * (the poster still is lazy-loaded too), and with reduced motion (or Calm mode)
 * shows the poster with a play button instead.
 */
export function ArkaVideo({ video, posterSrc, ambient = false, playButton = true, aspect, className }: ArkaVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotionPreference()
  const saveData = useSaveData()
  const [started, setStarted] = useState(false)
  // Data saver counts like reduced motion: poster and a play button, nothing downloads until asked.
  const autoplay = ambient && !reduced && !saveData

  useEffect(() => {
    const el = ref.current
    if (!el || !autoplay) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      el.pause()
    }
  }, [autoplay])

  const showControls = !autoplay && started

  return (
    <div
      className={cn('relative overflow-hidden bg-bg-deep', className)}
      style={{ aspectRatio: aspect ? String(aspect) : `${video.width} / ${video.height}` }}
    >
      {/* The still sits under the video as a lazy image: a `poster` attribute is fetched on page load wherever the clip is. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- posterSrc is already an optimised, sized URL */}
      <img src={posterSrc} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        controls={showControls}
        aria-label={video.description}
        disablePictureInPicture
      >
        <source src={video.src} type="video/mp4" />
      </video>
      {playButton && !autoplay && !started ? (
        <button
          type="button"
          onClick={() => {
            setStarted(true)
            ref.current?.play().catch(() => {})
          }}
          className="press group absolute inset-0 grid place-items-center bg-ink/10 transition-colors hover:bg-ink/20"
        >
          <span className="sticker gap-2 py-2 pr-4 pl-3 label text-[0.7rem]">
            <Play aria-hidden className="size-4 fill-current" /> Play clip
          </span>
          <span className="sr-only">: {video.description}</span>
        </button>
      ) : null}
    </div>
  )
}
