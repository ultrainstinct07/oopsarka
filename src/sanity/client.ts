import 'server-only'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectIdOrPlaceholder, studioUrl } from './env'

/**
 * Server-side client. The CDN is skipped on purpose: responses are cached by
 * Next.js ('use cache') and refreshed by the publish webhook, so we always
 * want the freshest copy at revalidation time.
 */
export const client = createClient({
  projectId: projectIdOrPlaceholder,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  stega: { studioUrl },
})

export function getClient(preview: boolean) {
  if (!preview) return client
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) throw new Error('Draft Mode needs SANITY_API_READ_TOKEN (a Viewer token). See docs/SANITY.md.')
  return client.withConfig({ token, perspective: 'drafts', stega: { enabled: true, studioUrl } })
}
