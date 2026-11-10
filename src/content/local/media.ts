import type { ArkaImage, ArkaVideo } from '@/lib/content/types'
import manifest from './media.generated.json'

/**
 * Real photographs and clips of Arka (processed by `npm run media`),
 * plus drawn placeholder covers. Illustrations are flagged so they are
 * never presented as photographs.
 */
type PhotoKey = keyof typeof manifest.images
type ClipKey = keyof typeof manifest.videos

const FOCAL: Partial<Record<PhotoKey, { x: number; y: number }>> = {
  'night-patrol': { x: 0.34, y: 0.44 },
  'blanket-stare': { x: 0.33, y: 0.45 },
  'blanket-lookup': { x: 0.33, y: 0.44 },
  'rooftop-harness': { x: 0.5, y: 0.36 },
  'rooftop-midmeow': { x: 0.52, y: 0.34 },
  'rooftop-full-complaint': { x: 0.52, y: 0.42 },
  'office-chair-poster': { x: 0.6, y: 0.42 },
  'rooftop-complaint-poster': { x: 0.5, y: 0.36 },
}

export const ALT = {
  'night-patrol':
    'Arka, a fluffy ginger Persian cat with copper eyes, sits on a ledge at night in front of lit apartment towers and green shrubs, looking to the left.',
  'blanket-stare':
    'Arka, a ginger Persian kitten, lies on a floral bedsheet half-covered by a pink striped towel, paws stretched forward, looking at the camera through half-closed eyes.',
  'blanket-lookup':
    'Arka lies on a floral bedsheet under a pink striped towel, one paw stretched out, gazing up and to the left with wide eyes.',
  'rooftop-harness':
    'Arka stands on a sunny rooftop in a black harness beside a yellow sunflower cushion, mouth open mid-meow, with blue sky behind him.',
  'rooftop-midmeow': 'Close-up of Arka in a black harness, mouth open mid-meow and whiskers spread, against a blue sky.',
  'rooftop-full-complaint': "Extreme close-up of Arka's face mid-meow, mouth wide open to show a pink tongue and tiny teeth.",
  'office-chair-poster': 'Arka curled up asleep on the seat of a black office chair, seen from the side.',
  'rooftop-complaint-poster':
    'Arka in a black harness on a sunny rooftop, standing by a yellow cushion and meowing at the camera.',
} satisfies Record<PhotoKey, string>

export function photo(key: PhotoKey, options: { alt?: string; caption?: string } = {}): ArkaImage {
  const entry = manifest.images[key]
  return {
    kind: 'static',
    src: entry.src,
    width: entry.width,
    height: entry.height,
    lqip: entry.lqip,
    dominant: entry.dominant,
    alt: options.alt ?? ALT[key],
    caption: options.caption,
    focal: FOCAL[key],
  }
}

export const CLIP_DESCRIPTIONS = {
  'office-chair':
    'Silent eight-second clip: the camera moves from beside a black office chair to above it, showing Arka curled up asleep on the seat.',
  'rooftop-complaint':
    'Silent six-second clip: Arka, wearing a black harness on a sunny rooftop, walks towards the camera meowing until his face fills the frame.',
} satisfies Record<ClipKey, string>

export function video(key: ClipKey): ArkaVideo {
  const entry = manifest.videos[key]
  return {
    src: entry.src,
    width: entry.width,
    height: entry.height,
    poster: photo(entry.poster as PhotoKey),
    description: CLIP_DESCRIPTIONS[key],
  }
}

/** Drawn cover illustrations live in /public/images/illustrations (1200×1200 SVG). */
export const ILLUSTRATIONS = {
  zoomies: 'Illustration: a wall clock stuck at 3:00 with motion streaks and a blur of paw prints racing across the floor.',
  houseplant: 'Illustration: a potted plant under a magnifying glass, one leaf with a suspicious nibble and an evidence tag.',
  boxes: 'Illustration: a cardboard box with two cat ears peeking out and a five-star review sticker.',
  tables: 'Illustration: a mug tipping off the edge of a table, with motion lines and a handwritten “oops”.',
  grooming: 'Illustration: a wide-toothed comb beside a soft tuft of ginger fur and a small heart.',
  tangles: 'Illustration: a comb and a slicker brush crossed like a coat of arms over a ginger fur swirl.',
  toys: 'Illustration: a feather wand toy, a crinkle ball and a cardboard box arranged on a rug.',
} as const

export type IllustrationKey = keyof typeof ILLUSTRATIONS

export function illustration(key: IllustrationKey): ArkaImage {
  return {
    kind: 'static',
    src: `/images/illustrations/${key}.svg`,
    width: 1200,
    height: 1200,
    alt: ILLUSTRATIONS[key],
    illustration: true,
    focal: { x: 0.5, y: 0.5 },
  }
}
