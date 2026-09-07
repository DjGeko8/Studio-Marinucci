'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Container } from '@/components/ui'
import { EVENTO_CONSENSO, leggiConsenso, salvaConsenso } from '@/lib/consent'

/**
 * Banner di consenso.
 *
 * Regole rispettate:
 * — "Rifiuta" ha lo stesso rilievo di "Accetta" (nessun pulsante scolorito);
 * — nulla di terze parti viene caricato prima della scelta;
 * — il consenso è revocabile in ogni momento dalla cookie policy;
 * — il banner non blocca la lettura della pagina né si ripresenta dopo la scelta.
 */
export function CookieBanner() {
  const [visibile, setVisibile] = useState(false)
  const [dettagli, setDettagli] = useState(false)

  useEffect(() => {
    setVisibile(leggiConsenso() === null)
    const alCambio = () => {
      setVisibile(leggiConsenso() === null)
      setDettagli(false)
    }
    window.addEventListener(EVENTO_CONSENSO, alCambio)
    return () => window.removeEventListener(EVENTO_CONSENSO, alCambio)
  }, [])

  if (!visibile) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="titolo-cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-petrolio-700 bg-petrolio-900 text-petrolio-100"
    >
      <Container>
        <div className="flex flex-col gap-5 py-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p id="titolo-cookie" className="font-serif text-title-xs text-paper">
              Contenuti esterni
            </p>
            <p className="mt-2 text-body-sm">
              Il sito non usa cookie di profilazione e non impiega strumenti di analisi di
              terze parti. Chiediamo il consenso solo per la mappa, che è ospitata da
              OpenStreetMap: caricandola, il suo indirizzo IP viene comunicato a quel
              servizio. Rifiutando, l&apos;indirizzo dello studio resta comunque leggibile.
            </p>

            {dettagli ? (
              <dl className="mt-5 space-y-3 border-t border-petrolio-700 pt-4 text-body-sm">
                <div>
                  <dt className="text-paper">Tecnici necessari — sempre attivi</dt>
                  <dd className="text-petrolio-200">
                    Servono a ricordare questa scelta e a far funzionare il modulo di
                    contatto. Non tracciano la navigazione e non possono essere disattivati.
                  </dd>
                </div>
                <div>
                  <dt className="text-paper">Contenuti esterni — facoltativi</dt>
                  <dd className="text-petrolio-200">
                    Mappa OpenStreetMap nella pagina «Dove siamo». Nessun altro contenuto di
                    terze parti è presente nel sito.
                  </dd>
                </div>
              </dl>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm">
              <button
                type="button"
                onClick={() => setDettagli((v) => !v)}
                className="underline underline-offset-4 transition-colors hover:text-paper"
              >
                {dettagli ? 'Nascondi i dettagli' : 'Mostra i dettagli'}
              </button>
              <Link
                href="/cookie-policy"
                className="underline underline-offset-4 transition-colors hover:text-paper"
              >
                Cookie policy
              </Link>
              <Link
                href="/privacy"
                className="underline underline-offset-4 transition-colors hover:text-paper"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* Le due scelte hanno pari rilievo visivo: è un requisito, non un dettaglio. */}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <button
              type="button"
              onClick={() => salvaConsenso(false)}
              className="rounded border border-petrolio-300 px-6 py-3 text-body-sm text-paper transition-colors hover:bg-petrolio-800"
            >
              Rifiuta
            </button>
            <button
              type="button"
              onClick={() => salvaConsenso(true)}
              className="rounded border border-petrolio-300 bg-petrolio-300 px-6 py-3 text-body-sm text-petrolio-900 transition-colors hover:bg-petrolio-200"
            >
              Accetta
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}
