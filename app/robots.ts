import type { MetadataRoute } from 'next'

import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
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
