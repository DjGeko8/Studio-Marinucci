import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { ScadenzeElenco } from '@/components/ScadenzeElenco'
import { Avvertenza, ButtonLink, Container, Section } from '@/components/ui'
import { annoScadenzario, scadenzeOrdinate } from '@/content/scadenze'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: `Scadenzario fiscale ${annoScadenzario}`,
  description: `Scadenzario fiscale ${annoScadenzario}: le date da rispettare per imprese, professionisti, forfettari e privati. A cura dello ${site.name}, Termoli.`,
  alternates: { canonical: '/scadenze' },
}

const briciole = [{ href: '/scadenze', label: 'Scadenzario fiscale' }]

export default function ScadenzePage() {
  // Data della build: il sito è statico, quindi «scaduta» si riferisce al momento
  // dell'ultima pubblicazione. Ricostruire il sito aggiorna l'evidenza.
  const oggi = new Date().toISOString().slice(0, 10)

  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow={`Anno ${annoScadenzario}`}
        titolo="Scadenzario fiscale"
        sommario="Le principali scadenze dell'anno, filtrabili per tipo di contribuente. Le date già trascorse restano consultabili, attenuate."
      />

      <Section>
        <Container>
          <ScadenzeElenco scadenze={scadenzeOrdinate()} oggi={oggi} />

          <div className="max-w-prose">
            <Avvertenza>
              Lo scadenzario ha finalità informative. Le scadenze possono essere modificate
              o differite da provvedimenti successivi, e alcune slittano al primo giorno
              lavorativo utile quando cadono di sabato o in giorno festivo. Per gli
              adempimenti che la riguardano è opportuna una verifica con lo studio.
            </Avvertenza>
          </div>
        </Container>
      </Section>

      <Section tone="warm" size="compact">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-prose">
              <h2 className="text-title-md">Non è sicuro di quali la riguardino?</h2>
              <p className="mt-4 text-body text-ink-soft">
                Gli adempimenti cambiano con il regime fiscale, la forma giuridica e il tipo
                di attività. Lo studio presidia le scadenze dei propri assistiti e prepara i
                calcoli in anticipo, così i versamenti non arrivano inattesi.
              </p>
            </div>
            <ButtonLink href="/contatti">Scriva allo studio</ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  )
}
