'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { cx } from '@/components/ui'
import {
  DESTINATARI,
  formattaData,
  type Destinatario,
  type Scadenza,
} from '@/content/scadenze'

/**
 * Scadenzario filtrabile.
 *
 * Il filtro è per TIPO DI CONTRIBUENTE, non per categoria fiscale astratta: chi legge
 * sa di essere un forfettario o un privato, non sa in quale classificazione rientri.
 *
 * Le scadenze già passate non vengono nascoste — restano consultabili, perché
 * l'anno fiscale si guarda anche all'indietro — ma sono visivamente attenuate.
 */
export function ScadenzeElenco({
  scadenze,
  oggi,
}: {
  scadenze: Scadenza[]
  /** Data della build: il sito è statico e non legge l'orologio di chi visita. */
  oggi: string
}) {
  const [filtro, setFiltro] = useState<Destinatario | 'tutti'>('tutti')

  const visibili = useMemo(
    () =>
      filtro === 'tutti' ? scadenze : scadenze.filter((s) => s.destinatari.includes(filtro)),
    [scadenze, filtro],
  )

  const opzioni: Array<{ valore: Destinatario | 'tutti'; etichetta: string }> = [
    { valore: 'tutti', etichetta: 'Tutte' },
    ...(Object.entries(DESTINATARI) as [Destinatario, string][]).map(([valore, etichetta]) => ({
      valore,
      etichetta,
    })),
  ]

  return (
    <div>
      <div className="border-b border-line pb-6">
        <p className="eyebrow">Filtra per tipo di contribuente</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {opzioni.map((opzione) => {
            const attivo = filtro === opzione.valore
            return (
              <button
                key={opzione.valore}
                type="button"
                aria-pressed={attivo}
                onClick={() => setFiltro(opzione.valore)}
                className={cx(
                  'rounded border px-4 py-2 text-body-sm transition-colors duration-DEFAULT',
                  attivo
                    ? 'border-petrolio-700 bg-petrolio-700 text-paper'
                    : 'border-line-strong text-ink-soft hover:border-petrolio-600 hover:text-ink',
                )}
              >
                {opzione.etichetta}
              </button>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-body-sm text-ink-muted">
        {visibili.length === 0
          ? 'Nessuna scadenza per questa categoria.'
          : `${visibili.length} ${visibili.length === 1 ? 'scadenza' : 'scadenze'} in elenco.`}
      </p>

      <ol className="mt-8">
        {visibili.map((scadenza) => {
          const passata = scadenza.data < oggi
          return (
            <li
              key={`${scadenza.data}-${scadenza.titolo}`}
              className={cx(
                'grid gap-x-8 gap-y-3 border-t border-line py-7 sm:grid-cols-[10rem_1fr]',
                passata && 'opacity-55',
              )}
            >
              <div>
                <p className="font-serif text-title-xs text-ink">
                  {formattaData(scadenza.data, false)}
                </p>
                <p className="mt-1 text-body-sm text-ink-muted">
                  {passata ? 'Scaduta' : scadenza.data.slice(0, 4)}
                </p>
              </div>

              <div>
                <h3 className="font-serif text-title-xs text-ink">{scadenza.titolo}</h3>
                <p className="mt-2 max-w-prose text-body-sm text-ink-soft">
                  {scadenza.descrizione}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <ul className="flex flex-wrap gap-2">
                    {scadenza.destinatari.map((destinatario) => (
                      <li
                        key={destinatario}
                        className="rounded-sm bg-stone px-2.5 py-1 text-[0.8125rem] text-ink-muted"
                      >
                        {DESTINATARI[destinatario]}
                      </li>
                    ))}
                  </ul>
                  {scadenza.servizio ? (
                    <Link href={`/servizi/${scadenza.servizio}`} className="link text-body-sm">
                      Area collegata
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
