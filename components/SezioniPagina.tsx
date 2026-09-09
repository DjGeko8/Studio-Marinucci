import { Fragment, type ReactNode } from 'react'

import { TestoRicco } from '@/components/TestoRicco'
import { Prose } from '@/components/ui'
import type { Blocco, Sezione } from '@/content/pagine'

/**
 * Impaginazione dei testi modificabili dalla console.
 *
 * Le pagine legali sono documenti: un seguito di titoli, paragrafi ed elenchi. Quello
 * che le distingue da un testo qualsiasi sono i **blocchi di dati** — i recapiti del
 * titolare, gli estremi della polizza — che il sito stampa da sé e che la console non
 * può toccare.
 *
 * `ancore` è il punto in cui i due mondi si incontrano: associa a una sezione ciò che
 * la pagina stampa subito dopo di essa. Il testo si può riordinare, riscrivere,
 * allungare; il blocco di dati segue la sua sezione e non si perde per strada.
 */

export function Blocchi({ blocchi }: { blocchi: Blocco[] }) {
  return (
    <>
      {blocchi.map((blocco, i) =>
        blocco.tipo === 'elenco' ? (
          <ul key={i}>
            {blocco.voci.map((voce, j) => (
              <li key={j}>
                <TestoRicco>{voce}</TestoRicco>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <TestoRicco>{blocco.testo}</TestoRicco>
          </p>
        ),
      )}
    </>
  )
}

export function SezioniDocumento({
  sezioni,
  ancore,
}: {
  sezioni: Sezione[]
  ancore?: Record<string, ReactNode>
}) {
  return (
    <>
      {sezioni.map((sezione) => (
        <Fragment key={sezione.id}>
          <Prose>
            {sezione.titolo ? (
              <h2>
                <TestoRicco>{sezione.titolo}</TestoRicco>
              </h2>
            ) : null}
            <Blocchi blocchi={sezione.blocchi} />
          </Prose>
          {ancore?.[sezione.id] ?? null}
        </Fragment>
      ))}
    </>
  )
}
