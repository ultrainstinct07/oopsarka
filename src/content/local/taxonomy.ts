import type { Author, Category, Tag } from '@/lib/content/types'
import { photo } from './media'

export const categories: Category[] = [
  {
    slug: 'daily-diary',
    title: 'Daily Diary',
    tagline: 'Everyday life, habits and little moments.',
    description:
      'The ordinary, glorious business of being Arka: naps, patrols, breakfast negotiations and the small rituals that make a home run on cat time.',
    accent: 'lavender',
    doodle: 'notebook',
    cover: photo('office-chair-poster'),
    order: 1,
  },
  {
    slug: 'oops-moments',
    title: 'Oops Moments',
    tagline: 'Mischief, funny incidents and chaos.',
    description:
      'Things fell. Things were investigated. Things were nudged, gently, off other things. A complete and honest record of incidents, with very little remorse.',
    accent: 'butter',
    doodle: 'oops',
    cover: photo('rooftop-full-complaint'),
    order: 2,
  },
  {
    slug: 'persian-life',
    title: 'Persian Life',
    tagline: 'Grooming, coat care, routines and breed notes.',
    description:
      'Living with a long-coated Persian: gentle grooming, comfortable coats, calm routines and what one household has learned along the way. General guidance only — your vet knows best.',
    accent: 'sage',
    doodle: 'comb',
    cover: photo('blanket-lookup'),
    order: 3,
  },
  {
    slug: 'adventures',
    title: 'Adventures',
    tagline: 'New toys, places, discoveries and explorations.',
    description:
      'Rooftops, boxes, balconies and the great unknown behind the sofa. Field reports from a small explorer with a large sense of entitlement.',
    accent: 'marmalade',
    doodle: 'compass',
    cover: photo('rooftop-harness'),
    order: 4,
  },
  {
    slug: 'human-observations',
    title: 'Human Observations',
    tagline: 'Funny reflections on living with a human.',
    description:
      'Field notes on the tall, slow, mostly hairless creature who opens the doors. Largely affectionate. Occasionally concerned.',
    accent: 'rose',
    doodle: 'eye',
    order: 5,
  },
]

export const tags: Tag[] = [
  { slug: 'zoomies', title: 'Zoomies', description: 'Sudden, unexplained bursts of speed.' },
  { slug: 'night-shift', title: 'Night shift', description: 'Things that happen while the human is asleep.' },
  { slug: 'naps', title: 'Naps', description: 'Professional rest, taken seriously.' },
  { slug: 'boxes', title: 'Boxes', description: 'Cardboard and the joy of fitting inside it.' },
  { slug: 'houseplants', title: 'Houseplants', description: 'Green things that require investigation.' },
  { slug: 'investigations', title: 'Investigations', description: 'Open cases and the evidence behind them.' },
  { slug: 'gravity', title: 'Gravity experiments', description: 'Ongoing research into what happens when things fall.' },
  { slug: 'reviews', title: 'Reviews', description: 'Strong opinions, scored honestly.' },
  { slug: 'routines', title: 'Routines', description: 'The schedule. Do not deviate from the schedule.' },
  { slug: 'humans', title: 'Humans', description: 'Observations of the staff.' },
  { slug: 'grooming', title: 'Grooming', description: 'Brushing, combing and coat comfort.' },
  { slug: 'coat-care', title: 'Coat care', description: 'Keeping a long coat comfortable.' },
  { slug: 'indoor-life', title: 'Indoor life', description: 'A calm, interesting home for a curious cat.' },
  { slug: 'enrichment', title: 'Enrichment', description: 'Play, puzzles and things worth chasing.' },
  { slug: 'rooftop', title: 'Rooftop', description: 'Supervised high-altitude field trips.' },
  { slug: 'office-chair', title: 'Office chair', description: 'Annexed territory.' },
]

export const authors: Author[] = [
  {
    slug: 'arka',
    name: 'Arka',
    role: 'Chief Mischief Officer',
    bio: 'Persian. Fluffy. Allegedly innocent. Dictates, while his human types.',
    avatar: photo('blanket-stare'),
    isCat: true,
  },
  {
    slug: 'human',
    name: "Arka's human",
    role: 'Typist, photographer & treat dispenser',
    bio: 'Opens the doors, refills the bowl and writes down the bits worth remembering.',
    isCat: false,
  },
]

export const categoryBySlug = (slug: string) => {
  const category = categories.find((c) => c.slug === slug)
  if (!category) throw new Error(`Unknown category "${slug}"`)
  return category
}

export const tagBySlug = (slug: string) => {
  const tag = tags.find((t) => t.slug === slug)
  if (!tag) throw new Error(`Unknown tag "${slug}"`)
  return tag
}

export const authorBySlug = (slug: string) => {
  const author = authors.find((a) => a.slug === slug)
  if (!author) throw new Error(`Unknown author "${slug}"`)
  return author
}
