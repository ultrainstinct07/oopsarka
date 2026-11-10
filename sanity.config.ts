'use client'

/**
 * Sanity Studio, embedded at /studio.
 * Run `npm run typegen` after changing schemas.
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectIdOrPlaceholder, studioUrl } from './src/sanity/env'
import { resolve } from './src/sanity/presentation'
import { schemaTypes, singletonTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'oopsarka',
  title: 'OopsArka Studio',
  basePath: studioUrl,
  projectId: projectIdOrPlaceholder,
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "new document" menu.
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType) ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action)) : input,
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: {
        initial: typeof location === 'undefined' ? 'http://localhost:3000' : location.origin,
        previewMode: { enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable' },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
