/**
 * Copies the local sample content — Arka's photos, clips, illustrations, stories,
 * categories, tags, profile, gallery and settings — into your Sanity dataset.
 *
 *   npx sanity login
 *   npm run seed            # = sanity exec scripts/seed-sanity.ts --with-user-token
 *
 * Safe to re-run: documents use fixed ids and are replaced; uploaded files are
 * de-duplicated by Sanity. Documents you created yourself are never touched.
 *
 *   npx sanity exec scripts/seed-sanity.ts -- --dry-run   # build everything, upload nothing
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getCliClient } from 'sanity/cli'
import type { ArkaImage, ArkaVideo, BodyBlock } from '../src/lib/content/types'
import { guides } from '../src/content/local/posts/guides'
import { stories } from '../src/content/local/posts/stories'
import { gallery, profile, settings } from '../src/content/local/singletons'
import { authors, categories, tags } from '../src/content/local/taxonomy'

const client = getCliClient({ apiVersion: '2026-10-01' })
const root = path.resolve(import.meta.dirname, '..')
const uploaded = new Map<string, string>()
const dryRun = process.argv.includes('--dry-run')

async function upload(kind: 'image' | 'file', publicPath: string) {
  const cached = uploaded.get(publicPath)
  if (cached) return cached
  const file = await readFile(path.join(root, 'public', publicPath))
  if (dryRun) {
    const id = `${kind}-dryrun-${uploaded.size}`
    uploaded.set(publicPath, id)
    return id
  }
  const filename = path.basename(publicPath)
  const asset = await client.assets.upload(kind, file, {
    filename,
    contentType: filename.endsWith('.mp4') ? 'video/mp4' : filename.endsWith('.svg') ? 'image/svg+xml' : undefined,
  })
  uploaded.set(publicPath, asset._id)
  console.log(`  ↑ ${filename}`)
  return asset._id
}

async function image(img: ArkaImage | undefined) {
  if (!img) return undefined
  const ref = await upload('image', img.src)
  return {
    _type: 'arkaImage',
    asset: { _type: 'reference', _ref: ref },
    alt: img.alt,
    caption: img.caption,
    illustration: Boolean(img.illustration),
    ...(img.focal ? { hotspot: { _type: 'sanity.imageHotspot', x: img.focal.x, y: img.focal.y, width: 0.7, height: 0.7 } } : {}),
  }
}

async function videoFields(video: ArkaVideo) {
  const ref = await upload('file', video.src)
  return {
    video: { _type: 'file', asset: { _type: 'reference', _ref: ref } },
    poster: await image(video.poster),
    description: video.description,
  }
}

async function body(blocks: BodyBlock[]) {
  const out: Record<string, unknown>[] = []
  for (const block of blocks) {
    if (block._type === 'figure')
      out.push({ _type: 'figure', _key: block._key, layout: block.layout, image: await image(block.image) })
    else if (block._type === 'clip')
      out.push({ _type: 'clip', _key: block._key, caption: block.caption, ...(await videoFields(block.video)) })
    else out.push(block as unknown as Record<string, unknown>)
  }
  return out
}

const ref = (id: string) => ({ _type: 'reference', _ref: id })
const slug = (value: string) => ({ _type: 'slug', current: value })
/**
 * Fixed document IDs. Never use a `.` here: Sanity treats IDs containing a dot
 * as private paths, readable only with a token, so the site's anonymous client
 * would see none of them even in a public dataset.
 */
const id = (type: string, value: string) => `${type}-${value}`
/** Earlier seeds used `type.slug` IDs; those copies are deleted on the next run. */
const legacyId = (type: string, value: string) => `${type}.${value}`

async function main() {
  const { projectId, dataset } = client.config()
  console.log(dryRun ? 'Dry run — nothing will be uploaded or written.' : `Seeding ${projectId}/${dataset}…`)
  const docs: Record<string, unknown>[] = []

  for (const c of categories) {
    docs.push({
      _id: id('category', c.slug),
      _type: 'category',
      title: c.title,
      slug: slug(c.slug),
      tagline: c.tagline,
      description: c.description,
      accent: c.accent,
      doodle: c.doodle,
      order: c.order,
      cover: await image(c.cover),
    })
  }
  for (const t of tags)
    docs.push({ _id: id('tag', t.slug), _type: 'tag', title: t.title, slug: slug(t.slug), description: t.description })
  for (const a of authors) {
    docs.push({
      _id: id('author', a.slug),
      _type: 'author',
      name: a.name,
      slug: slug(a.slug),
      role: a.role,
      bio: a.bio,
      isCat: a.isCat,
      avatar: await image(a.avatar),
    })
  }

  for (const post of [...stories, ...guides]) {
    docs.push({
      _id: id('post', post.slug),
      _type: 'post',
      title: post.title,
      slug: slug(post.slug),
      excerpt: post.excerpt,
      category: ref(id('category', post.category)),
      tags: post.tags.map((t) => ({ ...ref(id('tag', t)), _key: t })),
      author: ref(id('author', post.author)),
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      cover: await image(post.cover),
      featured: Boolean(post.featured),
      sample: post.sample,
      body: await body(post.body),
    })
  }

  docs.push({
    _id: 'profile',
    _type: 'profile',
    name: profile.name,
    species: profile.species,
    breed: profile.breed,
    jobTitle: profile.jobTitle,
    specialSkill: profile.specialSkill,
    coat: profile.coat,
    eyes: profile.eyes,
    traits: profile.traits,
    intro: profile.intro,
    portrait: await image(profile.portrait),
    aboutBody: await body(profile.aboutBody),
  })

  const items: Record<string, unknown>[] = []
  for (const item of gallery) {
    const base = { _key: item.id, title: item.title, caption: item.caption, date: item.date }
    if (item.kind === 'photo') items.push({ _type: 'galleryPhoto', ...base, image: await image(item.image) })
    else items.push({ _type: 'galleryVideo', ...base, ...(await videoFields(item.video)) })
  }
  docs.push({ _id: 'gallery', _type: 'gallery', items })

  docs.push({
    _id: 'siteSettings',
    _type: 'siteSettings',
    heroImage: await image(settings.heroImage),
    newsletterImage: await image(settings.newsletterImage),
    socials: [],
    humanName: settings.human.name,
    humanIntro: settings.human.intro,
    whyThisBlog: settings.human.whyThisBlog,
    contactIntro: settings.contactIntro,
    newsletterPitch: settings.newsletterPitch,
  })

  if (dryRun) {
    const types = docs.reduce<Record<string, number>>(
      (acc, doc) => ({ ...acc, [String(doc._type)]: (acc[String(doc._type)] ?? 0) + 1 }),
      {},
    )
    console.log(`✓ Would write ${docs.length} documents and upload ${uploaded.size} files:`, types)
    return
  }

  const transaction = client.transaction()
  for (const doc of docs) transaction.createOrReplace(doc as { _id: string; _type: string })
  // Posts first: they reference the categories, tags and authors.
  const legacy = [
    ...[...stories, ...guides].map((post) => legacyId('post', post.slug)),
    ...categories.map((c) => legacyId('category', c.slug)),
    ...tags.map((t) => legacyId('tag', t.slug)),
    ...authors.map((a) => legacyId('author', a.slug)),
  ]
  for (const legacyDoc of legacy) transaction.delete(legacyDoc)
  await transaction.commit({ visibility: 'async' })
  console.log(`✓ Seeded ${docs.length} documents and ${uploaded.size} files.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
