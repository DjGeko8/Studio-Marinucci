import { cookies } from 'next/headers'

import { Accesso } from '@/components/admin/Accesso'
import { Esci } from '@/components/admin/Esci'
import { NavConsole } from '@/components/admin/NavConsole'
import { Container } from '@/components/ui'
import {
  COOKIE_SESSIONE,
  configurazioneConsole,
  diagnosiConsole,
  sessioneValida,
} from '@/lib/admin/auth'
import { site } from '@/lib/site'

/**
 * Cancello e contorno della console.
 *
 * Il controllo dell'accesso sta qui e non nelle singole pagine: una pagina nuova
 * è protetta per il fatto di esistere sotto /admin, non perché qualcuno si è
 * ricordato di aggiungerci il controllo. È la differenza fra una protezione e
 * un'abitudine.
 */
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cfg = configurazioneConsole()
  const dentro = cfg
    ? await sessioneValida((await cookies()).get(COOKIE_SESSIONE)?.value, cfg.segretoSessione)
    : false

  if (!dentro) return <Accesso configurata={cfg !== null} problemi={diagnosiConsole()} />

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-petrolio-900 bg-paperGrain">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <p className="font-serif text-title-xs text-paper">{site.name}</p>
              <p className="mt-0.5 text-body-sm text-petrolio-300">Console dello studio</p>
            </div>
            <div className="flex items-center gap-5 text-body-sm">
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className="text-petrolio-100 no-underline hover:text-paper"
              >
                Vedi il sito
              </a>
              <Esci />
            </div>
          </div>
          <NavConsole />
        </Container>
      </header>

      <main>
        <Container>{children}</Container>
      </main>
    </div>
  )
}
