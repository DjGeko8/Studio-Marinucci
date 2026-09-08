import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLdBreadcrumb, JsonLdFaq } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { ButtonLink, Card, Container, Section, SectionHeading } from '@/components/ui'
import { articoliOrdinati } from '@/content/news'
import { formattaData, scadenzeOrdinate } from '@/content/scadenze'
import { servizi, trovaServizio } from '@/content/servizi'
import { contatti } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return servizi.map((servizio) => ({ slug: servizio.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const servizio = trovaServizio(slug)
  if (!servizio) return {}
  return {
    title: servizio.titolo,
    description: servizio.sintesi.slice(0, 155),
    alternates: { canonical: `/servizi/${servizio.slug}` },
  }
}

/** I tre passi sono uguali per tutte le aree: descrivono il metodo, non il servizio. */
const PASSI = [
  {
    numero: '01',
    titolo: 'Primo contatto',
    testo:
      'Una telefonata o un messaggio per inquadrare la richiesta. Se la questione non è di competenza dello studio, lo si dice subito.',
  },
  {
    numero: '02',
    titolo: 'Analisi e preventivo',
    testo:
      'Un incontro per esaminare la situazione e definire cosa serve. Il compenso è concordato per iscritto prima di iniziare.',
  },
  {
    numero: '03',
    titolo: 'Attività continuativa',
    testo:
      'Gestione degli adempimenti con le scadenze presidiate, e disponibilità per le decisioni che si presentano durante l’anno.',
  },
]

export default async function ServizioPage({ params }: Props) {
  const { slug } = await params
  const servizio = trovaServizio(slug)
  if (!servizio) notFound()

  const briciole = [
    { href: '/servizi', label: 'Aree di attività' },
    { href: `/servizi/${servizio.slug}`, label: servizio.titolo },
  ]

  const scadenzeCollegate = scadenzeOrdinate().filter((s) => s.servizio === servizio.slug)
  const articoliCollegati = articoliOrdinati().filter((a) => a.servizio === servizio.slug)
  const altreAree = servizi.filter((s) => s.slug !== servizio.slug).slice(0, 3)

  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />
      <JsonLdFaq faq={servizio.faq} />

      <PageHero
        briciole={briciole}
        eyebrow={servizio.destinatari}
        titolo={servizio.titolo}
        sommario={servizio.sintesi}
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="max-w-prose space-y-5 text-body text-ink-soft">
                {servizio.corpo.map((paragrafo, indice) => (
                  <p key={indice}>{paragrafo}</p>
                ))}
              </div>

              {/* Domande frequenti — alimentano anche lo structured data FAQPage */}
              {servizio.faq.length > 0 ? (
                <div className="mt-16">
                  <h2 className="text-title-md">Domande frequenti</h2>
                  <dl className="mt-8 max-w-prose">
                    {servizio.faq.map((voce) => (
                      <div key={voce.domanda} className="border-t border-line py-6">
                        <dt className="font-serif text-title-xs text-ink">{voce.domanda}</dt>
                        <dd className="mt-3 text-body-sm text-ink-soft">{voce.risposta}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>

            {/* Colonna laterale */}
            <aside className="lg:col-span-5">
              <div className="border-t border-line-strong pt-6">
                <p className="eyebrow">Come si lavora insieme</p>
                <ol className="mt-6 space-y-6">
                  {PASSI.map((passo) => (
                    <li key={passo.numero} className="flex gap-5">
                      <span className="font-serif text-title-xs text-brass" aria-hidden="true">
                        {passo.numero}
                      </span>
                      <span>
                        <span className="block font-serif text-title-xs text-ink">
                          {passo.titolo}
                        </span>
                        <span className="mt-2 block text-body-sm text-ink-soft">
                          {passo.testo}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {scadenzeCollegate.length > 0 ? (
                <div className="mt-12 border-t border-line-strong pt-6">
                  <p className="eyebrow">Scadenze collegate</p>
                  <ul className="mt-5 space-y-3">
                    {scadenzeCollegate.slice(0, 4).map((scadenza) => (
                      <li key={`${scadenza.data}-${scadenza.titolo}`} className="text-body-sm">
                        <span className="text-ink-muted">
                          {formattaData(scadenza.data, false)}
                        </span>{' '}
                        — <span className="text-ink">{scadenza.titolo}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/scadenze" className="link mt-4 inline-block text-body-sm">
                    Scadenzario completo
                  </Link>
                </div>
              ) : null}

              {articoliCollegati.length > 0 ? (
                <div className="mt-12 border-t border-line-strong pt-6">
                  <p className="eyebrow">Approfondimenti</p>
                  <ul className="mt-5 space-y-3">
                    {articoliCollegati.map((articolo) => (
                      <li key={articolo.slug}>
                        <Link
                          href={`/news/${articolo.slug}`}
                          className="link text-body-sm"
                        >
                          {articolo.titolo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-12 border-t border-line-strong pt-6">
                <p className="eyebrow">Parlarne</p>
                <div className="mt-5 flex flex-col gap-3">
                  <ButtonLink href={contatti.telefonoHref}>
                    Chiama · {contatti.telefono}
                  </ButtonLink>
                  <ButtonLink href="/appuntamento" tone="secondary">
                    Prenota un appuntamento
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="warm">
        <Container>
          <SectionHeading eyebrow="Altre aree" title="Anche di questo si occupa lo studio" />
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {altreAree.map((altra) => (
              <Card key={altra.slug} href={`/servizi/${altra.slug}`} title={altra.titolo}>
                {altra.sintesi}
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
