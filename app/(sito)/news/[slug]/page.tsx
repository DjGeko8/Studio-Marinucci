import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLdArticolo, JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Avvertenza, ButtonLink, Card, Container, Prose, Section } from '@/components/ui'
import { articoli, articoliOrdinati, trovaArticolo } from '@/content/news'
import { formattaData } from '@/content/scadenze'
import { trovaServizio } from '@/content/servizi'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return articoli.map((articolo) => ({ slug: articolo.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const articolo = trovaArticolo(slug)
  if (!articolo) return {}
  return {
    title: articolo.titolo,
    description: articolo.sommario.slice(0, 155),
    alternates: { canonical: `/news/${articolo.slug}` },
    openGraph: {
      type: 'article',
      title: articolo.titolo,
      description: articolo.sommario,
      publishedTime: articolo.data,
    },
  }
}

export default async function ArticoloPage({ params }: Props) {
  const { slug } = await params
  const articolo = trovaArticolo(slug)
  if (!articolo) notFound()

  // Il corpo vive in content/news/<slug>.mdx: un file per articolo, così chi scrive
  // tocca un solo file e non incontra mai il codice.
  const { default: Corpo } = await import(`@/content/news/${articolo.slug}.mdx`)

  const briciole = [
    { href: '/news', label: 'Approfondimenti' },
    { href: `/news/${articolo.slug}`, label: articolo.titolo },
  ]
  const servizio = articolo.servizio ? trovaServizio(articolo.servizio) : undefined
  const altri = articoliOrdinati()
    .filter((a) => a.slug !== articolo.slug)
    .slice(0, 3)

  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />
      <JsonLdArticolo
        titolo={articolo.titolo}
        sommario={articolo.sommario}
        data={articolo.data}
        slug={articolo.slug}
      />

      <PageHero
        briciole={briciole}
        eyebrow={`${formattaData(articolo.data)} · ${articolo.lettura} minuti di lettura`}
        titolo={articolo.titolo}
        sommario={articolo.sommario}
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <article className="lg:col-span-8">
              <Prose>
                <Corpo />
              </Prose>

              {/* Nota informativa obbligatoria: aggiunta dal modello, mai dal testo. */}
              <Avvertenza>
                Il contenuto ha finalità informative generali e non costituisce consulenza
                riferita al caso concreto. Per la propria situazione è necessario un esame
                specifico.
              </Avvertenza>
            </article>

            <aside className="lg:col-span-4">
              {servizio ? (
                <div className="border-t border-line-strong pt-6">
                  <p className="eyebrow">Area collegata</p>
                  <h2 className="mt-4 font-serif text-title-xs text-ink">
                    <Link href={`/servizi/${servizio.slug}`} className="no-underline hover:text-petrolio-700">
                      {servizio.titolo}
                    </Link>
                  </h2>
                  <p className="mt-3 text-body-sm text-ink-soft">{servizio.sintesi}</p>
                </div>
              ) : null}

              <div className="mt-12 border-t border-line-strong pt-6">
                <p className="eyebrow">Una domanda sul suo caso?</p>
                <p className="mt-4 text-body-sm text-ink-soft">
                  Un articolo descrive la regola generale. La sua situazione può contenere
                  elementi che la cambiano.
                </p>
                <div className="mt-5">
                  <ButtonLink href="/contatti">Scriva allo studio</ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {altri.length > 0 ? (
        <Section tone="warm">
          <Container>
            <h2 className="text-title-md">Altri approfondimenti</h2>
            <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {altri.map((altro) => (
                <Card
                  key={altro.slug}
                  href={`/news/${altro.slug}`}
                  eyebrow={formattaData(altro.data)}
                  title={altro.titolo}
                >
                  {altro.sommario}
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  )
}
