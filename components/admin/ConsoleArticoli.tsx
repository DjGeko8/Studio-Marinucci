'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui'

/**
 * Editor degli approfondimenti.
 *
 * Metadati e testo di ogni articolo si salvano insieme, in un solo commit: non
 * esiste un istante in cui un articolo risulta registrato ma senza testo.
 *
 * Il testo si scrive in Markdown, che è quanto di più vicino alla scrittura
 * normale: una riga vuota separa i paragrafi, `##` fa un titolo, `**parola**` la
 * mette in grassetto. Non c'è un editor visuale di proposito — su un testo che
 * impegna la responsabilità professionale di chi lo firma, sapere esattamente cosa
 * si sta scrivendo vale più della comodità.
 */

type Articolo = {
  slug: string
  titolo: string
  data: string
  sommario: string
  servizio?: string
  lettura: number
  corpo: string
}

const campo =
  'w-full rounded border border-line-strong bg-paper px-3 py-2 text-body-sm text-ink ' +
  'transition-colors hover:border-ink-muted focus:border-petrolio-600 focus:outline-none ' +
  'focus:ring-2 focus:ring-petrolio-600/30'

function indirizzoDaTitolo(titolo: string): string {
  return titolo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export function ConsoleArticoli() {
  const [articoli, setArticoli] = useState<Articolo[]>([])
  const [aperto, setAperto] = useState<string | null>(null)
  const [modalita, setModalita] = useState<'github' | 'locale' | null>(null)
  const [stato, setStato] = useState<'carico' | 'pronto' | 'salvo' | 'errore'>('carico')
  const [messaggio, setMessaggio] = useState('')
  const [modificato, setModificato] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const esito = await (await fetch('/api/admin/articoli')).json()
        if (!esito.ok) throw new Error(esito.errore)
        setArticoli(esito.articoli)
        setModalita(esito.modalita)
        setStato('pronto')
      } catch (e) {
        setMessaggio(e instanceof Error ? e.message : 'Caricamento non riuscito.')
        setStato('errore')
      }
    })()
  }, [])

  useEffect(() => {
    if (!modificato) return
    const avvisa = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avvisa)
    return () => window.removeEventListener('beforeunload', avvisa)
  }, [modificato])

  /** Un articolo mai salvato ha ancora l'indirizzo provvisorio assegnato alla creazione. */
  function eNuovo(slug: string): boolean {
    return slug.startsWith('nuovo-articolo-')
  }

  function aggiorna(slug: string, campi: Partial<Articolo>) {
    setArticoli((a) =>
      a.map((art) => {
        if (art.slug !== slug) return art
        const aggiornato = { ...art, ...campi }
        // Finché non è stato salvato, l'indirizzo segue il titolo. Dopo resta fermo:
        // cambiarlo romperebbe i collegamenti di chi l'aveva salvato.
        if (campi.titolo !== undefined && eNuovo(art.slug)) {
          const derivato = indirizzoDaTitolo(campi.titolo)
          if (derivato.length >= 3) aggiornato.slug = derivato
        }
        return aggiornato
      }),
    )
    setModificato(true)
    if (campi.titolo !== undefined && eNuovo(slug)) {
      const derivato = indirizzoDaTitolo(campi.titolo)
      if (derivato.length >= 3) setAperto(derivato)
    }
  }

  async function salva() {
    setStato('salvo')
    setMessaggio('')
    try {
      const risposta = await fetch('/api/admin/articoli', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articoli }),
      })
      const esito = await risposta.json()
      if (!esito.ok) throw new Error(esito.errore)
      setModificato(false)
      setStato('pronto')
      setMessaggio(
        esito.modalita === 'github'
          ? 'Salvato. Il sito si aggiorna fra un minuto o due, il tempo della ricompilazione.'
          : 'Salvato sui file locali.',
      )
    } catch (e) {
      setMessaggio(e instanceof Error ? e.message : 'Salvataggio non riuscito.')
      setStato('errore')
    }
  }

  if (stato === 'carico') {
    return <p className="text-body-sm text-ink-muted">Caricamento degli approfondimenti…</p>
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-6">
        <p className="text-body-sm text-ink-muted">
          {articoli.length} articol{articoli.length === 1 ? 'o' : 'i'}
          {articoli.length > 0 && articoli.length < 3
            ? ' — sotto i tre la sezione resta nascosta sul sito'
            : ''}
        </p>
        <div className="flex items-center gap-4">
          {modificato ? (
            <span className="text-body-sm text-brass">Modifiche non salvate</span>
          ) : null}
          <button
            type="button"
            onClick={salva}
            disabled={stato === 'salvo' || !modificato}
            className="rounded bg-petrolio-700 px-6 py-3 text-body-sm text-paper transition-colors hover:bg-petrolio-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stato === 'salvo' ? 'Salvataggio…' : 'Salva e pubblica'}
          </button>
        </div>
      </div>

      {messaggio ? (
        <p
          role="status"
          className={cx(
            'mt-6 border-l-2 px-4 py-3 text-body-sm',
            stato === 'errore'
              ? 'border-brass bg-paper-warm text-ink'
              : 'border-petrolio-600 bg-petrolio-50 text-petrolio-900',
          )}
        >
          {messaggio}
        </p>
      ) : null}

      {modalita === 'locale' ? (
        <p className="mt-6 border-l-2 border-line-strong bg-stone px-4 py-3 text-body-sm text-ink-soft">
          <strong>GitHub non è collegato.</strong> In sviluppo si scrive sui file di questo
          computer; sul sito pubblicato il salvataggio fallisce, perché un Worker non ha un
          disco. Servono <code>GITHUB_TOKEN</code> e <code>GITHUB_REPO</code>.
        </p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {articoli.map((a) => {
          const espanso = aperto === a.slug
          return (
            <li key={a.slug} className="border border-line-strong">
              <button
                type="button"
                onClick={() => setAperto(espanso ? null : a.slug)}
                aria-expanded={espanso}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-paper-warm"
              >
                <span>
                  <span className="block font-serif text-title-xs text-ink">
                    {a.titolo || '(senza titolo)'}
                  </span>
                  <span className="mt-1 block text-body-sm text-ink-muted">
                    {a.data} · /news/{a.slug}
                  </span>
                </span>
                <span aria-hidden="true" className="text-ink-muted">
                  {espanso ? '−' : '+'}
                </span>
              </button>

              {espanso ? (
                <div className="space-y-5 border-t border-line px-5 py-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-body-sm text-ink-soft">Titolo</label>
                      <input
                        type="text"
                        value={a.titolo}
                        maxLength={200}
                        onChange={(e) => aggiorna(a.slug, { titolo: e.target.value })}
                        className={cx(campo, 'mt-2')}
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm text-ink-soft">Data</label>
                      <input
                        type="date"
                        value={a.data}
                        onChange={(e) => aggiorna(a.slug, { data: e.target.value })}
                        className={cx(campo, 'mt-2')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm text-ink-soft">
                      Indirizzo della pagina
                    </label>
                    {eNuovo(a.slug) ? (
                      <>
                        <input
                          type="text"
                          value={a.slug}
                          onChange={(e) =>
                            aggiorna(a.slug, {
                              slug: indirizzoDaTitolo(e.target.value),
                            })
                          }
                          className={cx(campo, 'mt-2')}
                        />
                        <p className="mt-2 text-body-sm text-ink-muted">
                          Si compila da solo dal titolo. Dopo il primo salvataggio non sarà
                          più modificabile.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 font-mono text-body-sm text-ink-muted">
                        /news/{a.slug}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-body-sm text-ink-soft">
                      Sommario — compare nell&apos;elenco e nei risultati di ricerca
                    </label>
                    <textarea
                      value={a.sommario}
                      rows={2}
                      maxLength={500}
                      onChange={(e) => aggiorna(a.slug, { sommario: e.target.value })}
                      className={cx(campo, 'mt-2')}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-body-sm text-ink-soft">
                        Area di attività collegata
                      </label>
                      <input
                        type="text"
                        value={a.servizio ?? ''}
                        placeholder="persone-fisiche"
                        onChange={(e) => aggiorna(a.slug, { servizio: e.target.value })}
                        className={cx(campo, 'mt-2')}
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm text-ink-soft">
                        Minuti di lettura
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={a.lettura}
                        onChange={(e) => aggiorna(a.slug, { lettura: Number(e.target.value) })}
                        className={cx(campo, 'mt-2 w-24')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm text-ink-soft">Testo</label>
                    <textarea
                      value={a.corpo}
                      rows={22}
                      onChange={(e) => aggiorna(a.slug, { corpo: e.target.value })}
                      className={cx(campo, 'mt-2 font-mono text-[0.9rem] leading-relaxed')}
                    />
                    <p className="mt-2 text-body-sm text-ink-muted">
                      Una riga vuota separa i paragrafi. <code>## Titolo</code> fa un titolo
                      di sezione, <code>**parola**</code> mette in grassetto,{' '}
                      <code>- voce</code> fa un elenco. La nota informativa in fondo viene
                      aggiunta da sola: non va scritta qui.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setArticoli((v) => v.filter((x) => x.slug !== a.slug))
                      setAperto(null)
                      setModificato(true)
                    }}
                    className="text-body-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                  >
                    Elimina questo articolo
                  </button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => {
          const oggi = new Date().toISOString().slice(0, 10)
          const slug = `nuovo-articolo-${Date.now().toString(36)}`
          setArticoli((v) => [
            {
              slug,
              titolo: '',
              data: oggi,
              sommario: '',
              lettura: 5,
              corpo: '',
            },
            ...v,
          ])
          setAperto(slug)
          setModificato(true)
        }}
        className="mt-8 rounded border border-line-strong px-5 py-3 text-body-sm text-ink transition-colors hover:border-petrolio-600"
      >
        Scrivi un nuovo articolo
      </button>

      <div className="mt-10 max-w-prose space-y-3 border-l-2 border-brass-soft bg-paper-warm px-5 py-4 text-body-sm text-ink-soft">
        <p>
          <strong className="text-ink">L&apos;indirizzo di un articolo pubblicato non
          andrebbe cambiato.</strong>{' '}
          Chi lo aveva salvato o collegato troverebbe una pagina inesistente, e il
          posizionamento acquisito si perde.
        </p>
        <p>
          Ogni articolo firmato dallo studio impegna la responsabilità professionale di
          chi lo firma. Niente promesse di risultato, niente confronti con altri
          professionisti, nessun caso di cliente riconoscibile.
        </p>
      </div>
    </div>
  )
}
