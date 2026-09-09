import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { RevocaConsenso } from '@/components/RevocaConsenso'
import { SezioniDocumento } from '@/components/SezioniPagina'
import { TestoRicco } from '@/components/TestoRicco'
import { Container, Section } from '@/components/ui'
import { sezioniVisibili, testiPagina } from '@/content/pagine'
import { soloTesto } from '@/lib/testo-ricco'

const testi = testiPagina('cookie-policy')

export const metadata: Metadata = {
  title: testi.titolo,
  description: soloTesto(testi.metaDescrizione),
  alternates: { canonical: '/cookie-policy' },
}

const briciole = [{ href: '/cookie-policy', label: 'Cookie policy' }]

/**
 * Il pannello di revoca del consenso è ancorato alla sezione che lo annuncia: se un
 * giorno quella sezione viene spostata, il pannello la segue. Il testo che dice «dal
 * pannello qui sotto» resta vero senza che nessuno debba ricordarsene.
 */
export default function CookiePolicyPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow={testi.occhiello}
        titolo={testi.titolo}
        sommario={<TestoRicco>{testi.sommario}</TestoRicco>}
      />

      <Section>
        <Container width="narrow">
          <SezioniDocumento
            sezioni={sezioniVisibili(testi)}
            ancore={{ gestire: <RevocaConsenso /> }}
          />
        </Container>
      </Section>
    </>
  )
}
