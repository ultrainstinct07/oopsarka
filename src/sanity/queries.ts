import { defineQuery } from 'next-sanity'

/* Reusable projections ----------------------------------------------------- */

const IMAGE = /* groq */ `{
  alt,
  caption,
  illustration,
  crop,
  hotspot,
  "asset": asset->{
    _id,
    url,
    "lqip": metadata.lqip,
    "width": metadata.dimensions.width,
    "height": metadata.dimensions.height,
    "dominant": metadata.palette.dominant.background
  }
}`

const CATEGORY = /* groq */ `{
  title,
  "slug": slug.current,
  tagline,
  description,
  accent,
  doodle,
  order,
  cover ${IMAGE}
}`

const TAG = /* groq */ `{ title, "slug": slug.current, description }`

const AUTHOR = /* groq */ `{ name, "slug": slug.current, role, bio, isCat, avatar ${IMAGE} }`

const SUMMARY = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  updatedAt,
  featured,
  sample,
  cover ${IMAGE},
  "category": category->${CATEGORY},
  "tags": coalesce(tags[]->${TAG}, []),
  "author": author->${AUTHOR},
  "plainText": pt::text(body)
`

const BODY = /* groq */ `body[]{
  ...,
  _type == "figure" => { ..., image ${IMAGE} },
  _type == "clip" => {
    ...,
    "videoUrl": video.asset->url,
    poster ${IMAGE}
  },
  markDefs[]{ ... }
}`

/* Queries ------------------------------------------------------------------ */

export const POST_SUMMARIES_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) {
    ${SUMMARY}
  }
`)

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    ${SUMMARY},
    seo { title, description, ogImage ${IMAGE} },
    ${BODY}
  }
`)

export const SEARCH_DOCUMENTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "category": category->title,
    "categorySlug": category->slug.current,
    "tags": coalesce(tags[]->title, []),
    "text": pt::text(body)
  }
`)

export const CATEGORIES_QUERY = defineQuery(`*[_type == "category" && defined(slug.current)] | order(order asc) ${CATEGORY}`)

export const TAGS_QUERY = defineQuery(`*[_type == "tag" && defined(slug.current)] | order(title asc) ${TAG}`)

export const GALLERY_QUERY = defineQuery(`
  *[_type == "gallery" && _id == "gallery"][0] {
    "items": coalesce(items[]{
      _key,
      _type,
      title,
      caption,
      date,
      description,
      image ${IMAGE},
      poster ${IMAGE},
      "videoUrl": video.asset->url
    }, [])
  }
`)

export const PROFILE_QUERY = defineQuery(`
  *[_type == "profile" && _id == "profile"][0] {
    name, species, breed, jobTitle, specialSkill, coat, eyes,
    favoriteActivity, favoriteSnack, currentObsession,
    "traits": coalesce(traits, []),
    intro,
    portrait ${IMAGE},
    "aboutBody": aboutBody[]{
      ...,
      _type == "figure" => { ..., image ${IMAGE} },
      markDefs[]{ ... }
    }
  }
`)

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    heroImage ${IMAGE},
    newsletterImage ${IMAGE},
    "socials": coalesce(socials[]{ platform, url, handle }, []),
    humanName,
    humanIntro,
    whyThisBlog,
    contactIntro,
    newsletterPitch
  }
`)
