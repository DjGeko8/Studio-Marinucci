'use client'

import { useEffect, useState } from 'react'

import { EVENTO_CONSENSO, leggiConsenso, salvaConsenso } from '@/lib/consent'
import { sede } from '@/lib/site'

/**
 * Mappa dello studio.
 *
 * Due vincoli, entrambi rispettati qui:
 *
 * 1. PRIVACY — l'iframe di OpenStreetMap comunica l'indirizzo IP di chi visita a un
 *    terzo, quindi non viene caricato finché il consenso non è stato dato. Al suo
 *    posto compare l'indirizzo in chiaro e un collegamento esterno: la pagina resta
 *    pienamente utile anche rifiutando.
 *
 * 2. NIENTE DATI INVENTATI — le coordinate non sono state stimate. Finché non sono
 *    rilevate sull'indirizzo definitivo («TBD:SEDE»), la mappa non viene mostrata:
 *    uno spillo piantato nel posto sbagliato è peggio di nessuno spillo, perché manda
 *    fisicamente le persone altrove.
 */
export function MapEmbed() {
  const [consenso, setConsenso] = useState<boolean | null>(null)

  useEffect(() => {
    const aggiorna = () => setConsenso(leggiConsenso()?.contenutiEsterni ?? false)
    aggiorna()
    window.addEventListener(EVENTO_CONSENSO, aggiorna)
    return () => window.removeEventListener(EVENTO_CONSENSO, aggiorna)
  }, [])

  const indirizzoRicerca = encodeURIComponent(
    `${sede.via}, ${sede.cap} ${sede.citta} ${sede.provincia}, Italia`,
  )
  const collegamentoEsterno = `https://www.openstreetmap.org/search?query=${indirizzoRicerca}`

  const coordinateMancanti = sede.lat === null || sede.lng === null

  if (coordinateMancanti) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded bg-stone p-8 text-center ring-1 ring-inset ring-line">
        <p className="eyebrow">Mappa non ancora attiva</p>
        <p className="max-w-md text-body-sm text-ink-soft">
          Le coordinate saranno rilevate sull&apos;indirizzo definitivo. Non sono state
          stimate di proposito: uno spillo nel punto sbagliato manda le persone altrove.
        </p>
        <a
          href={collegamentoEsterno}
          target="_blank"
          rel="noopener noreferrer"
          className="link text-body-sm"
        >
          Cerca l&apos;indirizzo su OpenStreetMap
        </a>
      </div>
    )
  }

  if (!consenso) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-4 rounded bg-stone p-8 text-center ring-1 ring-inset ring-line">
        <p className="eyebrow">Mappa non caricata</p>
        <p className="max-w-md text-body-sm text-ink-soft">
          La mappa è ospitata da OpenStreetMap: caricandola, il suo indirizzo IP viene
          comunicato a quel servizio. Senza mappa l&apos;indirizzo resta comunque leggibile
          qui sopra.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => salvaConsenso(true)}
            className="rounded bg-petrolio-700 px-5 py-2.5 text-body-sm text-paper transition-colors hover:bg-petrolio-800"
          >
            Carica la mappa
          </button>
          <a
            href={collegamentoEsterno}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-line-strong px-5 py-2.5 text-body-sm text-ink no-underline transition-colors hover:border-petrolio-600"
          >
            Apri su OpenStreetMap
          </a>
        </div>
      </div>
    )
  }

  const lat = sede.lat as number
  const lng = sede.lng as number
  const riquadro = [lng - 0.004, lat - 0.002, lng + 0.004, lat + 0.002].join(',')

  return (
    <div className="overflow-hidden rounded ring-1 ring-line">
      <iframe
        title={`Mappa: ${sede.completo}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${riquadro}&layer=mapnik&marker=${lat},${lng}`}
        loading="lazy"
        className="aspect-[16/10] w-full border-0"
      />
    </div>
  )
}
