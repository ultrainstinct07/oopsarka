/** Maps a Sanity webhook payload to the cache tags that should be refreshed. */
export type WebhookPayload = { _type?: string; slug?: string }

/** Which cache tags a published change should refresh. */
export function tagsFor(payload: WebhookPayload): string[] {
  switch (payload._type) {
    case 'post':
      return ['posts', ...(payload.slug ? [`post:${payload.slug}`] : [])]
    case 'category':
      return ['categories', 'posts']
    case 'tag':
      return ['tags', 'posts']
    case 'author':
      return ['posts']
    case 'profile':
      return ['profile']
    case 'gallery':
      return ['gallery']
    case 'siteSettings':
      return ['settings']
    default:
      return []
  }
}
