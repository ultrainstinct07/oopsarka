/**
 * Domain types. The UI only ever sees these shapes — never raw Sanity documents —
 * so the content source can change without touching a single component.
 */

export type ImageKind = 'static' | 'sanity'

export interface SanityImageRef {
  asset: { _ref: string }
  crop?: { top: number; bottom: number; left: number; right: number }
  hotspot?: { x: number; y: number; height: number; width: number }
}

export interface ArkaImage {
  kind: ImageKind
  /** Static path (`/images/...`) or the Sanity CDN asset URL. */
  src: string
  width: number
  height: number
  alt: string
  caption?: string
  /** Tiny base64 blur placeholder. */
  lqip?: string
  /** Dominant colour, used to tint frames while loading. */
  dominant?: string
  /** Focal point (0–1) used for CSS object-position on local images. */
  focal?: { x: number; y: number }
  /** True for drawn placeholder covers (never presented as photos of Arka). */
  illustration?: boolean
  sanity?: SanityImageRef
}

export interface ArkaVideo {
  src: string
  width: number
  height: number
  poster: ArkaImage
  /** Short accessible description of what happens in the clip. */
  description: string
}

/* ── Portable Text ───────────────────────────────────────────── */

export interface PTSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

export interface PTLinkDef {
  _type: 'link'
  _key: string
  href: string
}

export interface PTTextBlock {
  _type: 'block'
  _key: string
  style?: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote'
  listItem?: 'bullet' | 'number'
  level?: number
  children: PTSpan[]
  markDefs?: PTLinkDef[]
}

export interface FigureBlock {
  _type: 'figure'
  _key: string
  image: ArkaImage
  layout?: 'inline' | 'wide'
}

export interface PullQuoteBlock {
  _type: 'pullQuote'
  _key: string
  text: string
  attribution?: string
}

export interface ArkaNoteBlock {
  _type: 'arkaNote'
  _key: string
  text: string
}

export interface CareNoteBlock {
  _type: 'careNote'
  _key: string
  title?: string
  text: string
}

/** A spot reserved for the human's own first-hand experience. Renders only when filled in. */
export interface HumanNoteBlock {
  _type: 'humanNote'
  _key: string
  prompt: string
  text?: string
}

export interface ClipBlock {
  _type: 'clip'
  _key: string
  video: ArkaVideo
  caption?: string
}

export interface EmbedBlock {
  _type: 'embed'
  _key: string
  url: string
  title: string
}

export interface PawDividerBlock {
  _type: 'pawDivider'
  _key: string
}

export type BodyBlock =
  | PTTextBlock
  | FigureBlock
  | PullQuoteBlock
  | ArkaNoteBlock
  | CareNoteBlock
  | HumanNoteBlock
  | ClipBlock
  | EmbedBlock
  | PawDividerBlock

/* ── Taxonomy & people ───────────────────────────────────────── */

export type Accent = 'lavender' | 'butter' | 'sage' | 'rose' | 'marmalade'

export type DoodleName =
  'notebook' | 'oops' | 'comb' | 'compass' | 'eye' | 'box' | 'plant' | 'clock' | 'mug' | 'door' | 'paw' | 'yarn'

export interface Category {
  slug: string
  title: string
  tagline: string
  description: string
  accent: Accent
  doodle: DoodleName
  cover?: ArkaImage
  order: number
}

export interface Tag {
  slug: string
  title: string
  description?: string
}

export interface Author {
  slug: string
  name: string
  role: string
  bio?: string
  avatar?: ArkaImage
  isCat: boolean
}

/* ── Posts ───────────────────────────────────────────────────── */

export interface TocItem {
  /** Portable Text block key the heading belongs to. */
  key: string
  id: string
  text: string
  level: 2 | 3
}

export interface PostSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  category: Category
  tags: Tag[]
  author: Author
  publishedAt: string
  updatedAt?: string
  cover: ArkaImage
  featured: boolean
  sample: boolean
  readingMinutes: number
}

export interface Post extends PostSummary {
  body: BodyBlock[]
  toc: TocItem[]
  plainText: string
  seo?: { title?: string; description?: string; ogImage?: ArkaImage }
}

/* ── Gallery ─────────────────────────────────────────────────── */

interface GalleryBase {
  id: string
  title: string
  caption?: string
  /** Optional date the photo was taken, if known. Never invented. */
  date?: string
}

export type GalleryItem =
  (GalleryBase & { kind: 'photo'; image: ArkaImage }) | (GalleryBase & { kind: 'video'; video: ArkaVideo })

/* ── Singletons ──────────────────────────────────────────────── */

export interface Profile {
  name: string
  species: string
  breed: string
  jobTitle: string
  specialSkill: string
  coat: string
  eyes: string
  favoriteActivity?: string
  favoriteSnack?: string
  currentObsession?: string
  traits: string[]
  intro: string
  portrait: ArkaImage
  aboutBody: BodyBlock[]
}

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'x' | 'threads' | 'bluesky' | 'facebook' | 'pinterest'

export interface Settings {
  /** The big portrait in the homepage hero. */
  heroImage: ArkaImage
  /** Arka looking up at the newsletter form. */
  newsletterImage: ArkaImage
  socials: { platform: SocialPlatform; url: string; handle?: string }[]
  human: { name?: string; intro: string; whyThisBlog: string }
  contactIntro: string
  newsletterPitch: string
}
