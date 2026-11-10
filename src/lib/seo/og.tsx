import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import type { ArkaImage } from '@/lib/content/types'
import { sanityImageUrl } from '@/sanity/image'

export const OG_SIZE = { width: 1200, height: 630 }

const fontsPromise = Promise.all([
  readFile(join(process.cwd(), 'assets/og/Fraunces-SemiBold.ttf')),
  readFile(join(process.cwd(), 'assets/og/Fraunces-SemiBoldItalic.ttf')),
  readFile(join(process.cwd(), 'assets/og/Manrope-SemiBold.ttf')),
])

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
}

/** An image as a data URL Satori can draw (local file, or Sanity CDN as JPEG). */
export async function ogImageData(image: ArkaImage, width = 720, aspect = 4 / 5) {
  try {
    if (image.kind === 'sanity' && image.sanity) {
      const url = `${sanityImageUrl(image.sanity, width, aspect, 80)}&fm=jpg`
      const response = await fetch(url)
      if (!response.ok) return null
      return `data:image/jpeg;base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`
    }
    const ext = image.src.split('.').pop()?.toLowerCase() ?? 'jpg'
    const file = await readFile(join(process.cwd(), 'public', image.src))
    return `data:${MIME[ext] ?? 'image/jpeg'};base64,${file.toString('base64')}`
  } catch {
    return null
  }
}

const C = {
  ivory: '#f8f5ef',
  ink: '#24211f',
  muted: '#5b5550',
  lavender: '#c7b9e8',
  lavenderInk: '#5f4b9b',
  butter: '#f3d875',
  white: '#ffffff',
}

function Ears({ color }: { color: string }) {
  return (
    <svg width="300" height="100" viewBox="0 0 120 40" style={{ position: 'absolute', top: -84, left: 36 }}>
      <path d="M6 40C8 26 12 12 18 5c2-3 6-3 8-1 8 7 17 16 24 27 1 2 0 5-3 5H9c-2 0-3-2-3-4Z" fill={color} />
      <path d="M114 40c-2-14-6-28-12-35-2-3-6-3-8-1-8 7-17 16-24 27-1 2 0 5 3 5h38c2 0 3-2 3-4Z" fill={color} />
      <path d="M17 32c1-6 3-12 6-16 5 4 9 9 13 16Z" fill="#e7b8b0" />
      <path d="M103 32c-1-6-3-12-6-16-5 4-9 9-13 16Z" fill="#e7b8b0" />
    </svg>
  )
}

export async function renderOgCard({
  eyebrow,
  title,
  italic,
  footer,
  image,
  imageFocal,
}: {
  eyebrow: string
  title: string
  italic?: string
  footer: string
  image: string | null
  imageFocal?: { x: number; y: number }
}) {
  const [fraunces, frauncesItalic, manrope] = await fontsPromise
  const long = title.length > 48
  return new ImageResponse(
    <div
      style={{ width: '100%', height: '100%', display: 'flex', background: C.ivory, position: 'relative', fontFamily: 'Manrope' }}
    >
      <div
        style={{
          position: 'absolute',
          right: -120,
          top: -80,
          width: 640,
          height: 640,
          borderRadius: 9999,
          background: '#ebe5f7',
          display: 'flex',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 0 56px 72px',
          width: image ? 690 : 1056,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: 'Fraunces', fontSize: 40, color: C.ink }}>
          <span style={{ fontFamily: 'Fraunces Italic', color: C.lavenderInk }}>Oops</span>
          <span>Arka</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '8px 18px',
              borderRadius: 999,
              background: C.butter,
              color: C.ink,
              fontSize: 20,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: 26,
              fontFamily: 'Fraunces',
              fontSize: long ? 62 : 78,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: C.ink,
            }}
          >
            {italic ? (
              <span style={{ fontFamily: 'Fraunces Italic', color: C.lavenderInk, marginRight: 18 }}>{italic}</span>
            ) : null}
            <span>{title}</span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: C.muted }}>{footer}</div>
      </div>
      {image ? (
        <div style={{ position: 'absolute', right: 70, top: 78, display: 'flex', transform: 'rotate(-3deg)' }}>
          <div
            style={{
              position: 'absolute',
              left: -26,
              top: 16,
              right: -26,
              bottom: -26,
              background: C.lavender,
              borderRadius: 36,
              display: 'flex',
            }}
          />
          <Ears color={C.lavender} />
          <div
            style={{
              display: 'flex',
              padding: 12,
              background: C.white,
              borderRadius: 8,
              boxShadow: '0 18px 40px -20px rgba(36,33,31,0.5)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              width={348}
              height={436}
              alt=""
              style={{
                objectFit: 'cover',
                objectPosition: imageFocal ? `${imageFocal.x * 100}% ${imageFocal.y * 100}%` : '50% 40%',
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Fraunces', data: fraunces, weight: 600, style: 'normal' },
        { name: 'Fraunces Italic', data: frauncesItalic, weight: 600, style: 'normal' },
        { name: 'Manrope', data: manrope, weight: 600, style: 'normal' },
      ],
    },
  )
}
