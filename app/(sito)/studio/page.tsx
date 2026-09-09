import type { Metadata } from 'next'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { Foto } from '@/components/Foto'
import { PageHero } from '@/components/PageHero'
import { Blocchi } from '@/components/SezioniPagina'
import { TestoRicco } from '@/components/TestoRicco'
import {
  ButtonLink,
  Container,
  DatoRiga,
  Section,
  SectionHeading,
  Tbd,
} from '@/components/ui'
import { sezione, testiPagina, type Sezione } from '@/content/pagine'
import { professionista } from '@/lib/site'
import { soloTesto } from '@/lib/testo-ricco'

const testi = testiPagina('studio')

export const metadata: Metadata = {
  title: testi.titolo,
  description: soloTesto(testi.metaDescrizione),
  alternates: { canonical: '/studio' },
}

const briciole = [{ href: '/studio', label: 'Lo studio' }]

/**
 * Questa pagina non è un documento ma un'impaginazione: le sezioni hanno un posto
 * assegnato accanto a una fotografia o a una tabella di dati. Per questo la console
 * può riscriverle ma non può aggiungerne — una sezione inventata non avrebbe dove
 * andare — e per questo le colloca qui il codice, una per una.
 */

/** Il primo paragrafo fa da introduzione in caratteri grandi, come nel disegno. */
function intro(s: Sezione): string | null {
  const primo = s.blocchi[0]
  return primo && primo.tipo === 'paragrafo' ? primo.testo : null
}

function resto(s: Sezione): Sezione['blocchi'] {
  return s.blocchi.slice(1)
}

export default function StudioPage() {
  const percorso = sezione(testi, 'percorso')
  const metodo = sezione(testi, 'metodo')
  const incarichi = sezione(testi, 'incarichi')
  const spazio = sezione(testi, 'spazio')
  const chiusura = sezione(testi, 'chiusura')

  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow={testi.occhiello}
        titolo={testi.titolo}
        sommario={<TestoRicco>{testi.sommario}</TestoRicco>}
      />

      {/* Percorso professionale — accanto, i dati d'albo, che restano generati */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {percorso ? (
                <>
                  <SectionHeading
                    eyebrow={percorso.occhiello}
                    title={<TestoRicco>{percorso.titolo ?? ''}</TestoRicco>}
                  />
                  <div className="mt-8 max-w-prose space-y-5 text-body text-ink-soft">
                    <Blocchi blocchi={percorso.blocchi} />
                  </div>
                </>
              ) : null}

              {metodo ? (
                <div className="mt-12">
                  <h2 className="text-title-md">
                    <TestoRicco>{metodo.titolo ?? ''}</TestoRicco>
                  </h2>
                  <div className="mt-6 max-w-prose space-y-5 text-body text-ink-soft">
                    <Blocchi blocchi={metodo.blocchi} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-5">
              <Foto
                slot="ritratto-orizzontale"
                ratio="landscape"
                etichetta={`Ritratto del ${professionista.nomeCompleto}`}
                nota="Posa orizzontale per questa pagina, verticale per la home. Fotografia reale: mai generata o pesantemente ritoccata."
              />

              {/* Dati d'albo: generati da lib/site.ts, non modificabili dalla console.
                  Sono la qualifica che il codice deontologico impone di rendere
                  riconoscibile, e devono coincidere con il footer di ogni pagina. */}
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

      {/* Incarichi — la sezione si toglie dalla console quando non ce ne sono */}
      {incarichi ? (
        <Section tone="warm">
          <Container>
            <SectionHeading
              eyebrow={incarichi.occhiello}
              title={<TestoRicco>{incarichi.titolo ?? ''}</TestoRicco>}
              intro={
                intro(incarichi) ? <TestoRicco>{intro(incarichi) ?? ''}</TestoRicco> : undefined
              }
            />
            {resto(incarichi).length > 0 ? (
              <div className="mt-8 max-w-prose space-y-3 rounded border-l-2 border-brass-soft bg-paper px-5 py-4 text-body-sm text-ink-soft">
                <Blocchi blocchi={resto(incarichi)} />
              </div>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {/* Lo spazio dello studio */}
      {spazio ? (
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
                  eyebrow={spazio.occhiello}
                  title={<TestoRicco>{spazio.titolo ?? ''}</TestoRicco>}
                  intro={intro(spazio) ? <TestoRicco>{intro(spazio) ?? ''}</TestoRicco> : undefined}
                />
                {resto(spazio).length > 0 ? (
                  <div className="mt-5 max-w-prose space-y-5 text-body text-ink-soft">
                    <Blocchi blocchi={resto(spazio)} />
                  </div>
                ) : null}
              </div>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Chiusura */}
      {chiusura ? (
        <Section tone="dark" size="compact">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-8">
              <SectionHeading
                tone="dark"
                title={<TestoRicco>{chiusura.titolo ?? ''}</TestoRicco>}
                intro={
                  intro(chiusura) ? <TestoRicco>{intro(chiusura) ?? ''}</TestoRicco> : undefined
                }
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
      ) : null}
    </>
  )
}
