import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Container, DatoRiga, Prose, Section, Tbd } from '@/components/ui'
import {
  contatti,
  datiObbligatori,
  professionista,
  sede,
  site,
} from '@/lib/site'

export const metadata: Metadata = {
  title: 'Note legali',
  description:
    'Dati identificativi dell’esercente la professione, estremi di iscrizione all’albo e della polizza di responsabilità civile professionale.',
  alternates: { canonical: '/note-legali' },
}

const briciole = [{ href: '/note-legali', label: 'Note legali' }]

export default function NoteLegaliPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Trasparenza"
        titolo="Note legali"
        sommario="Dati identificativi dell'esercente la professione, estremi di iscrizione all'albo e della copertura assicurativa."
      />

      <Section>
        <Container width="narrow">
          <h2 className="text-title-md">Esercente la professione</h2>
          <dl className="mt-8">
            <DatoRiga label="Nome">{professionista.nomeCompleto}</DatoRiga>
            <DatoRiga label="Titolo professionale">{professionista.titolo}</DatoRiga>
            <DatoRiga label="Ordine di appartenenza">{professionista.ordine}</DatoRiga>
            <DatoRiga label="Numero di iscrizione">
              {professionista.numeroIscrizione}
            </DatoRiga>
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

          <Prose className="mt-14">
            <h2>Assicurazione per la responsabilità civile professionale</h2>
            <p>
              Ai sensi dell&apos;articolo 5 del D.P.R. 7 agosto 2012, n. 137, si rendono
              noti gli estremi della polizza di assicurazione per i danni derivanti
              dall&apos;esercizio dell&apos;attività professionale.
            </p>
          </Prose>

          <dl className="mt-8">
            <DatoRiga label="Compagnia">
              <Tbd>{datiObbligatori.polizzaRc}</Tbd>
            </DatoRiga>
            <DatoRiga label="Numero di polizza">
              <Tbd>{datiObbligatori.polizzaRc}</Tbd>
            </DatoRiga>
            <DatoRiga label="Massimale">
              <Tbd>{datiObbligatori.polizzaRc}</Tbd>
            </DatoRiga>
          </dl>

          <Prose className="mt-14">
            <h2>Norme professionali di riferimento</h2>
            <p>
              L&apos;attività è disciplinata dal decreto legislativo 28 giugno 2005, n. 139,
              istitutivo dell&apos;Ordine dei Dottori Commercialisti e degli Esperti
              Contabili, dal D.P.R. 7 agosto 2012, n. 137 in materia di riforma degli
              ordinamenti professionali e dal Codice deontologico della professione, ai
              quali si fa rinvio. Il testo del Codice deontologico è consultabile sul sito
              del Consiglio Nazionale dei Dottori Commercialisti e degli Esperti Contabili.
            </p>

            <h2>Natura delle informazioni pubblicate</h2>
            <p>
              I contenuti di questo sito hanno finalità esclusivamente informative. Non
              costituiscono parere professionale né consulenza riferita a un caso concreto,
              e non sono idonei a fondare decisioni senza un esame specifico della singola
              situazione. La consultazione del sito non instaura alcun rapporto
              professionale.
            </p>
            <p>
              La normativa fiscale è soggetta a modifiche frequenti: le informazioni
              pubblicate si riferiscono al momento della loro redazione e possono non essere
              più attuali.
            </p>

            <h2>Comunicazione informativa</h2>
            <p>
              Le informazioni contenute in questo sito sono diffuse nel rispetto dei limiti
              posti alla comunicazione informativa dell&apos;esercente la professione:
              rispondono a criteri di verità, correttezza e trasparenza, non contengono
              riferimenti comparativi con altri professionisti né elementi idonei a
              suggerire il conseguimento di determinati risultati.
            </p>

            <h2>Proprietà dei contenuti</h2>
            <p>
              I testi, le immagini e gli altri materiali pubblicati sono protetti dalle
              norme sul diritto d&apos;autore. Ne è consentita la consultazione personale;
              ogni riproduzione, anche parziale, per finalità diverse richiede
              l&apos;autorizzazione del titolare.
            </p>

            <h2>Collegamenti a siti esterni</h2>
            <p>
              Il sito può contenere collegamenti a risorse esterne. Il titolare non
              esercita alcun controllo su tali risorse e non risponde dei loro contenuti né
              delle modalità con cui trattano i dati dei visitatori.
            </p>

            <h2>Trattamento dei dati personali</h2>
            <p>
              Per il trattamento dei dati personali si rinvia all&apos;
              <Link href="/privacy">informativa privacy</Link> e alla{' '}
              <Link href="/cookie-policy">cookie policy</Link>.
            </p>

            <h2>Titolare del sito</h2>
            <p>
              {site.name} — {professionista.nomeCompleto}, {sede.completo}.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  )
}
