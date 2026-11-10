import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'

/**
 * Called by the Presentation tool to turn on Draft Mode. next-sanity validates the
 * secret the Studio sends, so this can't be used to switch on previews from outside.
 */
const token = process.env.SANITY_API_READ_TOKEN

const notConfigured = async () =>
  new Response('Draft preview needs a Sanity project and SANITY_API_READ_TOKEN (a Viewer token). See docs/SANITY.md.', {
    status: 503,
  })

export const GET =
  isSanityConfigured && token ? defineEnableDraftMode({ client: client.withConfig({ token }) }).GET : notConfigured
