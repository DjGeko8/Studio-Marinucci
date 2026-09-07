'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Container, cx } from '@/components/ui'
import { contatti, navPrincipale, orari, professionista, site } from '@/lib/site'

/**
 * Barra superiore + navigazione.
 *
 * La barra con telefono, email e orari è l'elemento che converte di più su un
 * professionista locale (ripreso da De Stefani): resta visibile anche da telefono,
 * dove collassa in due voci cliccabili.
 */
export function Header() {
  const pathname = usePathname()
  const [apertoMobile, setApertoMobile] = useState(false)

  // Chiude il menu quando si cambia pagina.
  useEffect(() => {
    setApertoMobile(false)
  }, [pathname])

  // Blocca lo scorrimento del corpo mentre il menu mobile è aperto.
  useEffect(() => {
    document.body.style.overflow = apertoMobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [apertoMobile])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      {/* Barra contatti */}
      <div className="bg-petrolio-800 text-petrolio-100">
        <Container>
          <div className="flex h-9 items-center justify-between gap-4 text-[0.8125rem]">
            <div className="flex items-center gap-5">
              <a
                href={contatti.telefonoHref}
                className="no-underline transition-colors hover:text-paper"
              >
                <span aria-hidden="true">☎ </span>
                {contatti.telefono}
              </a>
              <a
                href={`mailto:${contatti.email}`}
                className="hidden no-underline transition-colors hover:text-paper sm:inline"
              >
                <span aria-hidden="true">✉ </span>
                {contatti.email}
              </a>
            </div>
            <p className="hidden truncate md:block">
              {orari.sintesi} · {orari.nota}
            </p>
          </div>
        </Container>
      </div>

      {/* Navigazione */}
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="group no-underline" aria-label={`${site.name} — home`}>
            <span className="block font-serif text-title-sm leading-none text-ink transition-colors group-hover:text-petrolio-700">
              {site.name}
            </span>
            <span className="mt-1 block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">
              {professionista.titoli.join(' · ')}
            </span>
          </Link>

          <nav aria-label="Navigazione principale" className="hidden items-center gap-7 lg:flex">
            {navPrincipale.map((voce) => {
              const attiva =
                pathname === voce.href || pathname.startsWith(`${voce.href}/`)
              return (
                <Link
                  key={voce.href}
                  href={voce.href}
                  aria-current={attiva ? 'page' : undefined}
                  className={cx(
                    'border-b-2 pb-1 text-body-sm no-underline transition-colors duration-DEFAULT',
                    attiva
                      ? 'border-brass text-ink'
                      : 'border-transparent text-ink-soft hover:border-line-strong hover:text-ink',
                  )}
                >
                  {voce.label}
                </Link>
              )
            })}
            <Link
              href="/appuntamento"
              className="rounded bg-petrolio-700 px-5 py-2.5 text-body-sm text-paper no-underline transition-colors duration-DEFAULT hover:bg-petrolio-800"
            >
              Prenota un appuntamento
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setApertoMobile((v) => !v)}
            aria-expanded={apertoMobile}
            aria-controls="menu-mobile"
            className="flex items-center gap-2 rounded border border-line-strong px-3.5 py-2 text-body-sm text-ink lg:hidden"
          >
            <span aria-hidden="true">{apertoMobile ? '✕' : '☰'}</span>
            {apertoMobile ? 'Chiudi' : 'Menu'}
          </button>
        </div>
      </Container>

      {/* Menu mobile */}
      {apertoMobile ? (
        <div id="menu-mobile" className="border-t border-line bg-paper lg:hidden">
          <Container>
            <nav aria-label="Navigazione principale (mobile)" className="flex flex-col py-4">
              {navPrincipale.map((voce) => (
                <Link
                  key={voce.href}
                  href={voce.href}
                  className="border-b border-line py-3.5 text-body no-underline text-ink"
                >
                  {voce.label}
                </Link>
              ))}
              <Link
                href="/appuntamento"
                className="mt-5 rounded bg-petrolio-700 px-5 py-3.5 text-center text-body-sm text-paper no-underline"
              >
                Prenota un appuntamento
              </Link>
              <a
                href={contatti.telefonoHref}
                className="mt-3 rounded border border-line-strong px-5 py-3.5 text-center text-body-sm text-ink no-underline"
              >
                Chiama lo studio · {contatti.telefono}
              </a>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
