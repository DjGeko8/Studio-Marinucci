import Link from 'next/link'
import type { ReactNode } from 'react'

import { Tbd } from '@/components/ui'
import { analizza, type Frammento } from '@/lib/testo-ricco'

/**
 * Rende un testo scritto dalla console.
 *
 * Non produce mai HTML a partire da una stringa: costruisce elementi React, che React
 * si occupa di rendere inerti. Un testo scritto in console non può quindi introdurre
 * marcatura nella pagina, per errore o altrimenti.
 */

function rendi(frammenti: Frammento[]): ReactNode {
  return frammenti.map((f, i) => {
    switch (f.tipo) {
      case 'testo':
        return <span key={i}>{f.valore}</span>

      case 'forte':
        return <strong key={i}>{rendi(f.parti)}</strong>

      case 'campo':
        // Un campo il cui valore non c'è ancora si comporta come un segnaposto: resta
        // in evidenza in pagina invece di sparire lasciando una frase monca.
        return f.valore.startsWith('«TBD:') ? (
          <Tbd key={i}>{f.valore}</Tbd>
        ) : (
          <span key={i}>{f.valore}</span>
        )

      case 'link':
        return f.href.startsWith('/') ? (
          <Link key={i} href={f.href}>
            {f.testo}
          </Link>
        ) : (
          <a
            key={i}
            href={f.href}
            {...(f.href.startsWith('http')
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {f.testo}
          </a>
        )

      case 'tbd':
        return <Tbd key={i}>{f.valore}</Tbd>
    }
  })
}

export function TestoRicco({ children }: { children: string }) {
  return <>{rendi(analizza(children))}</>
}
