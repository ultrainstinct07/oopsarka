import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from '@/components/seo/json-ld'
import { localData } from '@/lib/content/source-local'
import { tagsFor } from '@/lib/revalidate'
import { buildRss, escapeXml } from '@/lib/seo/rss'
import { blogPostingJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { absoluteUrl, site } from '@/lib/site'

describe('URLs', () => {
  it('always uses the production origin for canonicals', () => {
    expect(site.url).toBe('https://oopsarka.space')
    expect(absoluteUrl('/diary/x')).toBe('https://oopsarka.space/diary/x')
  })
})

describe('RSS', () => {
  it('escapes XML special characters', () => {
    expect(escapeXml(`Tom & "Jerry" <3 'cats'`)).toBe('Tom &amp; &quot;Jerry&quot; &lt;3 &apos;cats&apos;')
  })

  it('builds a valid-looking feed with absolute links', () => {
    const xml = buildRss({
      siteUrl: site.url,
      title: 'OopsArka',
      description: 'Fluff & mischief',
      posts: localData.posts.slice(0, 2),
      imageFor: () => `${site.url}/x.jpg`,
    })
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<atom:link href="https://oopsarka.space/rss.xml" rel="self"')
    expect(xml).toContain('Fluff &amp; mischief')
    expect(xml.match(/<item>/g)).toHaveLength(2)
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/)
  })
})

describe('structured data', () => {
  it('escapes "<" so content can never close the script tag', () => {
    expect(serializeJsonLd({ title: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })

  it('credits the publication, not a cat, as author', () => {
    const post = localData.posts.find((p) => p.author.isCat)!
    const data = blogPostingJsonLd(post, 'https://oopsarka.space/og.png')
    expect(data.author).toEqual({ '@id': 'https://oopsarka.space/#organization' })
    expect(data.mainEntityOfPage).toBe(`https://oopsarka.space/diary/${post.slug}`)
    expect(data).not.toHaveProperty('aggregateRating')
  })

  it('numbers breadcrumbs from one', () => {
    const crumbs = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Diary', path: '/diary' },
    ])
    expect(crumbs.itemListElement.map((item) => item.position)).toEqual([1, 2])
  })
})

describe('webhook revalidation', () => {
  it('maps document types to cache tags', () => {
    expect(tagsFor({ _type: 'post', slug: 'zoomies' })).toEqual(['posts', 'post:zoomies'])
    expect(tagsFor({ _type: 'category' })).toEqual(['categories', 'posts'])
    expect(tagsFor({ _type: 'gallery' })).toEqual(['gallery'])
    expect(tagsFor({ _type: 'unknown' })).toEqual([])
  })
})
