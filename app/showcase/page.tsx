import type { Metadata } from 'next'

import {
  Avvertenza,
  ButtonLink,
  Card,
  Container,
  DatoRiga,
  Eyebrow,
  ImagePlaceholder,
  Prose,
  Section,
  SectionHeading,
  Tbd,
} from '@/components/ui'

/**
 * Pagina di showcase del design system — strumento interno, non parte del sito.
 * Serve ad approvare token e componenti prima di costruire le pagine reali.
 * È esclusa dall'indicizzazione e va rimossa (o lasciata, è innocua) alla consegna.
 */
export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
}

const colori = [
  { nome: 'petrolio-900', classe: 'bg-petrolio-900', uso: 'Footer, fondi profondi' },
  { nome: 'petrolio-800', classe: 'bg-petrolio-800', uso: 'Barra contatti, sezioni scure' },
  { nome: 'petrolio-700', classe: 'bg-petrolio-700', uso: 'Primario: pulsanti, titoli' },
  { nome: 'petrolio-600', classe: 'bg-petrolio-600', uso: 'Sopratitoli, focus ring' },
  { nome: 'petrolio-100', classe: 'bg-petrolio-100', uso: 'Selezione, fondi tenui' },
  { nome: 'brass', classe: 'bg-brass', uso: 'Accento: filetti, voce attiva' },
  { nome: 'brass-soft', classe: 'bg-brass-soft', uso: 'Bordo delle avvertenze' },
  { nome: 'brass-pale', classe: 'bg-brass-pale', uso: 'Evidenza dei segnaposto' },
  { nome: 'paper', classe: 'bg-paper ring-1 ring-line', uso: 'Fondo dominante' },
  { nome: 'paper-warm', classe: 'bg-paper-warm', uso: 'Sezioni alternate' },
  { nome: 'stone', classe: 'bg-stone', uso: 'Segnaposto, fondi terziari' },
  { nome: 'line', classe: 'bg-line', uso: 'Filetti di separazione' },
  { nome: 'ink', classe: 'bg-ink', uso: 'Testo principale' },
  { nome: 'ink-soft', classe: 'bg-ink-soft', uso: 'Testo secondario' },
  { nome: 'ink-muted', classe: 'bg-ink-muted', uso: 'Etichette, metadati' },
]

const scalaTesto = [
  { classe: 'text-display', nome: 'display · 60px', esempio: 'Studio Marinucci' },
  { classe: 'text-title-xl', nome: 'title-xl · 48px', esempio: 'Titolo di apertura' },
  { classe: 'text-title-lg', nome: 'title-lg · 38px', esempio: 'Titolo di sezione' },
  { classe: 'text-title-md', nome: 'title-md · 30px', esempio: 'Titolo di paragrafo' },
  { classe: 'text-title-sm', nome: 'title-sm · 24px', esempio: 'Titolo di scheda' },
  { classe: 'text-title-xs', nome: 'title-xs · 20px', esempio: 'Titolo minore' },
]

export default function ShowcasePage() {
  return (
    <>
      <Section tone="warm" size="compact">
        <Container>
          <Eyebrow>Documento interno</Eyebrow>
          <h1 className="mt-4 text-title-xl">Design system</h1>
          <p className="mt-5 max-w-prose text-body-lg text-ink-soft">
            Token e componenti del sito. Questa pagina non fa parte del sito pubblico ed è
            esclusa dall&apos;indicizzazione: serve ad approvare l&apos;identità visiva prima
            di costruire le pagine reali.
          </p>
        </Container>
      </Section>

      {/* ── Colore ───────────────────────────────────────────────── */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="01 · Colore"
            title="Verde petrolio, bianco caldo, un solo accento"
            intro="Il verde petrolio evita il blu aziendale banale e richiama il mare senza illustrarlo. L'ottone attenuato è l'unico accento: filetti e dettagli, mai campiture."
          />
          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {colori.map((c) => (
              <li key={c.nome}>
                <div className={`h-20 w-full rounded ${c.classe}`} />
                <p className="mt-3 font-mono text-body-sm text-ink">{c.nome}</p>
                <p className="mt-1 text-body-sm text-ink-muted">{c.uso}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── Tipografia ───────────────────────────────────────────── */}
      <Section tone="warm">
        <Container>
          <SectionHeading
            eyebrow="02 · Tipografia"
            title="Spectral per i titoli, Inter per il testo"
            intro="Due famiglie, non di più. Il corpo parte da 18px con interlinea larga: una parte del pubblico dello studio non ha vent'anni, e su un sito di consulenza la leggibilità viene prima dell'eleganza."
          />

          <div className="mt-12 space-y-8">
            {scalaTesto.map((t) => (
              <div key={t.nome} className="border-t border-line pt-5">
                <p className="font-mono text-body-sm text-ink-muted">{t.nome}</p>
                <p className={`mt-2 font-serif ${t.classe}`}>{t.esempio}</p>
              </div>
            ))}

            <div className="border-t border-line pt-5">
              <p className="font-mono text-body-sm text-ink-muted">
                body · 18px — testo corrente
              </p>
              <p className="mt-2 max-w-prose text-body text-ink-soft">
                Lo studio assiste imprese, lavoratori autonomi e privati del basso Molise
                negli adempimenti fiscali e contabili, nelle scelte societarie e nei
                rapporti con l&apos;amministrazione finanziaria. Il rapporto è diretto: chi
                si rivolge allo studio trova sempre lo stesso interlocutore.
              </p>
            </div>

            <div className="border-t border-line pt-5">
              <p className="font-mono text-body-sm text-ink-muted">
                eyebrow · maiuscoletto spaziato
              </p>
              <Eyebrow>Dottore Commercialista · Revisore Legale · Termoli</Eyebrow>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Componenti ───────────────────────────────────────────── */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="03 · Componenti"
            title="Filetti e spazio al posto di riquadri e ombre"
          />

          <div className="mt-12 space-y-14">
            <div>
              <p className="eyebrow">Pulsanti</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <ButtonLink href="/showcase">Prenota un appuntamento</ButtonLink>
                <ButtonLink href="/showcase" tone="secondary">
                  Chiama lo studio
                </ButtonLink>
                <ButtonLink href="/showcase" tone="ghost">
                  Vedi tutte le aree →
                </ButtonLink>
              </div>
            </div>

            <div>
              <p className="eyebrow">Schede</p>
              <div className="mt-4 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                <Card href="/showcase" eyebrow="Area di attività" title="Contabilità e bilancio">
                  Tenuta della contabilità, scritture, bilancio d&apos;esercizio e adempimenti
                  periodici, con verifica costante dell&apos;andamento durante l&apos;anno.
                </Card>
                <Card
                  href="/showcase"
                  eyebrow="Area di attività"
                  title="Revisione legale e collegi sindacali"
                >
                  Incarichi di revisione legale dei conti e partecipazione a collegi
                  sindacali e organi di controllo.
                </Card>
                <Card eyebrow="16 dicembre" title="Saldo IMU" meta="Imprese · Privati">
                  Versamento della seconda rata dell&apos;imposta municipale propria.
                </Card>
              </div>
            </div>

            <div>
              <p className="eyebrow">Segnaposto fotografici</p>
              <p className="mt-2 max-w-prose text-body-sm text-ink-soft">
                Deliberatamente evidenti: non devono passare inosservati in produzione. Non
                sono immagini generate — le fotografie del professionista e dello studio
                devono essere reali.
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-3">
                <ImagePlaceholder
                  ratio="portrait"
                  label="Ritratto del professionista"
                  nota="Luce naturale, sguardo in camera"
                />
                <ImagePlaceholder
                  ratio="landscape"
                  label="Ingresso dello studio"
                  nota="Serve anche a farsi trovare"
                />
                <ImagePlaceholder
                  ratio="landscape"
                  tone="dark"
                  label="Termoli, borgo antico"
                  nota="Variante su fondo scuro"
                />
              </div>
            </div>

            <div>
              <p className="eyebrow">Elenco di dati</p>
              <dl className="mt-4 max-w-2xl">
                <DatoRiga label="Ordine di appartenenza">ODCEC di Larino</DatoRiga>
                <DatoRiga label="Numero di iscrizione">81/A</DatoRiga>
                <DatoRiga label="Partita IVA">
                  <Tbd>«TBD:PIVA»</Tbd>
                </DatoRiga>
              </dl>
              <p className="mt-4 max-w-prose text-body-sm text-ink-muted">
                I dati non ancora forniti sono evidenziati così. Prima della pubblicazione
                nel repository non deve restare alcuna occorrenza.
              </p>
            </div>

            <div>
              <p className="eyebrow">Testo lungo e avvertenza</p>
              <Prose className="mt-4">
                <p>
                  Gli adempimenti fiscali e contabili sono la parte visibile del lavoro. La
                  parte utile è l&apos;altra: arrivare alle scadenze avendo già deciso,
                  invece di decidere sotto scadenza.
                </p>
                <h3>Un sottotitolo</h3>
                <p>
                  Il filetto e lo spazio bianco separano i blocchi. Non ci sono ombre, né
                  riquadri, né gradienti.
                </p>
              </Prose>
              <div className="max-w-prose">
                <Avvertenza>
                  Il contenuto ha finalità informative generali e non costituisce consulenza
                  riferita al caso concreto. Per la propria situazione è necessario un esame
                  specifico.
                </Avvertenza>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Sezione scura ────────────────────────────────────────── */}
      <Section tone="dark">
        <Container>
          <SectionHeading
            eyebrow="04 · Fondo scuro"
            tone="dark"
            title="Usato con parsimonia"
            intro="Il fondo scuro serve a scandire il ritmo della pagina: una sezione, non tre. La texture di carta è appena percettibile e non appesantisce il caricamento."
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/showcase" tone="onDark">
              Un&apos;azione su fondo scuro
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  )
}
