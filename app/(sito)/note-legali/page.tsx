import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { SezioniDocumento } from '@/components/SezioniPagina'
import { TestoRicco } from '@/components/TestoRicco'
import { Container, DatoRiga, Prose, Section, Tbd } from '@/components/ui'
import { sezioniVisibili, testiPagina } from '@/content/pagine'
import { contatti, datiObbligatori, professionista, sede, site } from '@/lib/site'

const testi = testiPagina('note-legali')

export const metadata: Metadata = {
  title: testi.titolo,
  description: testi.metaDescrizione,
  alternates: { canonical: '/note-legali' },
}

const briciole = [{ href: '/note-legali', label: 'Note legali' }]

/**
 * I testi discorsivi arrivano dalla console; i dati identificativi e gli estremi della
 * polizza no.
 *
 * Sono obbligatori — art. 5 del D.P.R. 137/2012 per la copertura assicurativa — e un
 * campo di testo libero è il posto sbagliato per un'informazione che non può mancare:
 * lì una riga si cancella per distrazione e nessuno se ne accorge. Restano quindi
 * generati da `lib/site.ts` e stampati qui sotto, ancorati alla sezione che li
 * introduce.
 */
export default function NoteLegaliPage() {
  const ancore = {
    esercente: (
      <dl className="mt-8">
        <DatoRiga label="Nome">{professionista.nomeCompleto}</DatoRiga>
        <DatoRiga label="Titolo professionale">{professionista.titolo}</DatoRiga>
        <DatoRiga label="Ordine di appartenenza">{professionista.ordine}</DatoRiga>
        <DatoRiga label="Numero di iscrizione">{professionista.numeroIscrizione}</DatoRiga>
        <DatoRiga label="Data di iscrizione">
          5 febbraio {professionista.annoIscrizione}
        </DatoRiga>
        <DatoRiga label="Registro dei Revisori Legali">
          <Tbd>{professionista.numeroRevisori}</Tbd>
        </DatoRiga>
        <DatoRiga label="Stato professionale">Italia</DatoRiga>
        <DatoRiga label="Domicilio professionale">{sede.completo}</DatoRiga>
        <DatoRiga label="Partita IVA">
          <Tbd>{datiObbligatori.partitaIva}</Tbd>
        </DatoRiga>
        <DatoRiga label="PEC">
          <Tbd>{contatti.pec}</Tbd>
        </DatoRiga>
        <DatoRiga label="Telefono">{contatti.telefono}</DatoRiga>
        <DatoRiga label="Email">
          <Tbd>{contatti.email}</Tbd>
        </DatoRiga>
      </dl>
    ),

    assicurazione: (
      <dl className="mt-8">
        <DatoRiga label="Compagnia">
          <Tbd>{datiObbligatori.polizza.compagnia}</Tbd>
        </DatoRiga>
        <DatoRiga label="Numero di polizza">
          <Tbd>{datiObbligatori.polizza.numero}</Tbd>
        </DatoRiga>
        <DatoRiga label="Massimale">
          <Tbd>{datiObbligatori.polizza.massimale}</Tbd>
        </DatoRiga>
      </dl>
    ),

    'titolare-sito': (
      <Prose>
        <p>
          {site.name} — {professionista.nomeCompleto}, {sede.completo}.
        </p>
      </Prose>
    ),
  }

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
          <SezioniDocumento sezioni={sezioniVisibili(testi)} ancore={ancore} />
        </Container>
      </Section>
    </>
  )
}
