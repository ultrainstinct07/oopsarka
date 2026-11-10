import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || 'unconfigured'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production'

export default defineCliConfig({
  api: { projectId, dataset },
  typegen: {
    path: './src/**/*.{ts,tsx}',
    schema: './sanity/extract.json',
    generates: './src/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
})
