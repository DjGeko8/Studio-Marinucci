import type { MetadataRoute } from 'next'

import { articoli, newsAttiva } from '@/content/news'
import { servizi } from '@/content/servizi'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const aggiornato = new Date()

  const fisse: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: aggiornato, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/studio`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${site.url}/servizi`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.9 },
    { url: `${site.url}/scadenze`, lastModified: aggiornato, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/appuntamento`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${site.url}/contatti`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${site.url}/dove-siamo`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${site.url}/note-legali`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site.url}/privacy`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site.url}/cookie-policy`, lastModified: aggiornato, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const areeAttivita: MetadataRoute.Sitemap = servizi.map((servizio) => ({
    url: `${site.url}/servizi/${servizio.slug}`,
    lastModified: aggiornato,
    changeFrequency: 'yearly',
    priority: 0.7,
  }))

  // La sezione approfondimenti entra nella sitemap solo quando è pubblicata.
  const approfondimenti: MetadataRoute.Sitemap = newsAttiva
    ? [
        { url: `${site.url}/news`, lastModified: aggiornato, changeFrequency: 'monthly', priority: 0.6 },
        ...articoli.map((articolo) => ({
          url: `${site.url}/news/${articolo.slug}`,
          lastModified: new Date(articolo.data),
          changeFrequency: 'yearly' as const,
          priority: 0.5,
        })),
      ]
    : []

  return [...fisse, ...areeAttivita, ...approfondimenti]
}
