'use client'

/** Last-resort error page (replaces the root layout, so it brings its own <html>). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#f8f5ef',
          color: '#24211f',
          fontFamily: 'Georgia, serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            OopsArka
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', margin: '1rem 0' }}>Oops. Something went wrong.</h1>
          <p style={{ fontFamily: 'system-ui, sans-serif', color: '#5b5550' }}>Arka would like everyone to stay calm.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem 1.5rem',
              borderRadius: 999,
              border: 0,
              background: '#24211f',
              color: '#f8f5ef',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
