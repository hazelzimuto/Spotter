import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

/**
 * Inter is the typeface declared by the Aurora Design System
 * (design tokens/tokens.json -> metadata.typeface).
 * `variable` exposes it as a CSS custom property so globals.css can compose
 * it with the token font stack instead of hardcoding a family name.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Spotter',
    default: 'Spotter',
  },
  description: 'Private gym member portal',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Spotter',
  },
}

/** Matches the Aurora Design System light/dark brand ramp. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F46E5' },
    { media: '(prefers-color-scheme: dark)', color: '#C0BCF9' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // No hardcoded data-theme: leaving it unset lets the compiled
    // `prefers-color-scheme` block in tokens.css apply the dark theme.
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
