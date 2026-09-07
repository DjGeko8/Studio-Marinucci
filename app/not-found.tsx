import type { Metadata } from 'next'
import Link from 'next/link'

import { ButtonLink, Container, Eyebrow, Section } from '@/components/ui'
import { contatti, navPrincipale } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Pagina non trovata',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <Section size="large">
      <Container width="narrow">
        <Eyebrow>Errore 404</Eyebrow>
        <h1 className="mt-4 text-title-lg sm:text-title-xl">Pagina non trovata</h1>
        <p className="mt-6 max-w-prose text-body-lg text-ink-soft">
          L&apos;indirizzo richiesto non corrisponde ad alcuna pagina del sito. Può darsi
          che sia stato modificato, oppure che il collegamento seguito contenga un refuso.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/">Torna alla home</ButtonLink>
          <ButtonLink href={contatti.telefonoHref} tone="secondary">
            Chiama · {contatti.telefono}
          </ButtonLink>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="eyebrow">Sezioni del sito</p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {navPrincipale.map((voce) => (
              <li key={voce.href}>
                <Link href={voce.href} className="link text-body">
                  {voce.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  )
}
