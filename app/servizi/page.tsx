import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { ButtonLink, Card, Container, Section, SectionHeading } from '@/components/ui'
import { servizi } from '@/content/servizi'

export const metadata: Metadata = {
  title: 'Aree di attività',
  description:
    'Le aree di attività dello studio: contabilità, fisco, società, revisione legale e assistenza a privati. Termoli e basso Molise.',
  alternates: { canonical: '/servizi' },
}

const briciole = [{ href: '/servizi', label: 'Aree di attività' }]

export default function ServiziPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Cosa fa lo studio"
        titolo="Aree di attività"
        sommario="Dalla gestione ordinaria degli adempimenti alle scelte che li precedono. Ogni area indica a chi si rivolge e cosa comprende concretamente."
      />

      <Section>
        <Container>
          <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {servizi.map((servizio) => (
              <Card
                key={servizio.slug}
                href={`/servizi/${servizio.slug}`}
                eyebrow={servizio.destinatari}
                title={servizio.titolo}
              >
                {servizio.sintesi}
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="warm" size="compact">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-8">
            <SectionHeading
              title="Non trova quello che cerca?"
              intro="Se la sua esigenza non rientra chiaramente in una di queste aree, la strada più breve è descriverla: le si dirà se lo studio può occuparsene."
            />
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/contatti">Scriva allo studio</ButtonLink>
              <ButtonLink href="/appuntamento" tone="secondary">
                Prenota un appuntamento
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
