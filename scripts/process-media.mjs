#!/usr/bin/env node
/**
 * Media pipeline for the local (pre-Sanity) content source.
 *
 *   npm run media                 # import the original files in /Photos
 *   FFMPEG_PATH=/path/to/ffmpeg npm run media
 *
 * What it does:
 *   - copies photos into public/images/arka with descriptive names
 *   - removes audio from clips, crops burned-in captions, adds +faststart
 *   - extracts poster frames and a few sharp stills from the clips
 *   - writes src/content/local/media.generated.json (dimensions, LQIP blur, dominant colour)
 *
 * The originals in /Photos are never modified.
 * Requires ffmpeg on PATH (or FFMPEG_PATH). Image metadata uses `sharp`, which ships with Next.js.
 */
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const src = (f) => path.join(root, 'Photos', f)
const imgOut = path.join(root, 'public', 'images', 'arka')
const vidOut = path.join(root, 'public', 'media', 'arka')
const manifestPath = path.join(root, 'src', 'content', 'local', 'media.generated.json')
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg'

const PHOTOS = [
  { key: 'night-patrol', from: 'WhatsApp Image 2026-10-25 at 2.48.18 PM.jpeg' },
  { key: 'blanket-stare', from: 'WhatsApp Image 2026-10-25 at 2.47.57 PM.jpeg' },
  { key: 'blanket-lookup', from: 'WhatsApp Image 2026-10-25 at 2.47.57 PM (1).jpeg' },
]

const CLIPS = [
  {
    key: 'office-chair',
    from: 'WhatsApp Video 2026-10-25 at 2.48.11 PM.mp4',
    // The source has a burned-in chat caption at ~84–89% height; keep the clean top 696px.
    filters: 'crop=464:696:0:0',
    poster: 0.6,
  },
  {
    key: 'rooftop-complaint',
    from: 'WhatsApp Video 2026-10-25 at 2.48.16 PM.mp4',
    filters: null, // stream-copy video, drop audio
    poster: 1.1,
    stills: [
      { key: 'rooftop-harness', at: 1.1 },
      { key: 'rooftop-midmeow', at: 2.8 },
      { key: 'rooftop-full-complaint', at: 4.9 },
    ],
  },
]

function run(args) {
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
}

async function describe(file, publicPath) {
  const image = sharp(file)
  const meta = await image.metadata()
  const { dominant } = await image.stats()
  const blur = await sharp(file).resize(16).webp({ quality: 40 }).toBuffer()
  const hex = (n) => n.toString(16).padStart(2, '0')
  return {
    src: publicPath,
    width: meta.width,
    height: meta.height,
    lqip: `data:image/webp;base64,${blur.toString('base64')}`,
    dominant: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
  }
}

async function main() {
  try {
    execFileSync(ffmpeg, ['-version'], { stdio: 'ignore' })
  } catch {
    console.error(`ffmpeg not found (looked for "${ffmpeg}"). Install it or set FFMPEG_PATH.`)
    process.exit(1)
  }
  await mkdir(imgOut, { recursive: true })
  await mkdir(vidOut, { recursive: true })
  await mkdir(path.dirname(manifestPath), { recursive: true })

  const manifest = { images: {}, videos: {} }

  for (const photo of PHOTOS) {
    if (!existsSync(src(photo.from))) throw new Error(`Missing source photo: ${photo.from}`)
    const out = path.join(imgOut, `arka-${photo.key}.jpg`)
    await copyFile(src(photo.from), out)
    manifest.images[photo.key] = await describe(out, `/images/arka/arka-${photo.key}.jpg`)
  }

  for (const clip of CLIPS) {
    if (!existsSync(src(clip.from))) throw new Error(`Missing source clip: ${clip.from}`)
    const out = path.join(vidOut, `arka-${clip.key}.mp4`)
    const video = clip.filters
      ? ['-vf', clip.filters, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p']
      : ['-c:v', 'copy']
    run(['-i', src(clip.from), ...video, '-an', '-movflags', '+faststart', out])

    const posterKey = `${clip.key}-poster`
    const posterOut = path.join(imgOut, `arka-${posterKey}.jpg`)
    const vf = [clip.filters, 'unsharp=5:5:0.5'].filter(Boolean).join(',')
    run(['-ss', String(clip.poster), '-i', src(clip.from), '-frames:v', '1', '-vf', vf, '-q:v', '2', posterOut])
    manifest.images[posterKey] = await describe(posterOut, `/images/arka/arka-${posterKey}.jpg`)

    for (const still of clip.stills ?? []) {
      const stillOut = path.join(imgOut, `arka-${still.key}.jpg`)
      run(['-ss', String(still.at), '-i', src(clip.from), '-frames:v', '1', '-vf', 'unsharp=5:5:0.6', '-q:v', '2', stillOut])
      manifest.images[still.key] = await describe(stillOut, `/images/arka/arka-${still.key}.jpg`)
    }

    const probe = await sharp(posterOut).metadata()
    manifest.videos[clip.key] = {
      src: `/media/arka/arka-${clip.key}.mp4`,
      width: probe.width,
      height: probe.height,
      poster: posterKey,
    }
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Processed ${Object.keys(manifest.images).length} images and ${Object.keys(manifest.videos).length} clips.`)
  console.log(`Manifest → ${path.relative(root, manifestPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
