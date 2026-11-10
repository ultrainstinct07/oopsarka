import 'server-only'
import { stegaClean } from 'next-sanity'
import { profile as localProfile, settings as localSettings } from '@/content/local/singletons'
import { getClient } from '@/sanity/client'
import {
  CATEGORIES_QUERY,
  GALLERY_QUERY,
  POST_QUERY,
  POST_SUMMARIES_QUERY,
  PROFILE_QUERY,
  SEARCH_DOCUMENTS_QUERY,
  SETTINGS_QUERY,
  TAGS_QUERY,
} from '@/sanity/queries'
import type { POST_QUERY_RESULT, POST_SUMMARIES_QUERY_RESULT, PROFILE_QUERY_RESULT } from '@/sanity/sanity.types'
import { buildToc, readingMinutes, toPlainText } from './pt'
import type { ContentSource, SearchDocument, SourceOptions } from './source'
import type {
  Accent,
  ArkaImage,
  Author,
  BodyBlock,
  Category,
  DoodleName,
  GalleryItem,
  Post,
  PostSummary,
  SocialPlatform,
  Tag,
} from './types'

type RawSummary = POST_SUMMARIES_QUERY_RESULT[number]
type RawImage = NonNullable<RawSummary['cover']>
type RawCategory = NonNullable<RawSummary['category']>
type RawAuthor = NonNullable<RawSummary['author']>
type RawTag = RawSummary['tags'][number]
type RawBody = NonNullable<NonNullable<POST_QUERY_RESULT>['body']>

const FALLBACK_COVER: ArkaImage = {
  kind: 'static',
  src: '/images/illustrations/placeholder.svg',
  width: 1200,
  height: 1200,
  alt: 'Illustration: a paw print on an empty evidence tag.',
  illustration: true,
}

const clean = <T>(value: T): T => stegaClean(value) as T

async function fetchQuery<T>(query: string, params: Record<string, unknown>, options: SourceOptions): Promise<T> {
  return getClient(options.preview).fetch<T>(query, params)
}

export function mapImage(raw: RawImage | null | undefined): ArkaImage | undefined {
  if (!raw) return undefined
  const asset = raw.asset
  if (!asset?.url || !asset.width || !asset.height) return undefined
  return {
    kind: 'sanity',
    src: clean(asset.url),
    width: asset.width,
    height: asset.height,
    alt: raw.alt ?? '',
    caption: raw.caption ?? undefined,
    lqip: asset.lqip ?? undefined,
    dominant: asset.dominant ? clean(asset.dominant) : undefined,
    illustration: Boolean(raw.illustration),
    focal: raw.hotspot?.x != null && raw.hotspot?.y != null ? { x: raw.hotspot.x, y: raw.hotspot.y } : undefined,
    sanity: {
      asset: { _ref: asset._id },
      crop: raw.crop
        ? { top: raw.crop.top ?? 0, bottom: raw.crop.bottom ?? 0, left: raw.crop.left ?? 0, right: raw.crop.right ?? 0 }
        : undefined,
      hotspot: raw.hotspot
        ? {
            x: raw.hotspot.x ?? 0.5,
            y: raw.hotspot.y ?? 0.5,
            width: raw.hotspot.width ?? 1,
            height: raw.hotspot.height ?? 1,
          }
        : undefined,
    },
  }
}

const ACCENTS: Accent[] = ['lavender', 'butter', 'sage', 'rose', 'marmalade']

function mapCategory(raw: RawCategory | null | undefined): Category {
  const accent = clean(raw?.accent ?? 'lavender') as Accent
  return {
    slug: clean(raw?.slug ?? 'uncategorised'),
    title: raw?.title ?? 'Uncategorised',
    tagline: raw?.tagline ?? '',
    description: raw?.description ?? '',
    accent: ACCENTS.includes(accent) ? accent : 'lavender',
    doodle: clean(raw?.doodle ?? 'paw') as DoodleName,
    cover: mapImage(raw?.cover),
    order: raw?.order ?? 99,
  }
}

function mapTag(raw: RawTag): Tag {
  return { slug: clean(raw.slug ?? ''), title: raw.title ?? '', description: raw.description ?? undefined }
}

function mapAuthor(raw: RawAuthor | null | undefined): Author {
  return {
    slug: clean(raw?.slug ?? 'arka'),
    name: raw?.name ?? 'Arka',
    role: raw?.role ?? '',
    bio: raw?.bio ?? undefined,
    avatar: mapImage(raw?.avatar),
    isCat: Boolean(raw?.isCat),
  }
}

function mapSummary(raw: RawSummary): PostSummary {
  return {
    id: raw._id,
    slug: clean(raw.slug ?? ''),
    title: raw.title ?? 'Untitled',
    excerpt: raw.excerpt ?? '',
    category: mapCategory(raw.category),
    tags: (raw.tags ?? []).map(mapTag).filter((tag) => tag.slug),
    author: mapAuthor(raw.author),
    publishedAt: clean(raw.publishedAt ?? new Date(0).toISOString()),
    updatedAt: raw.updatedAt ? clean(raw.updatedAt) : undefined,
    cover: mapImage(raw.cover) ?? FALLBACK_COVER,
    featured: Boolean(raw.featured),
    sample: Boolean(raw.sample),
    readingMinutes: readingMinutes(raw.plainText ?? ''),
  }
}

export function mapBody(raw: RawBody | null | undefined): BodyBlock[] {
  const blocks: BodyBlock[] = []
  for (const block of raw ?? []) {
    switch (block._type) {
      case 'block':
        blocks.push({
          _type: 'block',
          _key: block._key,
          style: clean(block.style ?? 'normal'),
          listItem: block.listItem ? clean(block.listItem) : undefined,
          level: block.level,
          children: (block.children ?? []).map((child) => ({
            _type: 'span',
            _key: child._key,
            text: child.text ?? '',
            marks: child.marks ?? [],
          })),
          markDefs: (block.markDefs ?? [])
            .filter((def) => def._type === 'link' && def.href)
            .map((def) => ({ _type: 'link', _key: def._key, href: clean(def.href ?? '') })),
        })
        break
      case 'figure': {
        const image = mapImage(block.image)
        if (image) blocks.push({ _type: 'figure', _key: block._key, image, layout: clean(block.layout ?? 'inline') })
        break
      }
      case 'clip': {
        const poster = mapImage(block.poster)
        if (block.videoUrl && poster)
          blocks.push({
            _type: 'clip',
            _key: block._key,
            caption: block.caption,
            video: {
              src: clean(block.videoUrl),
              width: poster.width,
              height: poster.height,
              poster,
              description: block.description ?? 'Video clip of Arka.',
            },
          })
        break
      }
      case 'pullQuote':
        if (block.text) blocks.push({ _type: 'pullQuote', _key: block._key, text: block.text, attribution: block.attribution })
        break
      case 'arkaNote':
        if (block.text) blocks.push({ _type: 'arkaNote', _key: block._key, text: block.text })
        break
      case 'careNote':
        if (block.text) blocks.push({ _type: 'careNote', _key: block._key, title: block.title, text: block.text })
        break
      case 'humanNote':
        blocks.push({ _type: 'humanNote', _key: block._key, prompt: block.prompt ?? '', text: block.text })
        break
      case 'embed':
        if (block.url) blocks.push({ _type: 'embed', _key: block._key, url: clean(block.url), title: block.title ?? 'Video' })
        break
      case 'pawDivider':
        blocks.push({ _type: 'pawDivider', _key: block._key })
        break
    }
  }
  return blocks
}

const PLATFORMS: SocialPlatform[] = ['instagram', 'youtube', 'tiktok', 'x', 'threads', 'bluesky', 'facebook', 'pinterest']

export const sanitySource: ContentSource = {
  name: 'sanity',

  async getPostSummaries(options) {
    const rows = await fetchQuery<POST_SUMMARIES_QUERY_RESULT>(POST_SUMMARIES_QUERY, {}, options)
    return rows.filter((row) => row.slug).map(mapSummary)
  },

  async getPost(slug, options): Promise<Post | null> {
    const raw = await fetchQuery<POST_QUERY_RESULT>(POST_QUERY, { slug }, options)
    if (!raw?.slug) return null
    const summary = mapSummary(raw)
    const body = mapBody(raw.body)
    const plainText = toPlainText(body)
    return {
      ...summary,
      readingMinutes: readingMinutes(plainText),
      body,
      toc: buildToc(body),
      plainText,
      seo: raw.seo
        ? { title: raw.seo.title ?? undefined, description: raw.seo.description ?? undefined, ogImage: mapImage(raw.seo.ogImage) }
        : undefined,
    }
  },

  async getSearchDocuments(options) {
    type Row = {
      _id: string
      title: string | null
      slug: string | null
      excerpt: string | null
      publishedAt: string | null
      category: string | null
      categorySlug: string | null
      tags: string[] | null
      text: string | null
    }
    const rows = await fetchQuery<Row[]>(SEARCH_DOCUMENTS_QUERY, {}, options)
    return rows
      .filter((row) => row.slug && row.publishedAt)
      .map((row): SearchDocument => ({
        id: clean(row.slug ?? row._id),
        slug: clean(row.slug ?? ''),
        title: clean(row.title ?? ''),
        excerpt: clean(row.excerpt ?? ''),
        category: clean(row.category ?? ''),
        categorySlug: clean(row.categorySlug ?? ''),
        tags: clean((row.tags ?? []).join(' ')),
        text: clean(row.text ?? ''),
        publishedAt: clean(row.publishedAt ?? ''),
        readingMinutes: readingMinutes(row.text ?? ''),
      }))
  },

  async getCategories(options) {
    const rows = await fetchQuery<RawCategory[]>(CATEGORIES_QUERY, {}, options)
    return rows.map(mapCategory)
  },

  async getTags(options) {
    const rows = await fetchQuery<RawTag[]>(TAGS_QUERY, {}, options)
    return rows.map(mapTag).filter((tag) => tag.slug)
  },

  async getGallery(options) {
    type Item = {
      _key: string
      _type: string
      title: string | null
      caption: string | null
      date: string | null
      description: string | null
      image: RawImage | null
      poster: RawImage | null
      videoUrl: string | null
    }
    const doc = await fetchQuery<{ items: Item[] } | null>(GALLERY_QUERY, {}, options)
    const items: GalleryItem[] = []
    for (const item of doc?.items ?? []) {
      const base = {
        id: item._key,
        title: item.title ?? 'Untitled exhibit',
        caption: item.caption ?? undefined,
        date: item.date ? clean(item.date) : undefined,
      }
      if (clean(item._type) === 'galleryPhoto') {
        const image = mapImage(item.image)
        if (image) items.push({ ...base, kind: 'photo', image })
      } else {
        const poster = mapImage(item.poster)
        if (item.videoUrl && poster)
          items.push({
            ...base,
            kind: 'video',
            video: {
              src: clean(item.videoUrl),
              width: poster.width,
              height: poster.height,
              poster,
              description: item.description ?? 'Video clip of Arka.',
            },
          })
      }
    }
    return items
  },

  async getProfile(options) {
    const raw = await fetchQuery<PROFILE_QUERY_RESULT>(PROFILE_QUERY, {}, options)
    if (!raw) return localProfile
    return {
      name: raw.name ?? localProfile.name,
      species: raw.species ?? localProfile.species,
      breed: raw.breed ?? localProfile.breed,
      jobTitle: raw.jobTitle ?? localProfile.jobTitle,
      specialSkill: raw.specialSkill ?? localProfile.specialSkill,
      coat: raw.coat ?? localProfile.coat,
      eyes: raw.eyes ?? localProfile.eyes,
      favoriteActivity: raw.favoriteActivity ?? undefined,
      favoriteSnack: raw.favoriteSnack ?? undefined,
      currentObsession: raw.currentObsession ?? undefined,
      traits: raw.traits?.length ? raw.traits : localProfile.traits,
      intro: raw.intro ?? localProfile.intro,
      portrait: mapImage(raw.portrait) ?? localProfile.portrait,
      aboutBody: raw.aboutBody?.length ? mapBody(raw.aboutBody as RawBody) : localProfile.aboutBody,
    }
  },

  async getSettings(options) {
    type Row = {
      heroImage: RawImage | null
      newsletterImage: RawImage | null
      socials: { platform: string | null; url: string | null; handle: string | null }[]
      humanName: string | null
      humanIntro: string | null
      whyThisBlog: string | null
      contactIntro: string | null
      newsletterPitch: string | null
    }
    const raw = await fetchQuery<Row | null>(SETTINGS_QUERY, {}, options)
    if (!raw) return localSettings
    return {
      heroImage: mapImage(raw.heroImage) ?? localSettings.heroImage,
      newsletterImage: mapImage(raw.newsletterImage) ?? localSettings.newsletterImage,
      socials: raw.socials
        .map((s) => ({
          platform: clean(s.platform ?? '') as SocialPlatform,
          url: clean(s.url ?? ''),
          handle: s.handle ?? undefined,
        }))
        .filter((s) => PLATFORMS.includes(s.platform) && /^https:\/\//.test(s.url)),
      human: {
        name: raw.humanName ?? undefined,
        intro: raw.humanIntro ?? localSettings.human.intro,
        whyThisBlog: raw.whyThisBlog ?? localSettings.human.whyThisBlog,
      },
      contactIntro: raw.contactIntro ?? localSettings.contactIntro,
      newsletterPitch: raw.newsletterPitch ?? localSettings.newsletterPitch,
    }
  },
}
