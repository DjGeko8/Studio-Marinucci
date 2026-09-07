import createMDX from '@next/mdx'

/**
 * Header di sicurezza.
 *
 * La CSP è volutamente stretta: il sito è statico e non carica nulla da terze parti.
 * Se in futuro si innesta un servizio esterno (es. il calendario di prenotazione),
 * il suo dominio va aggiunto qui *e* la mappa/iframe va comunque caricata solo dopo
 * il consenso ai cookie. Non allargare la CSP "per provare".
 */
const inSviluppo = process.env.NODE_ENV !== 'production'

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' sugli script è richiesto da Next per l'idratazione.
  // 'unsafe-eval' serve solo agli strumenti di sviluppo di React: in produzione
  // non viene mai emesso.
  `script-src 'self' 'unsafe-inline'${inSviluppo ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  // La mappa OpenStreetMap è l'unico iframe previsto, e solo dopo consenso.
  "frame-src 'self' https://www.openstreetmap.org",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Richiesto dall'adattatore OpenNext, che parte da `.next/standalone`.
  // Va dichiarato qui e non lasciato iniettare all'adattatore: cosi' `npm run build`
  // produce lo stesso risultato ovunque, e la pubblicazione automatica non dipende
  // da come e' configurato il comando di build nel pannello Cloudflare.
  output: 'standalone',

  pageExtensions: ['ts', 'tsx', 'mdx'],
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
