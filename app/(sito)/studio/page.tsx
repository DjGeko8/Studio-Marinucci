import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { Foto } from '@/components/Foto'
import { PageHero } from '@/components/PageHero'
import {
  ButtonLink,
  Container,
  DatoRiga,
  Section,
  SectionHeading,
  Tbd,
} from '@/components/ui'
import { professionista, sede } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Lo studio',
  description:
    'Dottore commercialista a Termoli, iscritto all’albo ODCEC di Larino dal 2001 e revisore legale. Percorso professionale e modo di lavorare dello studio.',
  alternates: { canonical: '/studio' },
}

const briciole = [{ href: '/studio', label: 'Lo studio' }]

export default function StudioPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Il professionista"
        titolo="Lo studio"
        sommario={`Lo studio del ${professionista.nomeCompleto} opera a ${sede.citta} e assiste imprese, professionisti e privati del basso Molise.`}
      />

      {/* Percorso professionale */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading eyebrow="Percorso" title="Massimo Marinucci" />
              <div className="mt-8 max-w-prose space-y-5 text-body text-ink-soft">
                <p>
                  Nato a {professionista.cittaNascita} nel {professionista.annoNascita}, si è
                  laureato in {professionista.laurea} ed è iscritto all&apos;
                  {professionista.ordine} dal 5 febbraio {professionista.annoIscrizione}, al
                  numero {professionista.numeroIscrizione}.
                </p>
                <p>
                  È inoltre iscritto al Registro dei Revisori Legali, al n.{' '}
                  <Tbd>{professionista.numeroRevisori}</Tbd>, e può assumere incarichi di
                  revisione legale dei conti e di componente di collegi sindacali.
                </p>
              </div>

              <div className="mt-12">
                <h2 className="text-title-md">Come lavora lo studio</h2>
                <div className="mt-6 max-w-prose space-y-5 text-body text-ink-soft">
                  <p>
                    Il lavoro parte sempre da un colloquio: capire l&apos;attività, la
                    struttura e gli obiettivi di chi si rivolge allo studio viene prima di
                    qualunque adempimento. Da lì si definisce cosa serve davvero, senza
                    sovrapporre servizi non necessari.
                  </p>
                  <p>
                    Gli adempimenti fiscali e contabili sono la parte visibile del lavoro. La
                    parte utile è l&apos;altra: arrivare alle scadenze avendo già deciso,
                    invece di decidere sotto scadenza.
                  </p>
                  <p>
                    Il rapporto è diretto e continuativo. Non ci sono passaggi di consegne:
                    chi chiama parla con il professionista che segue la pratica, e questo
                    vale sia per la gestione ordinaria sia per le questioni straordinarie.
                  </p>
                </div>
                {/* ⚠️ «TBD» — testo da riscrivere con le parole del professionista dopo un
                    colloquio. Questa è un'impalcatura, non un testo definitivo. */}
              </div>
            </div>

            <div className="lg:col-span-5">
              <Foto
                slot="ritratto-orizzontale"
                ratio="landscape"
                etichetta={`Ritratto del ${professionista.nomeCompleto}`}
                nota="Posa orizzontale per questa pagina, verticale per la home. Fotografia reale: mai generata o pesantemente ritoccata."
              />

              <dl className="mt-10">
                <DatoRiga label="Titolo">{professionista.titolo}</DatoRiga>
                <DatoRiga label="Ordine">{professionista.ordineBreve}</DatoRiga>
                <DatoRiga label="N. iscrizione albo">
                  {professionista.numeroIscrizione}
                </DatoRiga>
                <DatoRiga label="Iscritto dal">{professionista.annoIscrizione}</DatoRiga>
                <DatoRiga label="Registro Revisori Legali">
                  <Tbd>{professionista.numeroRevisori}</Tbd>
                </DatoRiga>
                <DatoRiga label="Titolo di studio">
                  Laurea in {professionista.laurea}
                </DatoRiga>
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      {/* Incarichi — sezione condizionata alla risposta del professionista */}
      <Section tone="warm">
        <Container>
          <SectionHeading
            eyebrow="Incarichi e attività"
            title="Incarichi ricoperti"
            intro="Sezione da compilare esclusivamente con incarichi reali: collegi sindacali, revisione di enti, consulenze tecniche d'ufficio, curatele, gestione della crisi da sovraindebitamento, docenze, pubblicazioni."
          />
          <div className="mt-8 max-w-prose rounded border-l-2 border-brass-soft bg-paper px-5 py-4 text-body-sm text-ink-soft">
            <p>
              <Tbd>«TBD:INCARICHI»</Tbd>
            </p>
            <p className="mt-3">
              Se non ci sono incarichi da segnalare, <strong>questa intera sezione va
              rimossa</strong>. Un elenco gonfiato è esattamente il dettaglio che un collega
              o un cliente informato verifica, e la sua smentita costa più di quanto la
              sezione possa aggiungere.
            </p>
          </div>
        </Container>
      </Section>

      {/* Ambiente — lo spazio dello studio */}
      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Foto
                slot="studio-tavolo-riunioni"
                ratio="landscape"
                etichetta="Il tavolo riunioni dello studio"
                nota="Nessun documento leggibile, nessun nome di cliente su faldoni o schermi: è un obbligo di riservatezza, non una preferenza estetica."
              />
            </div>
            <div className="lg:col-span-5">
              <SectionHeading
                as="h2"
                eyebrow="Lo spazio"
                title="Dove si lavora"
                intro="Gli incontri si tengono in studio, a Termoli. Chi preferisce può chiedere una videochiamata: per molte questioni è sufficiente, e fa risparmiare un viaggio."
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Chiusura */}
      <Section tone="dark" size="compact">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-8">
            <SectionHeading
              tone="dark"
              title="Un primo colloquio, senza impegno"
              intro="Per capire se lo studio è l'interlocutore giusto, la strada più breve è parlarne."
            />
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/appuntamento" tone="onDark">
                Prenota un appuntamento
              </ButtonLink>
              <ButtonLink href="/servizi" tone="onDark">
                Le aree di attività
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
