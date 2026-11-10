import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { tagsFor, type WebhookPayload } from '@/lib/revalidate'

/**
 * Sanity GROQ webhook → on-demand revalidation. The request must be signed with
 * SANITY_REVALIDATE_SECRET; anything else is rejected.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return Response.json({ message: 'SANITY_REVALIDATE_SECRET is not set' }, { status: 503 })

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(request, secret, true)
    if (!isValidSignature) return Response.json({ message: 'Invalid signature' }, { status: 401 })
    const tags = body ? tagsFor(body) : []
    if (!tags.length) return Response.json({ message: 'Nothing to revalidate', body }, { status: 400 })
    for (const tag of tags) revalidateTag(tag, 'max')
    return Response.json({ revalidated: tags, now: Date.now() })
  } catch (error) {
    console.error('[revalidate]', error)
    return Response.json({ message: 'Could not process webhook' }, { status: 500 })
  }
}
