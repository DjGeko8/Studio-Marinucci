import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { SezioniDocumento } from '@/components/SezioniPagina'
import { TestoRicco } from '@/components/TestoRicco'
import { Container, DatoRiga, Section, Tbd } from '@/components/ui'
import { sezioniVisibili, testiPagina } from '@/content/pagine'
import { contatti, datiObbligatori } from '@/lib/site'
import { soloTesto } from '@/lib/testo-ricco'

const testi = testiPagina('privacy')

export const metadata: Metadata = {
  title: testi.titolo,
  description: soloTesto(testi.metaDescrizione),
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

const briciole = [{ href: '/privacy', label: 'Informativa privacy' }]

/**
 * ⚠️ BOZZA DA VALIDARE
 *
 * L'informativa descrive i trattamenti effettuati dal SITO. Il trattamento dei dati
 * dei clienti nell'ambito dell'incarico professionale è cosa diversa e va disciplinato
 * da un'informativa separata, consegnata al conferimento dell'incarico: non si
 * sostituisce con questa pagina.
 *
 * Prima della pubblicazione va verificata da chi assiste lo studio sulla protezione
 * dei dati, e completata con i dati mancanti («TBD»).
 *
 * I testi sono modificabili dalla console; i recapiti del titolare no. Sono
 * l'informazione che gli articoli 13 e 14 del Regolamento impongono di dare per
 * prima: restano generati da `lib/site.ts`, ancorati alla sezione che li introduce.
 */
export default function PrivacyPage() {
  const recapiti = (
    <dl className="mt-8 max-w-prose">
      <DatoRiga label="Telefono">{contatti.telefono}</DatoRiga>
      <DatoRiga label="Email">
        <Tbd>{contatti.email}</Tbd>
      </DatoRiga>
      <DatoRiga label="PEC">
        <Tbd>{contatti.pec}</Tbd>
      </DatoRiga>
      {/* Per un professionista singolo la nomina di un responsabile della protezione
          dei dati non è quasi mai obbligatoria (art. 37 GDPR). Se in `lib/site.ts` il
          campo è `null` la riga sparisce, invece di dichiarare un ruolo inesistente. */}
      {datiObbligatori.dpo ? (
        <DatoRiga label="Responsabile della protezione dei dati">
          <Tbd>{datiObbligatori.dpo}</Tbd>
        </DatoRiga>
      ) : null}
    </dl>
  )

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
          <SezioniDocumento sezioni={sezioniVisibili(testi)} ancore={{ titolare: recapiti }} />
        </Container>
      </Section>
    </>
  )
}
