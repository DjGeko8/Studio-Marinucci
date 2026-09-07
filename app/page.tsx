import Link from 'next/link'

import { ContactForm } from '@/components/ContactForm'
import { Foto } from '@/components/Foto'
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
  Tbd,
} from '@/components/ui'
import { articoliOrdinati, newsAttiva } from '@/content/news'
import { formattaData, prossimeScadenze } from '@/content/scadenze'
import { serviziInHome } from '@/content/servizi'
import { contatti, orari, professionista, sede, site } from '@/lib/site'

export default function HomePage() {
  // Data fissata al momento della build: il sito è statico e non legge l'orologio
  // del browser di chi visita. Ricostruire il sito aggiorna anche questa sezione.
  const oggi = new Date().toISOString().slice(0, 10)
  const scadenze = prossimeScadenze(oggi, 3)
  const ultimiArticoli = articoliOrdinati().slice(0, 3)

  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────────────────
          Fermato al 68% dell'altezza: il blocco successivo deve essere già
          intuibile senza scorrere. Vedi docs/FASE-2-ARCHITETTURA.md §4. */}
      <section className="relative flex min-h-[68vh] items-end bg-petrolio-950">
        <div className="absolute inset-0" aria-hidden="true">
          <Foto
            slot="hero-termoli"
            riempi
            priorita
            tone="dark"
            ratio="none"
            className="rounded-none"
            etichetta="Termoli — borgo antico, Castello Svevo o trabucchi"
            nota="Fotografia orizzontale ad ampio respiro, luce di prima mattina o tardo pomeriggio"
          />
          {/* La sfumatura serve alla leggibilità del testo, non all'estetica:
              senza, il titolo su fondo chiaro non raggiunge il contrasto minimo. */}
          <div className="absolute inset-0 bg-gradient-to-t from-petrolio-950 via-petrolio-950/85 to-petrolio-950/45" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <Eyebrow tone="dark">
            {professionista.titoli.join(' · ')} · {sede.citta}
          </Eyebrow>
          <h1 className="mt-6 max-w-4xl font-serif text-title-xl text-paper sm:text-display">
            {site.name}
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-petrolio-100">
            Consulenza fiscale, contabile e societaria per imprese, professionisti e
            famiglie del basso Molise. Chi si rivolge allo studio parla direttamente con il
            professionista.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href={contatti.telefonoHref}>
              Chiama lo studio · {contatti.telefono}
            </ButtonLink>
            <ButtonLink href="/appuntamento" tone="onDark">
              Prenota un appuntamento
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── 2. Chi è ─────────────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading eyebrow="Il professionista" title="Massimo Marinucci" />
              <div className="mt-8 max-w-prose space-y-5 text-body text-ink-soft">
                <p>
                  Dottore commercialista e revisore legale. Nato a {sede.citta}, si è
                  laureato in {professionista.laurea} ed è iscritto all&apos;
                  {professionista.ordine}, al n. {professionista.numeroIscrizione}, dal{' '}
                  {professionista.annoIscrizione}.
                </p>
                <p>
                  Lo studio assiste imprese, lavoratori autonomi e privati del basso Molise
                  negli adempimenti fiscali e contabili, nelle scelte societarie e nei
                  rapporti con l&apos;amministrazione finanziaria. Il rapporto è diretto:
                  chi si rivolge allo studio trova sempre lo stesso interlocutore, dal primo
                  incontro alla gestione ordinaria.
                </p>
              </div>
              <div className="mt-8">
                <ButtonLink href="/studio" tone="ghost">
                  Il percorso professionale →
                </ButtonLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Foto
                slot="ritratto-verticale"
                ratio="portrait"
                etichetta={`Ritratto del ${professionista.nomeCompleto}`}
                nota="Luce naturale, sguardo in camera, sfondo pulito o lo studio stesso. Fotografia reale, mai generata."
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 3. Aree di attività ──────────────────────────────────── */}
      <Section tone="warm">
        <Container>
          <SectionHeading
            eyebrow="Aree di attività"
            title="Di cosa si occupa lo studio"
            intro="Dalla gestione ordinaria degli adempimenti alle scelte che li precedono: contabilità, fisco, società, revisione legale e assistenza alle persone fisiche."
          />

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {serviziInHome.map((servizio) => (
              <Card
                key={servizio.slug}
                href={`/servizi/${servizio.slug}`}
                title={servizio.titolo}
              >
                {servizio.sintesi}
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <ButtonLink href="/servizi" tone="secondary">
              Tutte le aree di attività
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── 4. Perché questo studio ──────────────────────────────── */}
      <Section tone="dark">
        <Container>
          <SectionHeading
            tone="dark"
            eyebrow="Perché questo studio"
            title="Un interlocutore unico, sul territorio"
            intro="Non la dimensione di una struttura, ma il rapporto diretto con chi segue la pratica. Sono quattro fatti, tutti verificabili."
          />

          <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                titolo: 'Un interlocutore unico',
                testo:
                  'Non ci sono passaggi di consegne: il professionista che risponde al telefono è lo stesso che segue la pratica.',
              },
              {
                titolo: `Iscritto all'albo dal ${professionista.annoIscrizione}`,
                testo: `${professionista.ordineBreve}, n. ${professionista.numeroIscrizione}. Oltre due decenni di attività continuativa sul territorio.`,
              },
              {
                titolo: 'Revisore legale',
                testo: 'Per incarichi di controllo contabile e collegi sindacali.',
                nota: professionista.numeroRevisori,
              },
              {
                titolo: `Radicato a ${sede.citta}`,
                testo:
                  'Studio in città, non un recapito. Chi ha bisogno di parlare di persona può farlo.',
              },
            ].map((punto) => (
              <li key={punto.titolo}>
                <div className="h-px w-full bg-petrolio-600" />
                <h3 className="mt-5 font-serif text-title-xs text-paper">{punto.titolo}</h3>
                <p className="mt-3 text-body-sm text-petrolio-100">{punto.testo}</p>
                {punto.nota ? (
                  <p className="mt-3 text-body-sm text-petrolio-200">
                    Registro dei Revisori Legali n. <Tbd>{punto.nota}</Tbd>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── 5. Prossime scadenze ─────────────────────────────────── */}
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Scadenzario"
              title="Le prossime scadenze fiscali"
              intro="Le date da tenere presenti nelle prossime settimane, per tipo di contribuente."
            />
            <ButtonLink href="/scadenze" tone="secondary">
              Scadenzario completo
            </ButtonLink>
          </div>

          <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {scadenze.map((scadenza) => (
              <li key={`${scadenza.data}-${scadenza.titolo}`}>
                <Card
                  eyebrow={formattaData(scadenza.data)}
                  title={scadenza.titolo}
                  meta={scadenza.descrizione}
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── 6. Approfondimenti ───────────────────────────────────── */}
      {newsAttiva ? (
        <Section tone="warm">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Approfondimenti"
                title="Note su adempimenti e novità"
                intro="Scritte per chi non è del mestiere, su questioni che ricorrono davvero."
              />
              <ButtonLink href="/news" tone="secondary">
                Tutti gli approfondimenti
              </ButtonLink>
            </div>

            <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {ultimiArticoli.map((articolo) => (
                <Card
                  key={articolo.slug}
                  href={`/news/${articolo.slug}`}
                  eyebrow={formattaData(articolo.data)}
                  title={articolo.titolo}
                >
                  {articolo.sommario}
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ── 7. Contatto ──────────────────────────────────────────── */}
      <Section id="contatto">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Contatti"
                title="Parliamone"
                intro="Per una prima valutazione della sua situazione può chiamare lo studio o scrivere."
              />

              <dl className="mt-10 space-y-6">
                <div>
                  <dt className="text-body-sm text-ink-muted">Telefono</dt>
                  <dd className="mt-1">
                    <a href={contatti.telefonoHref} className="link text-body-lg">
                      {contatti.telefono}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-body-sm text-ink-muted">Email</dt>
                  <dd className="mt-1 text-body">
                    <Tbd>{contatti.email}</Tbd>
                  </dd>
                </div>
                <div>
                  <dt className="text-body-sm text-ink-muted">Studio</dt>
                  <dd className="mt-1 text-body">
                    {sede.via}
                    <br />
                    {sede.cap} {sede.citta} ({sede.provincia})
                    <br />
                    <Link href="/dove-siamo" className="link mt-2 inline-block text-body-sm">
                      Come arrivare
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-body-sm text-ink-muted">Orari</dt>
                  <dd className="mt-1 space-y-1 text-body">
                    {orari.righe.map((riga) => (
                      <p key={riga.giorni}>
                        {riga.giorni}: <Tbd>{riga.orario}</Tbd>
                      </p>
                    ))}
                    <p className="text-body-sm text-ink-muted">{orari.nota}</p>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-7">
              <ContactForm variante="compatto" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
