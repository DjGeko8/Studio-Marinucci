'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui'

/**
 * Editor delle aree di attività.
 *
 * L'ordine dell'elenco non viene mai riordinato dal programma: è una scelta di
 * posizionamento, non estetica. Le prime sei aree compaiono in home, quindi
 * spostare una voce in cima è un atto editoriale — per questo ci sono i pulsanti
 * per muoverle e non un ordinamento automatico.
 */

type Faq = { domanda: string; risposta: string }
type Servizio = {
  slug: string
  titolo: string
  sintesi: string
  destinatari: string
  corpo: string[]
  faq: Faq[]
}

const campo =
  'w-full rounded border border-line-strong bg-paper px-3 py-2 text-body-sm text-ink ' +
  'transition-colors hover:border-ink-muted focus:border-petrolio-600 focus:outline-none ' +
  'focus:ring-2 focus:ring-petrolio-600/30'

export function ConsoleServizi() {
  const [servizi, setServizi] = useState<Servizio[]>([])
  const [aperto, setAperto] = useState<string | null>(null)
  const [versione, setVersione] = useState<string | null>(null)
  const [modalita, setModalita] = useState<'github' | 'locale' | null>(null)
  const [stato, setStato] = useState<'carico' | 'pronto' | 'salvo' | 'errore'>('carico')
  const [messaggio, setMessaggio] = useState('')
  const [modificato, setModificato] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const esito = await (await fetch('/api/admin/servizi')).json()
        if (!esito.ok) throw new Error(esito.errore)
        setServizi(esito.servizi)
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

  function aggiorna(indice: number, campi: Partial<Servizio>) {
    setServizi((v) => v.map((s, i) => (i === indice ? { ...s, ...campi } : s)))
    setModificato(true)
  }

  function sposta(indice: number, direzione: -1 | 1) {
    const destinazione = indice + direzione
    if (destinazione < 0 || destinazione >= servizi.length) return
    setServizi((v) => {
      const copia = [...v]
      const [voce] = copia.splice(indice, 1)
      if (voce) copia.splice(destinazione, 0, voce)
      return copia
    })
    setModificato(true)
  }

  async function salva() {
    setStato('salvo')
    setMessaggio('')
    try {
      const risposta = await fetch('/api/admin/servizi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servizi, versione }),
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
    return <p className="text-body-sm text-ink-muted">Caricamento delle aree…</p>
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-6">
        <p className="text-body-sm text-ink-muted">
          {servizi.length} aree — le prime sei compaiono in home
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
          Modalità locale: le modifiche vanno sul file di questo computer.
        </p>
      ) : null}

      <ol className="mt-8 space-y-4">
        {servizi.map((s, indice) => {
          const espanso = aperto === s.slug
          const inHome = indice < 6
          return (
            <li key={s.slug} className="border border-line-strong">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => sposta(indice, -1)}
                    disabled={indice === 0}
                    aria-label="Sposta più in alto"
                    className="px-2 text-ink-muted hover:text-ink disabled:opacity-25"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => sposta(indice, 1)}
                    disabled={indice === servizi.length - 1}
                    aria-label="Sposta più in basso"
                    className="px-2 text-ink-muted hover:text-ink disabled:opacity-25"
                  >
                    ▼
                  </button>
                </span>

                <button
                  type="button"
                  onClick={() => setAperto(espanso ? null : s.slug)}
                  aria-expanded={espanso}
                  className="flex flex-1 items-center justify-between gap-4 py-2 text-left"
                >
                  <span>
                    <span className="block font-serif text-title-xs text-ink">
                      {s.titolo || '(senza titolo)'}
                    </span>
                    <span className="mt-1 block text-body-sm text-ink-muted">
                      /servizi/{s.slug}
                      {inHome ? ' · in home' : ''}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-ink-muted">
                    {espanso ? '−' : '+'}
                  </span>
                </button>
              </div>

              {espanso ? (
                <div className="space-y-5 border-t border-line px-5 py-6">
                  <div>
                    <label className="block text-body-sm text-ink-soft">Titolo</label>
                    <input
                      type="text"
                      value={s.titolo}
                      maxLength={120}
                      onChange={(e) => aggiorna(indice, { titolo: e.target.value })}
                      className={cx(campo, 'mt-2')}
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm text-ink-soft">
                      Sintesi — la riga che compare nelle schede
                    </label>
                    <textarea
                      value={s.sintesi}
                      rows={2}
                      maxLength={400}
                      onChange={(e) => aggiorna(indice, { sintesi: e.target.value })}
                      className={cx(campo, 'mt-2')}
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm text-ink-soft">A chi si rivolge</label>
                    <input
                      type="text"
                      value={s.destinatari}
                      onChange={(e) => aggiorna(indice, { destinatari: e.target.value })}
                      className={cx(campo, 'mt-2')}
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm text-ink-soft">
                      Descrizione — un riquadro per paragrafo
                    </label>
                    <div className="mt-2 space-y-3">
                      {s.corpo.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <textarea
                            value={p}
                            rows={3}
                            onChange={(e) =>
                              aggiorna(indice, {
                                corpo: s.corpo.map((x, j) => (j === i ? e.target.value : x)),
                              })
                            }
                            className={campo}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              aggiorna(indice, { corpo: s.corpo.filter((_, j) => j !== i) })
                            }
                            aria-label={`Elimina paragrafo ${i + 1}`}
                            className="shrink-0 px-2 text-ink-muted hover:text-ink"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => aggiorna(indice, { corpo: [...s.corpo, ''] })}
                      className="mt-3 text-body-sm text-petrolio-700 underline underline-offset-4"
                    >
                      Aggiungi paragrafo
                    </button>
                  </div>

                  <div>
                    <label className="block text-body-sm text-ink-soft">
                      Domande frequenti — compaiono anche nei risultati di ricerca
                    </label>
                    <div className="mt-2 space-y-4">
                      {s.faq.map((f, i) => (
                        <div key={i} className="border-l-2 border-line pl-4">
                          <input
                            type="text"
                            value={f.domanda}
                            placeholder="La domanda"
                            onChange={(e) =>
                              aggiorna(indice, {
                                faq: s.faq.map((x, j) =>
                                  j === i ? { ...x, domanda: e.target.value } : x,
                                ),
                              })
                            }
                            className={campo}
                          />
                          <textarea
                            value={f.risposta}
                            rows={3}
                            placeholder="La risposta"
                            onChange={(e) =>
                              aggiorna(indice, {
                                faq: s.faq.map((x, j) =>
                                  j === i ? { ...x, risposta: e.target.value } : x,
                                ),
                              })
                            }
                            className={cx(campo, 'mt-2')}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              aggiorna(indice, { faq: s.faq.filter((_, j) => j !== i) })
                            }
                            className="mt-2 text-body-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                          >
                            Elimina questa domanda
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        aggiorna(indice, { faq: [...s.faq, { domanda: '', risposta: '' }] })
                      }
                      className="mt-3 text-body-sm text-petrolio-700 underline underline-offset-4"
                    >
                      Aggiungi domanda
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setServizi((v) => v.filter((_, i) => i !== indice))
                      setAperto(null)
                      setModificato(true)
                    }}
                    className="text-body-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                  >
                    Elimina quest&apos;area
                  </button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="mt-10 max-w-prose space-y-3 border-l-2 border-brass-soft bg-paper-warm px-5 py-4 text-body-sm text-ink-soft">
        <p>
          <strong className="text-ink">Un&apos;area elencata genera richieste.</strong>{' '}
          Vanno indicate solo le attività effettivamente prestate: un servizio
          pubblicizzato ma non prestato è una dichiarazione ingannevole. Per toglierne una
          si cancella — non si attenua la descrizione.
        </p>
        <p>
          Si descrive quello che si fa, non quello che si ottiene: niente «riduciamo il
          carico fiscale», niente «azzeriamo le cartelle».
        </p>
        <p>
          L&apos;indirizzo di un&apos;area già pubblicata non andrebbe cambiato: chi
          l&apos;aveva salvata troverebbe una pagina inesistente.
        </p>
      </div>
    </div>
  )
}
