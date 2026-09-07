import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { CookieBanner } from '@/components/CookieBanner'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { JsonLdProfessionista, JsonLdStudio } from '@/components/JsonLd'
import { site } from '@/lib/site'

import './globals.css'

/**
 * FONT SELF-HOSTED
 *
 * I file .woff2 stanno in `app/fonts/` e sono versionati nel repository: il sito non
 * contatta Google Fonts né alcun altro dominio esterno. Non è solo una scelta di
 * velocità — evita il trasferimento dell'indirizzo IP di chi visita verso un fornitore
 * terzo, che andrebbe altrimenti dichiarato nell'informativa e, con ogni probabilità,
 * subordinato al consenso.
 *
 * Sottoinsieme: solo latino, solo tondo, tre pesi per famiglia. Circa 135 kB in tutto.
 * I file provengono dai pacchetti @fontsource (licenza SIL Open Font License);
 * per aggiornarli si ricopiano da node_modules, vedi README.
 */
const spectral = localFont({
  src: [
    { path: './fonts/spectral-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/spectral-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/spectral-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-serif',
  fallback: ['Georgia', 'Cambria', 'serif'],
})

const inter = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Dottore Commercialista a Termoli`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} — Dottore Commercialista a Termoli`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#17474A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${spectral.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#contenuto" className="skip-link">
          Salta al contenuto
        </a>
        <Header />
        <main id="contenuto" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
        {/* Identità dello studio e del professionista: valgono per tutto il sito. */}
        <JsonLdStudio />
        <JsonLdProfessionista />
      </body>
    </html>
  )
}
