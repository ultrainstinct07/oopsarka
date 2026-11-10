import type { Metadata, Viewport } from 'next'
import { revealScript } from '@/components/fx/reveal-script'
import { InlineScript } from '@/components/inline-script'
import { preferencesScript } from '@/components/layout/preferences'
import { isProductionDeployment, site } from '@/lib/site'
import { RSS_ALTERNATE } from '@/lib/seo/metadata'
import { fontVariables } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'OopsArka — Oops. Arka did it again.', template: '%s · OopsArka' },
  description: site.description,
  applicationName: site.name,
  creator: site.name,
  publisher: site.name,
  alternates: { types: RSS_ALTERNATE },
  // Only the real production deployment is indexable; previews and local builds are not.
  robots: isProductionDeployment() ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: '/',
    images: [{ url: site.ogImagePath, width: 1200, height: 630, alt: 'Arka under the words “Oops. Arka did it again.”' }],
  },
  twitter: { card: 'summary_large_image', images: [site.ogImagePath] },
}

export const viewport: Viewport = {
  themeColor: '#f8f5ef',
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-theme="light" className={fontVariables} suppressHydrationWarning>
      <head>
        <InlineScript html={preferencesScript} />
        <InlineScript html={revealScript} />
      </head>
      <body>{children}</body>
    </html>
  )
}
