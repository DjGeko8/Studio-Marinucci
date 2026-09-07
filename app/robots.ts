import type { MetadataRoute } from 'next'

import { inAnteprima, site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Anteprima senza dominio definitivo: si chiude tutto. Vedi lib/site.ts.
  if (inAnteprima) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /showcase è la pagina interna del design system, /api non è contenuto.
        disallow: ['/showcase', '/api/'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  }
}
