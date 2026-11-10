/**
 * An inline script that runs during HTML parsing (before first paint) on hard loads.
 * It's typed text/plain on the client so React never re-runs or warns about it.
 * Pattern from the Next.js "preventing flash before hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
