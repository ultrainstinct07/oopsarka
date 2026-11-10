export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || '2026-10-01'
export const studioUrl = '/studio'

/** Sanity's tooling needs *a* project id to load the config even before one exists. */
export const projectIdOrPlaceholder = projectId || 'unconfigured'

export const isSanityConfigured = Boolean(projectId)
