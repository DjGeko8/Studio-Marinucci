import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { RevocaConsenso } from '@/components/RevocaConsenso'
import { Container, Prose, Section } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Cookie policy',
  description:
    'Quali cookie e strumenti di memorizzazione utilizza il sito, e come gestire il consenso ai contenuti esterni.',
  alternates: { canonical: '/cookie-policy' },
}

const briciole = [{ href: '/cookie-policy', label: 'Cookie policy' }]

export default function CookiePolicyPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Cookie e strumenti simili"
        titolo="Cookie policy"
        sommario="Il sito non usa cookie di profilazione e non impiega strumenti di analisi di terze parti. Il consenso è richiesto per una sola cosa: la mappa."
      />

      <Section>
        <Container width="narrow">
          <Prose>
            <h2>Cosa memorizza il sito</h2>
            <p>
              Il sito utilizza un unico elemento di memorizzazione, tecnicamente necessario:
              una voce nella memoria locale del browser che conserva la scelta espressa sul
              consenso ai contenuti esterni. Serve a non riproporre il banner a ogni
              pagina. Non contiene dati identificativi, non viene trasmessa ad alcun server
              e resta sul dispositivo di chi visita.
            </p>

            <h2>Cosa il sito non fa</h2>
            <ul>
              <li>non installa cookie di profilazione o di marketing;</li>
              <li>
                non impiega strumenti di analisi statistica di terze parti, né in forma
                anonimizzata;
              </li>
              <li>
                non carica caratteri tipografici, immagini o script da domini esterni: i
                font sono ospitati sul dominio del sito;
              </li>
              <li>non condivide dati con circuiti pubblicitari.</li>
            </ul>

            <h2>Contenuti esterni: la mappa</h2>
            <p>
              L&apos;unico contenuto di terze parti previsto è la mappa presente nella
              pagina «Dove siamo», ospitata da OpenStreetMap. Caricandola, il browser si
              collega ai server di quel servizio, che viene così a conoscenza
              dell&apos;indirizzo IP del visitatore e delle informazioni tecniche
              normalmente trasmesse in una richiesta web.
            </p>
            <p>
              Per questa ragione la mappa <strong>non viene caricata</strong> finché il
              consenso non è stato prestato. Rifiutando, la pagina resta pienamente
              utilizzabile: l&apos;indirizzo dello studio è leggibile in chiaro ed è
              disponibile un collegamento esterno da aprire, se lo si desidera, in modo
              consapevole.
            </p>

            <h2>Gestire o revocare il consenso</h2>
            <p>
              La scelta può essere modificata in qualunque momento dal pannello qui sotto.
              La revoca ha effetto immediato: i contenuti esterni tornano a non essere
              caricati.
            </p>
          </Prose>

          <RevocaConsenso />

          <Prose className="mt-12">
            <h2>Impostazioni del browser</h2>
            <p>
              È inoltre possibile gestire o cancellare i dati memorizzati dai siti
              direttamente dalle impostazioni del proprio browser. La cancellazione della
              memoria locale comporta anche la rimozione della scelta espressa su questo
              sito: alla visita successiva il banner sarà nuovamente proposto.
            </p>

            <h2>Trattamento dei dati personali</h2>
            <p>
              Per ogni altro aspetto relativo al trattamento dei dati personali si rinvia
              all&apos;<Link href="/privacy">informativa privacy</Link>.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  )
}
