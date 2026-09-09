'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui'

/**
 * Editor dei testi delle pagine.
 *
 * Qui si riscrive la prosa; i dati obbligatori no. Ogni sezione a cui la pagina
 * affianca un blocco di dati — i recapiti del titolare, gli estremi della polizza —
 * lo dichiara nella propria nota, così chi scrive sa che sotto al suo paragrafo
 * comparirà qualcosa che non vede nel modulo, e non lo riscrive a mano.
 *
 * Le sezioni previste dall'impaginazione non si possono eliminare: sono quelle che
 * portano con sé quei blocchi. Se sparissero, sparirebbe con loro un'informazione che
 * la legge impone di dare, e nessuno se ne accorgerebbe finché non lo fa notare
 * qualcuno che ha motivo di controllare.
 */

type Blocco = { tipo: 'paragrafo'; testo: string } | { tipo: 'elenco'; voci: string[] }

type Sezione = {
  id: string
  occhiello?: string
  titolo?: string
  visibile?: boolean
  blocchi: Blocco[]
}

type Pagina = {
  occhiello: string
  titolo: string
  sommario: string
  metaDescrizione: string
  sezioni: Sezione[]
}

type SezionePrevista = { id: string; nome: string; nota?: string; opzionale?: boolean }

type Struttura = {
  nome: string
  percorso: string
  avvertenza?: string
  usaOcchielli: boolean
  sezioniLibere: boolean
  sezioni: SezionePrevista[]
}

type Campo = { etichetta: string; valore: string }

const campo =
  'w-full rounded border border-line-strong bg-paper px-3 py-2 text-body-sm text-ink ' +
  'transition-colors hover:border-ink-muted focus:border-petrolio-600 focus:outline-none ' +
  'focus:ring-2 focus:ring-petrolio-600/30'

const minuscolo = 'block text-body-sm text-ink-soft'

export function ConsolePagine() {
  const [pagine, setPagine] = useState<Record<string, Pagina>>({})
  const [struttura, setStruttura] = useState<Record<string, Struttura>>({})
  const [campi, setCampi] = useState<Record<string, Campo>>({})
  const [chiaveAttiva, setChiaveAttiva] = useState<string>('')
  const [aperta, setAperta] = useState<string | null>(null)
  const [versione, setVersione] = useState<string | null>(null)
  const [modalita, setModalita] = useState<'github' | 'locale' | null>(null)
  const [stato, setStato] = useState<'carico' | 'pronto' | 'salvo' | 'errore'>('carico')
  const [messaggio, setMessaggio] = useState('')
  const [modificato, setModificato] = useState(false)
  const [copiato, setCopiato] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const esito = await (await fetch('/api/admin/pagine')).json()
        if (!esito.ok) throw new Error(esito.errore)
        setPagine(esito.pagine)
        setStruttura(esito.struttura)
        setCampi(esito.campi)
        setChiaveAttiva(Object.keys(esito.struttura)[0] ?? '')
        setVersione(esito.versione)
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

  const pagina = pagine[chiaveAttiva]
  const forma = struttura[chiaveAttiva]

  function aggiornaPagina(campi: Partial<Pagina>) {
    setPagine((p) => {
      const attuale = p[chiaveAttiva]
      if (!attuale) return p
      return { ...p, [chiaveAttiva]: { ...attuale, ...campi } }
    })
    setModificato(true)
  }

  function aggiornaSezioni(trasforma: (sezioni: Sezione[]) => Sezione[]) {
    setPagine((p) => {
      const attuale = p[chiaveAttiva]
      if (!attuale) return p
      return { ...p, [chiaveAttiva]: { ...attuale, sezioni: trasforma(attuale.sezioni) } }
    })
    setModificato(true)
  }

  const aggiornaSezione = (indice: number, campi: Partial<Sezione>) =>
    aggiornaSezioni((s) => s.map((v, i) => (i === indice ? { ...v, ...campi } : v)))

  const aggiornaBlocchi = (indice: number, blocchi: Blocco[]) =>
    aggiornaSezione(indice, { blocchi })

  function spostaSezione(indice: number, direzione: -1 | 1) {
    aggiornaSezioni((s) => {
      const destinazione = indice + direzione
      if (destinazione < 0 || destinazione >= s.length) return s
      const copia = [...s]
      const [voce] = copia.splice(indice, 1)
      if (voce) copia.splice(destinazione, 0, voce)
      return copia
    })
  }

  function aggiungiSezione() {
    const nome = window.prompt('Titolo della nuova sezione')
    if (!nome?.trim()) return
    const id =
      nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || `sezione-${Date.now()}`
    aggiornaSezioni((s) =>
      s.some((v) => v.id === id)
        ? s
        : [...s, { id, titolo: nome.trim(), blocchi: [{ tipo: 'paragrafo', testo: '' }] }],
    )
  }

  async function copia(nome: string) {
    try {
      await navigator.clipboard.writeText(`{{${nome}}}`)
      setCopiato(nome)
      window.setTimeout(() => setCopiato(null), 2000)
    } catch {
      setCopiato(null)
    }
  }

  async function salva() {
    setStato('salvo')
    setMessaggio('')
    try {
      const risposta = await fetch('/api/admin/pagine', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagine, versione }),
      })
      const esito = await risposta.json()
      if (!esito.ok) throw new Error(esito.errore)
      setVersione(esito.versione ?? null)
      setModificato(false)
      setStato('pronto')
      setMessaggio(
        esito.modalita === 'github'
          ? 'Salvato. Il sito si aggiorna fra un minuto o due.'
          : 'Salvato sul file locale.',
      )
    } catch (e) {
      setMessaggio(e instanceof Error ? e.message : 'Salvataggio non riuscito.')
      setStato('errore')
    }
  }

  if (stato === 'carico') {
    return <p className="text-body-sm text-ink-muted">Caricamento dei testi…</p>
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-6">
        <p className="text-body-sm text-ink-muted">
          I dati obbligatori non si modificano da qui: stanno in <code>lib/site.ts</code>
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
          computer; sul sito pubblicato il salvataggio fallisce. Servono{' '}
          <code>GITHUB_TOKEN</code> e <code>GITHUB_REPO</code>.
        </p>
      ) : null}

      {/* Scelta della pagina */}
      <div className="mt-8 flex flex-wrap gap-2">
        {Object.entries(struttura).map(([chiave, s]) => (
          <button
            key={chiave}
            type="button"
            onClick={() => {
              setChiaveAttiva(chiave)
              setAperta(null)
            }}
            className={cx(
              'rounded border px-4 py-2 text-body-sm transition-colors',
              chiave === chiaveAttiva
                ? 'border-petrolio-700 bg-petrolio-700 text-paper'
                : 'border-line-strong text-ink-soft hover:border-petrolio-600 hover:text-ink',
            )}
          >
            {s.nome}
          </button>
        ))}
      </div>

      {pagina && forma ? (
        <>
          {forma.avvertenza ? (
            <p className="mt-6 max-w-prose border-l-2 border-brass-soft bg-paper-warm px-5 py-4 text-body-sm text-ink-soft">
              {forma.avvertenza}
            </p>
          ) : null}

          {/* Come si scrive */}
          <details className="mt-6 border border-line-strong">
            <summary className="cursor-pointer px-5 py-3 text-body-sm text-ink">
              Come si scrive un testo: grassetto, collegamenti, dati automatici
            </summary>
            <div className="space-y-4 border-t border-line px-5 py-5 text-body-sm text-ink-soft">
              <p>
                Per il <strong>grassetto</strong> si scrive <code>**parola**</code>. Per un
                collegamento a una pagina del sito, <code>[testo](/privacy)</code>; a un sito
                esterno, <code>[testo](https://esempio.it)</code>.
              </p>
              <p>
                I <strong>dati automatici</strong> qui sotto si scrivono fra doppie parentesi
                graffe e vengono sostituiti con il valore aggiornato al momento in cui la
                pagina viene generata. Conviene usarli invece di scrivere il dato a mano: il
                giorno in cui cambia, il testo lo segue da solo. Un clic lo copia.
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(campi).map(([nome, c]) => (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => void copia(nome)}
                    title={`${c.etichetta} — oggi vale: ${c.valore}`}
                    className="rounded border border-line-strong px-2.5 py-1.5 text-left font-mono text-[0.75rem] text-ink-soft transition-colors hover:border-petrolio-600 hover:text-ink"
                  >
                    {copiato === nome ? '✓ copiato' : `{{${nome}}}`}
                    <span className="ml-2 font-sans text-ink-muted">{c.valore}</span>
                  </button>
                ))}
              </div>
            </div>
          </details>

          {/* Apertura della pagina */}
          <div className="mt-8 space-y-5 border border-line-strong px-5 py-6">
            <p className="font-serif text-title-xs text-ink">Apertura della pagina</p>
            {forma.usaOcchielli ? (
              <div>
                <label className={minuscolo}>Soprariga</label>
                <input
                  type="text"
                  value={pagina.occhiello}
                  maxLength={80}
                  onChange={(e) => aggiornaPagina({ occhiello: e.target.value })}
                  className={cx(campo, 'mt-2')}
                />
              </div>
            ) : null}
            <div>
              <label className={minuscolo}>Titolo</label>
              <input
                type="text"
                value={pagina.titolo}
                maxLength={160}
                onChange={(e) => aggiornaPagina({ titolo: e.target.value })}
                className={cx(campo, 'mt-2')}
              />
            </div>
            <div>
              <label className={minuscolo}>Sommario — le righe sotto al titolo</label>
              <textarea
                value={pagina.sommario}
                rows={2}
                maxLength={400}
                onChange={(e) => aggiornaPagina({ sommario: e.target.value })}
                className={cx(campo, 'mt-2')}
              />
            </div>
            <div>
              <label className={minuscolo}>
                Descrizione per i motori di ricerca — non compare nella pagina
              </label>
              <textarea
                value={pagina.metaDescrizione}
                rows={2}
                maxLength={320}
                onChange={(e) => aggiornaPagina({ metaDescrizione: e.target.value })}
                className={cx(campo, 'mt-2')}
              />
              <p className="mt-1 text-body-sm text-ink-muted">
                {pagina.metaDescrizione.length} caratteri — sopra i 160 Google la taglia.
              </p>
            </div>
          </div>

          {/* Sezioni */}
          <ol className="mt-6 space-y-4">
            {pagina.sezioni.map((sezione, indice) => {
              const prevista = forma.sezioni.find((v) => v.id === sezione.id)
              const espansa = aperta === sezione.id
              const nascosta = sezione.visibile === false
              return (
                <li key={sezione.id} className="border border-line-strong">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => spostaSezione(indice, -1)}
                        disabled={indice === 0}
                        aria-label="Sposta più in alto"
                        className="px-2 text-ink-muted hover:text-ink disabled:opacity-25"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => spostaSezione(indice, 1)}
                        disabled={indice === pagina.sezioni.length - 1}
                        aria-label="Sposta più in basso"
                        className="px-2 text-ink-muted hover:text-ink disabled:opacity-25"
                      >
                        ▼
                      </button>
                    </span>

                    <button
                      type="button"
                      onClick={() => setAperta(espansa ? null : sezione.id)}
                      aria-expanded={espansa}
                      className="flex flex-1 items-center justify-between gap-4 py-2 text-left"
                    >
                      <span>
                        <span
                          className={cx(
                            'block font-serif text-title-xs',
                            nascosta ? 'text-ink-muted line-through' : 'text-ink',
                          )}
                        >
                          {sezione.titolo || prevista?.nome || sezione.id}
                        </span>
                        <span className="mt-1 block text-body-sm text-ink-muted">
                          {prevista ? 'sezione prevista' : 'sezione aggiunta'}
                          {nascosta ? ' · nascosta' : ''}
                          {sezione.blocchi.length > 0
                            ? ` · ${sezione.blocchi.length} blocc${sezione.blocchi.length === 1 ? 'o' : 'hi'}`
                            : ' · nessun testo'}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-ink-muted">
                        {espansa ? '−' : '+'}
                      </span>
                    </button>
                  </div>

                  {espansa ? (
                    <div className="space-y-5 border-t border-line px-5 py-6">
                      {prevista?.nota ? (
                        <p className="border-l-2 border-petrolio-600 bg-petrolio-50 px-4 py-3 text-body-sm text-petrolio-900">
                          {prevista.nota}
                        </p>
                      ) : null}

                      {prevista?.opzionale ? (
                        <label className="flex items-start gap-3 text-body-sm text-ink-soft">
                          <input
                            type="checkbox"
                            checked={!nascosta}
                            onChange={(e) =>
                              aggiornaSezione(indice, {
                                visibile: e.target.checked ? undefined : false,
                              })
                            }
                            className="mt-1"
                          />
                          <span>Mostra questa sezione nel sito</span>
                        </label>
                      ) : null}

                      {forma.usaOcchielli ? (
                        <div>
                          <label className={minuscolo}>Soprariga</label>
                          <input
                            type="text"
                            value={sezione.occhiello ?? ''}
                            maxLength={80}
                            onChange={(e) =>
                              aggiornaSezione(indice, { occhiello: e.target.value })
                            }
                            className={cx(campo, 'mt-2')}
                          />
                        </div>
                      ) : null}

                      <div>
                        <label className={minuscolo}>Titolo della sezione</label>
                        <input
                          type="text"
                          value={sezione.titolo ?? ''}
                          maxLength={160}
                          onChange={(e) => aggiornaSezione(indice, { titolo: e.target.value })}
                          className={cx(campo, 'mt-2')}
                        />
                      </div>

                      <div>
                        <label className={minuscolo}>Testo — un riquadro per paragrafo</label>
                        <div className="mt-2 space-y-3">
                          {sezione.blocchi.map((blocco, i) => (
                            <div key={i} className="flex gap-2">
                              {blocco.tipo === 'elenco' ? (
                                <div className="flex-1 border border-line px-3 py-3">
                                  <p className="text-body-sm text-ink-muted">Elenco puntato</p>
                                  <div className="mt-2 space-y-2">
                                    {blocco.voci.map((voce, j) => (
                                      <div key={j} className="flex gap-2">
                                        <input
                                          type="text"
                                          value={voce}
                                          onChange={(e) =>
                                            aggiornaBlocchi(
                                              indice,
                                              sezione.blocchi.map((b, k) =>
                                                k === i && b.tipo === 'elenco'
                                                  ? {
                                                      tipo: 'elenco',
                                                      voci: b.voci.map((v, l) =>
                                                        l === j ? e.target.value : v,
                                                      ),
                                                    }
                                                  : b,
                                              ),
                                            )
                                          }
                                          className={campo}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            aggiornaBlocchi(
                                              indice,
                                              sezione.blocchi.map((b, k) =>
                                                k === i && b.tipo === 'elenco'
                                                  ? {
                                                      tipo: 'elenco',
                                                      voci: b.voci.filter((_, l) => l !== j),
                                                    }
                                                  : b,
                                              ),
                                            )
                                          }
                                          aria-label={`Elimina voce ${j + 1}`}
                                          className="shrink-0 px-2 text-ink-muted hover:text-ink"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      aggiornaBlocchi(
                                        indice,
                                        sezione.blocchi.map((b, k) =>
                                          k === i && b.tipo === 'elenco'
                                            ? { tipo: 'elenco', voci: [...b.voci, ''] }
                                            : b,
                                        ),
                                      )
                                    }
                                    className="mt-3 text-body-sm text-petrolio-700 underline underline-offset-4"
                                  >
                                    Aggiungi una voce
                                  </button>
                                </div>
                              ) : (
                                <textarea
                                  value={blocco.testo}
                                  rows={4}
                                  onChange={(e) =>
                                    aggiornaBlocchi(
                                      indice,
                                      sezione.blocchi.map((b, k) =>
                                        k === i ? { tipo: 'paragrafo', testo: e.target.value } : b,
                                      ),
                                    )
                                  }
                                  className={campo}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  aggiornaBlocchi(
                                    indice,
                                    sezione.blocchi.filter((_, k) => k !== i),
                                  )
                                }
                                aria-label={`Elimina blocco ${i + 1}`}
                                className="shrink-0 self-start px-2 py-2 text-ink-muted hover:text-ink"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-5">
                          <button
                            type="button"
                            onClick={() =>
                              aggiornaBlocchi(indice, [
                                ...sezione.blocchi,
                                { tipo: 'paragrafo', testo: '' },
                              ])
                            }
                            className="text-body-sm text-petrolio-700 underline underline-offset-4"
                          >
                            Aggiungi un paragrafo
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              aggiornaBlocchi(indice, [
                                ...sezione.blocchi,
                                { tipo: 'elenco', voci: [''] },
                              ])
                            }
                            className="text-body-sm text-petrolio-700 underline underline-offset-4"
                          >
                            Aggiungi un elenco puntato
                          </button>
                        </div>
                      </div>

                      {prevista ? (
                        <p className="text-body-sm text-ink-muted">
                          Questa sezione è prevista dall&apos;impaginazione della pagina e non
                          si può eliminare
                          {prevista.opzionale ? ', ma si può nascondere con la spunta qui sopra' : ''}
                          .
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!window.confirm('Eliminare questa sezione e il suo testo?')) return
                            aggiornaSezioni((s) => s.filter((_, i) => i !== indice))
                            setAperta(null)
                          }}
                          className="text-body-sm text-brass underline underline-offset-4"
                        >
                          Elimina questa sezione
                        </button>
                      )}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ol>

          {forma.sezioniLibere ? (
            <button
              type="button"
              onClick={aggiungiSezione}
              className="mt-6 rounded border border-line-strong px-5 py-3 text-body-sm text-ink-soft transition-colors hover:border-petrolio-600 hover:text-ink"
            >
              Aggiungi una sezione
            </button>
          ) : null}

          <p className="mt-10 max-w-prose text-body-sm text-ink-muted">
            Per rivedere la pagina com&apos;è oggi:{' '}
            <a href={forma.percorso} target="_blank" rel="noopener" className="text-petrolio-700">
              {forma.percorso}
            </a>
            . Le modifiche salvate compaiono dopo la ricompilazione, non subito.
          </p>
        </>
      ) : null}
    </div>
  )
}
