import type { PostSummary } from '@/lib/content/types'

export function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] as string,
  )
}

interface FeedInput {
  siteUrl: string
  title: string
  description: string
  posts: PostSummary[]
  imageFor: (post: PostSummary) => string
}

/** RSS 2.0 with atom:self, Dublin Core creator and Media RSS thumbnails. */
export function buildRss({ siteUrl, title, description, posts, imageFor }: FeedInput) {
  const items = posts
    .map((post) => {
      const link = `${siteUrl}/diary/${post.slug}`
      const image = imageFor(post)
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
        `      <dc:creator>${escapeXml(post.author.name)}</dc:creator>`,
        `      <category>${escapeXml(post.category.title)}</category>`,
        ...post.tags.map((tag) => `      <category>${escapeXml(tag.title)}</category>`),
        `      <description>${escapeXml(post.excerpt)}</description>`,
        `      <media:content url="${escapeXml(image)}" medium="image" />`,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  const lastBuild = posts[0] ? new Date(posts[0].updatedAt ?? posts[0].publishedAt).toUTCString() : new Date(0).toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${escapeXml(`${siteUrl}/icon-512.png`)}</url>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(siteUrl)}</link>
    </image>
${items}
  </channel>
</rss>
`
}
