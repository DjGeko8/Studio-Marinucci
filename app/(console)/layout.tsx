import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import '../globals.css'

/**
 * Layout della console.
 *
 * Radice separata da quella del sito pubblico: la console non ha barra dei
 * contatti, né navigazione, né footer con i dati d'albo, né banner dei cookie.
 * Sono elementi rivolti a chi visita il sito, e in un pannello di lavoro
 * sarebbero soltanto rumore.
 *
 * È il motivo per cui `app/layout.tsx` non esiste più e le pagine stanno in due
 * gruppi, `(sito)` e `(console)`: Next.js considera radice ogni layout senza un
 * altro layout sopra di sé. Vedi la documentazione in
 * node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md
 *
 * I caratteri sono gli stessi del sito: la console è un'altra stanza della stessa
 * casa, non un altro edificio.
 */
const spectral = localFont({
  src: [
    { path: '../fonts/spectral-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/spectral-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/spectral-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-serif',
  fallback: ['Georgia', 'Cambria', 'serif'],
})

const inter = localFont({
  src: [
    { path: '../fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'Area riservata',
  // La console non deve comparire nei risultati di ricerca in nessun caso,
  // nemmeno quando il sito sarà indicizzabile. Anche robots.txt la esclude.
  robots: { index: false, follow: false, nocache: true },
}

export const viewport: Viewport = {
  themeColor: '#0C2A2B',
  width: 'device-width',
  initialScale: 1,
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${spectral.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-paper">{children}</body>
    </html>
  )
}
