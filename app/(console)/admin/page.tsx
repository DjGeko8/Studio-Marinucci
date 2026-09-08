import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { Accesso } from '@/components/admin/Accesso'
import { ConsoleScadenze } from '@/components/admin/ConsoleScadenze'
import { Esci } from '@/components/admin/Esci'
import { Container } from '@/components/ui'
import { COOKIE_SESSIONE, configurazioneConsole, sessioneValida } from '@/lib/admin/auth'
import { site } from '@/lib/site'

/**
 * La console.
 *
 * Rotta dinamica per forza di cose: deve leggere il cookie a ogni richiesta.
 * È l'unica pagina non statica del sito insieme alle rotte di servizio, ed è
 * esclusa dai motori di ricerca sia qui sia in robots.txt.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Area riservata',
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminPage() {
  const cfg = configurazioneConsole()
  const cookie = (await cookies()).get(COOKIE_SESSIONE)?.value
  const dentro = cfg ? await sessioneValida(cookie, cfg.segretoSessione) : false

  if (!dentro) {
    return <Accesso configurata={cfg !== null} />
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-petrolio-900 bg-paperGrain">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <p className="font-serif text-title-xs text-paper">{site.name}</p>
              <p className="mt-0.5 text-body-sm text-petrolio-300">Console dello studio</p>
            </div>
            <div className="flex items-center gap-5 text-body-sm">
              <a href="/" className="text-petrolio-100 no-underline hover:text-paper">
                Vedi il sito
              </a>
              <Esci />
            </div>
          </div>
        </Container>
      </header>

      <main>
        <Container>
          <div className="py-12">
            <p className="eyebrow">Contenuti</p>
            <h1 className="mt-4 text-title-lg">Scadenzario fiscale</h1>
            <p className="mt-4 max-w-prose text-body text-ink-soft">
              Le date da pubblicare sul sito. Il salvataggio registra la modifica nella
              cronologia del sito e avvia la ricompilazione: le pagine si aggiornano dopo
              un minuto o due.
            </p>

            <div className="mt-12">
              <ConsoleScadenze />
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}
