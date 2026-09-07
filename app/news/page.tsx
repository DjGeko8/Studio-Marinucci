import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Card, Container, Section } from '@/components/ui'
import { articoliOrdinati } from '@/content/news'
import { formattaData } from '@/content/scadenze'
import { trovaServizio } from '@/content/servizi'

export const metadata: Metadata = {
  title: 'Approfondimenti',
  description:
    'Note su adempimenti e novità fiscali, scritte per chi non è del mestiere. A cura dello Studio Marinucci, Termoli.',
  alternates: { canonical: '/news' },
}

const briciole = [{ href: '/news', label: 'Approfondimenti' }]

export default function NewsPage() {
  const articoli = articoliOrdinati()

  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Note dello studio"
        titolo="Approfondimenti"
        sommario="Su questioni che ricorrono davvero, scritte per chi non è del mestiere. Pochi articoli, aggiornati quando serve."
      />

      <Section>
        <Container>
          <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {articoli.map((articolo) => {
              const servizio = articolo.servizio ? trovaServizio(articolo.servizio) : undefined
              return (
                <Card
                  key={articolo.slug}
                  href={`/news/${articolo.slug}`}
                  eyebrow={`${formattaData(articolo.data)} · ${articolo.lettura} min`}
                  title={articolo.titolo}
                  meta={servizio ? servizio.titolo : undefined}
                >
                  {articolo.sommario}
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>
    </>
  )
}
