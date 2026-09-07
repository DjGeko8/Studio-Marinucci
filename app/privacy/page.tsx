import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Container, DatoRiga, Prose, Section, Tbd } from '@/components/ui'
import { contatti, professionista, sede } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Informativa privacy',
  description:
    'Informativa sul trattamento dei dati personali ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679.',
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
 */
export default function PrivacyPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Protezione dei dati"
        titolo="Informativa privacy"
        sommario="Come vengono trattati i dati personali raccolti attraverso questo sito, ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679."
      />

      <Section>
        <Container width="narrow">
          <Prose>
            <h2>Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento è {professionista.nomeCompleto},{' '}
              {professionista.titolo}, con studio in {sede.completo}.
            </p>
          </Prose>

          <dl className="mt-8 max-w-prose">
            <DatoRiga label="Telefono">{contatti.telefono}</DatoRiga>
            <DatoRiga label="Email">
              <Tbd>{contatti.email}</Tbd>
            </DatoRiga>
            <DatoRiga label="PEC">
              <Tbd>{contatti.pec}</Tbd>
            </DatoRiga>
            <DatoRiga label="Responsabile della protezione dei dati">
              <Tbd>«TBD:DPO»</Tbd> — da indicare se nominato; in caso contrario la voce va
              rimossa.
            </DatoRiga>
          </dl>

          <Prose className="mt-12">
            <h2>Quali dati vengono raccolti</h2>
            <p>
              Il sito raccoglie dati personali soltanto quando è l&apos;interessato a
              fornirli, compilando il modulo di contatto o quello di richiesta
              appuntamento. I dati richiesti sono: nome e cognome, indirizzo email,
              eventualmente il numero di telefono, l&apos;oggetto della richiesta e il
              testo del messaggio.
            </p>
            <p>
              Il modulo invita espressamente a non inserire dati sensibili o documenti
              riservati: per la trasmissione di documentazione fiscale si concorda un
              canale adeguato dopo il primo contatto.
            </p>
            <p>
              Il sito non utilizza strumenti di analisi statistica di terze parti, non
              profila i visitatori e non impiega cookie di marketing. I caratteri
              tipografici sono ospitati sul dominio del sito: la loro visualizzazione non
              comporta alcuna connessione verso fornitori esterni.
            </p>

            <h2>Finalità e base giuridica</h2>
            <p>
              I dati inviati tramite i moduli sono trattati per <strong>dare riscontro
              alla richiesta</strong> e, se del caso, per valutare l&apos;eventuale
              conferimento di un incarico professionale. La base giuridica è
              l&apos;esecuzione di misure precontrattuali adottate su richiesta
              dell&apos;interessato (art. 6, par. 1, lett. b del Regolamento).
            </p>
            <p>
              Il caricamento della mappa presente nella pagina «Dove siamo» avviene
              esclusivamente sulla base del <strong>consenso</strong> (art. 6, par. 1,
              lett. a), revocabile in ogni momento dalla{' '}
              <Link href="/cookie-policy">cookie policy</Link>.
            </p>

            <h2>Conferimento dei dati</h2>
            <p>
              Il conferimento dei dati contrassegnati come obbligatori nel modulo è
              necessario per poter rispondere: senza di essi la richiesta non può essere
              evasa. Il conferimento del numero di telefono è facoltativo.
            </p>

            <h2>Periodo di conservazione</h2>
            <p>
              Le richieste che non danno luogo a un rapporto professionale sono conservate
              per il tempo necessario a gestire il riscontro e comunque non oltre{' '}
              <Tbd>«TBD:CONSERVAZIONE»</Tbd> mesi. Se dalla richiesta nasce un incarico, i
              dati confluiscono nel rapporto professionale e sono conservati secondo i
              termini di legge applicabili a quell&apos;attività, indicati
              nell&apos;informativa consegnata al conferimento dell&apos;incarico.
            </p>

            <h2>Destinatari</h2>
            <p>
              I dati non sono diffusi e non sono comunicati a terzi per finalità proprie di
              questi ultimi. Possono venirne a conoscenza i fornitori di servizi tecnici
              che operano per conto del titolare — in particolare il fornitore di hosting e
              il fornitore del servizio di posta elettronica — nominati responsabili del
              trattamento ai sensi dell&apos;articolo 28 del Regolamento.
            </p>
            <p>
              <Tbd>«TBD:HOSTING»</Tbd> — l&apos;elenco dei fornitori va completato una volta
              scelto l&apos;hosting, indicando anche se il trattamento avviene interamente
              nello Spazio economico europeo.
            </p>

            <h2>Trasferimenti extra UE</h2>
            <p>
              Non sono previsti trasferimenti di dati personali verso Paesi terzi, salvo
              quanto eventualmente derivante dal caricamento volontario della mappa
              esterna, che avviene solo previo consenso.
            </p>

            <h2>Diritti dell&apos;interessato</h2>
            <p>
              L&apos;interessato può esercitare in ogni momento i diritti previsti dagli
              articoli da 15 a 22 del Regolamento: accesso ai propri dati, rettifica,
              cancellazione, limitazione del trattamento, portabilità e opposizione. Quando
              il trattamento si fonda sul consenso, questo è revocabile in qualsiasi
              momento, senza che ciò pregiudichi la liceità del trattamento effettuato
              prima della revoca.
            </p>
            <p>
              Le richieste vanno indirizzate al titolare ai recapiti indicati in apertura.
              È inoltre riconosciuto il diritto di proporre reclamo al Garante per la
              protezione dei dati personali (Piazza Venezia 11, 00187 Roma —{' '}
              <a href="https://www.gpdp.it" target="_blank" rel="noopener noreferrer">
                gpdp.it
              </a>
              ).
            </p>

            <h2>Processi decisionali automatizzati</h2>
            <p>
              Non sono effettuati processi decisionali automatizzati né attività di
              profilazione.
            </p>

            <h2>Sicurezza</h2>
            <p>
              Il sito è servito esclusivamente su connessione cifrata. Il modulo di contatto
              adotta misure antispam che non richiedono all&apos;utente di risolvere test o
              enigmi. I dati personali non sono mai inseriti in indirizzi di pagina o in
              parametri di ricerca.
            </p>

            <h2>Aggiornamenti</h2>
            <p>
              La presente informativa può essere aggiornata. La versione pubblicata su
              questa pagina è quella vigente.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  )
}
