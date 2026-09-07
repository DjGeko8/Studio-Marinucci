'use client'

import { useEffect, useState } from 'react'

import { EVENTO_CONSENSO, leggiConsenso, revocaConsenso, salvaConsenso } from '@/lib/consent'

/**
 * Pannello di gestione del consenso nella cookie policy.
 * Mostra la scelta corrente e permette di cambiarla o revocarla: senza questo, il
 * consenso non sarebbe revocabile «con la stessa facilità» con cui è stato prestato.
 */
export function RevocaConsenso() {
  const [contenutiEsterni, setContenutiEsterni] = useState<boolean | null>(null)
  const [dataScelta, setDataScelta] = useState<string>('')

  useEffect(() => {
    const aggiorna = () => {
      const consenso = leggiConsenso()
      setContenutiEsterni(consenso ? consenso.contenutiEsterni : null)
      setDataScelta(consenso?.dataScelta ?? '')
    }
    aggiorna()
    window.addEventListener(EVENTO_CONSENSO, aggiorna)
    return () => window.removeEventListener(EVENTO_CONSENSO, aggiorna)
  }, [])

  const statoLeggibile =
    contenutiEsterni === null
      ? 'Nessuna scelta registrata: i contenuti esterni non vengono caricati.'
      : contenutiEsterni
        ? 'Contenuti esterni: consentiti.'
        : 'Contenuti esterni: rifiutati.'

  return (
    <div className="mt-10 rounded border border-line-strong bg-paper-warm p-6">
      <p className="eyebrow">La sua scelta</p>
      <p className="mt-3 text-body-sm text-ink">{statoLeggibile}</p>
      {dataScelta ? (
        <p className="mt-1 text-body-sm text-ink-muted">
          Espressa il {new Date(dataScelta).toLocaleDateString('it-IT')}.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => salvaConsenso(true)}
          className="rounded border border-line-strong px-5 py-2.5 text-body-sm text-ink transition-colors hover:border-petrolio-600"
        >
          Consenti i contenuti esterni
        </button>
        <button
          type="button"
          onClick={() => salvaConsenso(false)}
          className="rounded border border-line-strong px-5 py-2.5 text-body-sm text-ink transition-colors hover:border-petrolio-600"
        >
          Rifiuta i contenuti esterni
        </button>
        <button
          type="button"
          onClick={() => revocaConsenso()}
          className="rounded px-5 py-2.5 text-body-sm text-petrolio-700 underline underline-offset-4 transition-colors hover:text-petrolio-900"
        >
          Revoca e ricomincia
        </button>
      </div>
    </div>
  )
}
