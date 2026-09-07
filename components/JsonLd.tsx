import type { Briciola } from '@/components/PageHero'
import {
  areaServita,
  contatti,
  datiObbligatori,
  orari,
  professionista,
  sede,
  site,
} from '@/lib/site'

/**
 * Dati strutturati.
 *
 * Regola: qui non entra nulla che non sia vero e verificabile. I dati ancora mancanti
 * vengono OMESSI, non riempiti con valori plausibili — un dato inventato nello schema
 * finisce nei risultati di ricerca e nella scheda dell'attività.
 */

function Blocco({ dati }: { dati: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // I dati provengono da file di contenuto del progetto, non da input esterni.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dati) }}
    />
  )
}

/** Vero se il valore è un dato reale e non un segnaposto «TBD:…». */
function reale(valore: string | null | undefined): valore is string {
  return typeof valore === 'string' && valore.length > 0 && !valore.startsWith('«TBD:')
}

export function JsonLdStudio() {
  const indirizzo = {
    '@type': 'PostalAddress',
    streetAddress: sede.via,
    postalCode: sede.cap,
    addressLocality: sede.citta,
    addressRegion: sede.provincia,
    addressCountry: sede.nazione,
  }

  const dati: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': `${site.url}/#studio`,
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: contatti.telefonoE164,
    address: indirizzo,
    areaServed: areaServita.map((nome) => ({ '@type': 'Place', name: nome })),
    priceRange: '$$',
    founder: { '@id': `${site.url}/#professionista` },
    knowsLanguage: 'it',
  }

  // Aggiunti solo quando i dati reali sono disponibili.
  if (reale(contatti.email)) dati.email = contatti.email
  if (reale(datiObbligatori.partitaIva)) dati.vatID = datiObbligatori.partitaIva
  if (sede.lat !== null && sede.lng !== null) {
    dati.geo = { '@type': 'GeoCoordinates', latitude: sede.lat, longitude: sede.lng }
  }
  if (orari.confermati) {
    // «TBD:ORARI» — da compilare in forma `Mo-Fr 09:00-13:00` quando confermati.
    dati.openingHours = orari.righe.map((r) => r.orario).filter(reale)
  }

  return <Blocco dati={dati} />
}

export function JsonLdProfessionista() {
  const dati: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}/#professionista`,
    name: professionista.nomeCompleto,
    givenName: 'Massimo',
    familyName: 'Marinucci',
    jobTitle: professionista.titolo,
    url: `${site.url}/studio`,
    worksFor: { '@id': `${site.url}/#studio` },
    memberOf: { '@type': 'Organization', name: professionista.ordine },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Iscrizione albo professionale',
      recognizedBy: { '@type': 'Organization', name: professionista.ordine },
      identifier: professionista.numeroIscrizione,
    },
    knowsAbout: [
      'Consulenza fiscale',
      'Contabilità e bilancio',
      'Revisione legale',
      'Diritto tributario',
    ],
  }
  return <Blocco dati={dati} />
}

export function JsonLdBreadcrumb({ briciole }: { briciole: Briciola[] }) {
  const elementi = [{ href: '/', label: 'Home' }, ...briciole]
  return (
    <Blocco
      dati={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: elementi.map((elemento, indice) => ({
          '@type': 'ListItem',
          position: indice + 1,
          name: elemento.label,
          item: `${site.url}${elemento.href}`,
        })),
      }}
    />
  )
}

export function JsonLdFaq({ faq }: { faq: { domanda: string; risposta: string }[] }) {
  if (faq.length === 0) return null
  return (
    <Blocco
      dati={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((voce) => ({
          '@type': 'Question',
          name: voce.domanda,
          acceptedAnswer: { '@type': 'Answer', text: voce.risposta },
        })),
      }}
    />
  )
}

export function JsonLdArticolo({
  titolo,
  sommario,
  data,
  slug,
}: {
  titolo: string
  sommario: string
  data: string
  slug: string
}) {
  return (
    <Blocco
      dati={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: titolo,
        description: sommario,
        datePublished: data,
        dateModified: data,
        inLanguage: 'it',
        author: { '@id': `${site.url}/#professionista` },
        publisher: { '@id': `${site.url}/#studio` },
        mainEntityOfPage: `${site.url}/news/${slug}`,
      }}
    />
  )
}
