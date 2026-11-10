import type { MetadataRoute } from 'next'
import { absoluteUrl, isProductionDeployment } from '@/lib/site'

/** Only the production deployment is crawlable; previews stay out of search results. */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio', '/api/', '/search'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}
