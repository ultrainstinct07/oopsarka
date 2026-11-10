import { withCn } from 'cn/next'
import type { NextConfig } from 'next'
import { securityHeaders, studioSecurityHeaders } from './security-headers'

const CN_TABLES = { css: 'src/app/globals.css', content: ['src/**/*.{ts,tsx}'], out: 'src/lib/cn-tables.ts' }

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Off on purpose: unknown story/category URLs must return a real 404 status rather
  // than a streamed fallback. Revisit when Next 17 makes Partial Prefetching the default.
  partialPrefetching: false,
  typedRoutes: true,
  poweredByHeader: false,
  transpilePackages: ['three'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75, 90],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      { source: '/((?!studio).*)', headers: securityHeaders },
      { source: '/studio/:path*', headers: studioSecurityHeaders },
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  async redirects() {
    return [
      // One canonical host: www → apex (Vercel's domain settings do the same).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.oopsarka.space' }],
        destination: 'https://oopsarka.space/:path*',
        permanent: true,
      },
      { source: '/diary/page/1', destination: '/diary', permanent: true },
      { source: '/feed.xml', destination: '/rss.xml', permanent: true },
      { source: '/feed', destination: '/rss.xml', permanent: true },
    ]
  },
}

// Keeps src/lib/cn-tables.ts in step with the theme and the classes in use.
export default withCn(nextConfig, CN_TABLES)
