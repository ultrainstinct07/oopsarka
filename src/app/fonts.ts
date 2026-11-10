import { Kalam, Manrope } from 'next/font/google'
import localFont from 'next/font/local'

/**
 * Fraunces is self-hosted with trimmed axis ranges (see docs/DESIGN.md):
 * roman  — opsz 9–144, wght 400–700, SOFT fixed at 50   (~65 KB)
 * italic — opsz 144, wght 400–700, SOFT 100, WONK 1      (~42 KB)
 * The full four-axis family would cost ~264 KB.
 */
export const fraunces = localFont({
  src: [
    { path: './fonts/fraunces-roman-soft50.woff2', weight: '400 700', style: 'normal' },
    { path: './fonts/fraunces-italic-wonky.woff2', weight: '400 700', style: 'italic' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Iowan Old Style', 'Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
})

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const kalam = Kalam({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-kalam',
  display: 'swap',
  preload: false,
})

export const fontVariables = `${fraunces.variable} ${manrope.variable} ${kalam.variable}`
