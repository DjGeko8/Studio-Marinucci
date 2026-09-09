import Link from 'next/link'
import type { ReactNode } from 'react'

import { Container, Eyebrow } from '@/components/ui'

export type Briciola = { href: string; label: string }

/**
 * Apertura delle pagine interne.
 * Le briciole sono anche il dato che alimenta lo structured data BreadcrumbList:
 * la stessa gerarchia va passata a <JsonLdBreadcrumb>.
 */
export function PageHero({
  eyebrow,
  titolo,
  sommario,
  briciole = [],
  children,
}: {
  eyebrow?: string
  /** Titolo e sommario accettano elementi: possono contenere campi automatici. */
  titolo: ReactNode
  sommario?: ReactNode
  briciole?: Briciola[]
  children?: ReactNode
}) {
  return (
    <div className="border-b border-line bg-paper-warm">
      <Container>
        <div className="py-14 sm:py-20">
          {briciole.length > 0 ? (
            <nav aria-label="Percorso di navigazione" className="mb-8">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-ink-muted">
                <li>
                  <Link href="/" className="no-underline hover:text-ink">
                    Home
                  </Link>
                </li>
                {briciole.map((briciola, indice) => {
                  const ultima = indice === briciole.length - 1
                  return (
                    <li key={briciola.href} className="flex items-center gap-2">
                      <span aria-hidden="true">/</span>
                      {ultima ? (
                        <span className="text-ink" aria-current="page">
                          {briciola.label}
                        </span>
                      ) : (
                        <Link href={briciola.href} className="no-underline hover:text-ink">
                          {briciola.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
          ) : null}

          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className={`max-w-4xl text-title-lg sm:text-title-xl ${eyebrow ? 'mt-4' : ''}`}>
            {titolo}
          </h1>
          {sommario ? (
            <p className="mt-6 max-w-prose text-body-lg text-ink-soft">{sommario}</p>
          ) : null}
          {children}
        </div>
      </Container>
    </div>
  )
}
