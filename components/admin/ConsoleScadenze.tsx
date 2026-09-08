'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui'

/**
 * Editor dello scadenzario.
 *
 * Modifica in memoria, salvataggio esplicito. Non salva mentre si scrive: su un
 * archivio che crea un commit a ogni scrittura, il salvataggio automatico
 * produrrebbe decine di commit per una singola sessione di lavoro e renderebbe
 * illeggibile la cronologia.
 */

const DESTINATARI: Record<string, string> = {
  impresa: 'Imprese',
  professionista: 'Professionisti e autonomi',
  forfettario: 'Forfettari',
  societa: 'Società di capitali',
  privato: 'Privati',
  sostituto: "Sostituti d'imposta",
}

type Voce = {
  data: string
  titolo: string
  descrizione: string
  destinatari: string[]
  servizio?: string
}

const campo =
  'w-full rounded border border-line-strong bg-paper px-3 py-2 text-body-sm text-ink ' +
  'transition-colors hover:border-ink-muted focus:border-petrolio-600 focus:outline-none ' +
  'focus:ring-2 focus:ring-petrolio-600/30'

export function ConsoleScadenze() {
  const [anno, setAnno] = useState<number>(new Date().getFullYear())
  const [voci, setVoci] = useState<Voce[]>([])
  const [versione, setVersione] = useState<string | null>(null)
  const [modalita, setModalita] = useState<'github' | 'locale' | null>(null)
  const [stato, setStato] = useState<'carico' | 'pronto' | 'salvo' | 'errore'>('carico')
  const [messaggio, setMessaggio] = useState('')
  const [modificato, setModificato] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const risposta = await fetch('/api/admin/scadenze')
        const esito = await risposta.json()
        if (!esito.ok) throw new Error(esito.errore)
        setAnno(esito.dati.anno)
        setVoci(esito.dati.voci)
        setVersione(esito.versione)
        setModalita(esito.modalita)
        setStato('pronto')
      } catch (e) {
        setMessaggio(e instanceof Error ? e.message : 'Caricamento non riuscito.')
        setStato('errore')
      }
    })()
  }, [])

  // Avvisa prima di chiudere con modifiche non salvate: qui il lavoro perso non si
  // recupera, perché finché non si salva non esiste da nessuna parte.
  useEffect(() => {
    if (!modificato) return
    const avvisa = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avvisa)
    return () => window.removeEventListener('beforeunload', avvisa)
  }, [modificato])

  function aggiorna(indice: number, campi: Partial<Voce>) {
    setVoci((v) => v.map((voce, i) => (i === indice ? { ...voce, ...campi } : voce)))
    setModificato(true)
  }

  function commutaDestinatario(indice: number, chiave: string) {
    const voce = voci[indice]
    if (!voce) return
    const presente = voce.destinatari.includes(chiave)
    aggiorna(indice, {
      destinatari: presente
        ? voce.destinatari.filter((d) => d !== chiave)
        : [...voce.destinatari, chiave],
    })
  }

  async function salva() {
    setStato('salvo')
    setMessaggio('')
    try {
      const risposta = await fetch('/api/admin/scadenze', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dati: { anno, voci }, versione }),
      })
      const esito = await risposta.json()
      if (!esito.ok) throw new Error(esito.errore)
      setVersione(esito.versione ?? null)
      setModificato(false)
      setStato('pronto')
      setMessaggio(
        esito.modalita === 'github'
          ? 'Salvato. Il sito si aggiorna fra un minuto o due, il tempo della ricompilazione.'
          : 'Salvato sul file locale.',
      )
    } catch (e) {
      setMessaggio(e instanceof Error ? e.message : 'Salvataggio non riuscito.')
      setStato('errore')
    }
  }

  if (stato === 'carico') {
    return <p className="text-body-sm text-ink-muted">Caricamento dello scadenzario…</p>
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <label htmlFor="anno" className="block text-body-sm text-ink-soft">
            Anno dello scadenzario
          </label>
          <input
            id="anno"
            type="number"
            value={anno}
            min={2000}
            max={2100}
            onChange={(e) => {
              setAnno(Number(e.target.value))
              setModificato(true)
            }}
            className={cx(campo, 'mt-2 w-32')}
          />
        </div>

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
          Modalità locale: le modifiche vanno sul file di questo computer, non sul sito
          pubblicato. In produzione servono <code>GITHUB_TOKEN</code> e{' '}
          <code>GITHUB_REPO</code>.
        </p>
      ) : null}

      <ol className="mt-8 space-y-8">
        {voci.map((voce, indice) => (
          <li key={indice} className="border-t border-line pt-6">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <div>
                <label className="block text-body-sm text-ink-soft">Data</label>
                <input
                  type="date"
                  value={voce.data}
                  onChange={(e) => aggiorna(indice, { data: e.target.value })}
                  className={cx(campo, 'mt-2')}
                />
                <button
                  type="button"
                  onClick={() => {
                    setVoci((v) => v.filter((_, i) => i !== indice))
                    setModificato(true)
                  }}
                  className="mt-3 text-body-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                >
                  Elimina
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm text-ink-soft">Titolo</label>
                  <input
                    type="text"
                    value={voce.titolo}
                    maxLength={160}
                    onChange={(e) => aggiorna(indice, { titolo: e.target.value })}
                    className={cx(campo, 'mt-2')}
                  />
                </div>

                <div>
                  <label className="block text-body-sm text-ink-soft">Descrizione</label>
                  <textarea
                    value={voce.descrizione}
                    rows={2}
                    maxLength={800}
                    onChange={(e) => aggiorna(indice, { descrizione: e.target.value })}
                    className={cx(campo, 'mt-2')}
                  />
                </div>

                <fieldset>
                  <legend className="text-body-sm text-ink-soft">
                    A chi si rivolge
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(DESTINATARI).map(([chiave, etichetta]) => {
                      const attivo = voce.destinatari.includes(chiave)
                      return (
                        <button
                          key={chiave}
                          type="button"
                          aria-pressed={attivo}
                          onClick={() => commutaDestinatario(indice, chiave)}
                          className={cx(
                            'rounded border px-3 py-1.5 text-body-sm transition-colors',
                            attivo
                              ? 'border-petrolio-700 bg-petrolio-700 text-paper'
                              : 'border-line-strong text-ink-soft hover:border-petrolio-600',
                          )}
                        >
                          {etichetta}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => {
          setVoci((v) => [
            ...v,
            { data: `${anno}-01-01`, titolo: '', descrizione: '', destinatari: ['impresa'] },
          ])
          setModificato(true)
        }}
        className="mt-10 rounded border border-line-strong px-5 py-3 text-body-sm text-ink transition-colors hover:border-petrolio-600"
      >
        Aggiungi una scadenza
      </button>

      <p className="mt-10 max-w-prose border-l-2 border-brass-soft bg-paper-warm px-5 py-4 text-body-sm text-ink-soft">
        Nel testo di una scadenza va <strong>solo l&apos;informazione</strong>: la data,
        l&apos;adempimento, chi riguarda. Una valutazione o un consiglio trasformerebbe lo
        scadenzario in consulenza, che è cosa diversa e con altre responsabilità.
      </p>
    </div>
  )
}
