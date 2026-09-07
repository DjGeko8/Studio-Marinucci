import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { ButtonLink, Container, Section, Tbd } from '@/components/ui'
import { contatti, orari, sede } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Prenota un appuntamento',
  description:
    'Prenoti un appuntamento con il Dott. Marinucci, in studio a Termoli o in videochiamata.',
  alternates: { canonical: '/appuntamento' },
}

const briciole = [{ href: '/appuntamento', label: 'Prenota un appuntamento' }]

/**
 * RICHIESTA DI APPUNTAMENTO — non prenotazione automatica.
 *
 * Scelta deliberata, vedi docs/FASE-2-ARCHITETTURA.md §5: un calendario che mostra
 * disponibilità non sincronizzate con l'agenda reale è peggio di nessun calendario,
 * perché una doppia prenotazione costa più fiducia di quanta ne guadagni la comodità.
 *
 * Qui l'utente indica due o tre preferenze e lo studio conferma. Se in seguito il
 * professionista collegherà la propria agenda (Cal.com o simile), il modulo viene
 * sostituito dall'incorporamento — che, essendo di terze parti, andrà caricato solo
 * dopo il consenso ai contenuti esterni, esattamente come la mappa.
 */
const PASSI = [
  {
    numero: '01',
    titolo: 'Indichi le sue preferenze',
    testo:
      'Due o tre alternative di giorno e fascia oraria, e se preferisce vedersi in studio o in videochiamata.',
  },
  {
    numero: '02',
    titolo: 'Lo studio conferma',
    testo:
      'Riceverà una conferma con data e ora definitive. Se nessuna delle preferenze è disponibile, le verrà proposta l’alternativa più vicina.',
  },
  {
    numero: '03',
    titolo: "Il giorno dell'incontro",
    testo:
      'Le verrà indicato in anticipo cosa portare, così il primo colloquio serve a decidere e non a raccogliere documenti.',
  },
]

export default function AppuntamentoPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Primo incontro"
        titolo="Prenota un appuntamento"
        sommario="In studio a Termoli o in videochiamata. Indichi le sue preferenze: lo studio conferma l'orario disponibile più vicino."
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-title-md">Richiesta di appuntamento</h2>
              <p className="mt-4 max-w-prose text-body-sm text-ink-soft">
                Il modulo non prenota automaticamente un orario: raccoglie le sue
                preferenze e lo studio conferma. È una scelta voluta — un calendario
                automatico non allineato con l&apos;agenda reale rischia di confermare
                orari già occupati.
              </p>
              <div className="mt-10">
                <ContactForm variante="appuntamento" oggettoIniziale="appuntamento" />
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="border-t border-line-strong pt-6">
                <p className="eyebrow">Come funziona</p>
                <ol className="mt-6 space-y-6">
                  {PASSI.map((passo) => (
                    <li key={passo.numero} className="flex gap-5">
                      <span className="font-serif text-title-xs text-brass" aria-hidden="true">
                        {passo.numero}
                      </span>
                      <span>
                        <span className="block font-serif text-title-xs text-ink">
                          {passo.titolo}
                        </span>
                        <span className="mt-2 block text-body-sm text-ink-soft">
                          {passo.testo}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-12 border-t border-line-strong pt-6">
                <p className="eyebrow">Dove</p>
                <p className="mt-5 text-body-sm text-ink-soft">
                  {sede.via}
                  <br />
                  {sede.cap} {sede.citta} ({sede.provincia})
                </p>
                <div className="mt-4 space-y-1 text-body-sm text-ink-soft">
                  {orari.righe.map((riga) => (
                    <p key={riga.giorni}>
                      {riga.giorni}: <Tbd>{riga.orario}</Tbd>
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-12 border-t border-line-strong pt-6">
                <p className="eyebrow">Preferisce parlarne subito?</p>
                <div className="mt-5">
                  <ButtonLink href={contatti.telefonoHref} tone="secondary">
                    Chiama · {contatti.telefono}
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  )
}
