'use client'

import { useState } from 'react'

import { Container } from '@/components/ui'
import { professionista, site } from '@/lib/site'

/**
 * Accesso alla console.
 *
 * Impianto a due colonne: a sinistra l'identità dello studio su fondo scuro, a
 * destra il modulo. È la stessa struttura del sito di riferimento indicato dal
 * committente, resa però con i nostri token — verde petrolio e ottone, non i suoi
 * colori.
 */
export function Accesso({ configurata }: { configurata: boolean }) {
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState('')

  async function entra(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const modulo = new FormData(evento.currentTarget)
    setInCorso(true)
    setErrore('')

    try {
      const risposta = await fetch('/api/admin/sessione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: modulo.get('email'),
          password: modulo.get('password'),
        }),
      })
      const esito = (await risposta.json()) as { ok: boolean; errore?: string }
      if (esito.ok) {
        window.location.reload()
        return
      }
      setErrore(esito.errore ?? 'Accesso non riuscito.')
    } catch {
      setErrore('Non è stato possibile contattare il server.')
    }
    setInCorso(false)
  }

  const campo =
    'mt-2 w-full rounded border border-line-strong bg-paper px-4 py-3 text-body-sm text-ink ' +
    'transition-colors hover:border-ink-muted focus:border-petrolio-600 focus:outline-none ' +
    'focus:ring-2 focus:ring-petrolio-600/30'

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Identità */}
      <div className="flex flex-col justify-between bg-petrolio-900 bg-paperGrain px-8 py-12 sm:px-14">
        <p className="font-serif text-title-xs text-paper">{site.name}</p>

        <div className="max-w-md py-16">
          <p className="eyebrow text-petrolio-300">Area riservata</p>
          <h1 className="mt-5 font-serif text-title-lg text-paper sm:text-title-xl">
            La console dello studio.
          </h1>
          <p className="mt-6 text-body text-petrolio-100">
            Da qui si aggiornano lo scadenzario e gli approfondimenti. Ogni modifica
            viene registrata nella cronologia del sito e pubblicata dopo un minuto o
            due, il tempo della ricompilazione.
          </p>
        </div>

        <p className="text-body-sm text-petrolio-300">
          {professionista.nomeCompleto} · {professionista.ordineBreve} n.{' '}
          {professionista.numeroIscrizione}
        </p>
      </div>

      {/* Modulo */}
      <div className="flex items-center bg-paper px-8 py-16 sm:px-14">
        <Container width="narrow" className="!px-0">
          <div className="max-w-md">
            <p className="eyebrow">Accesso</p>
            <h2 className="mt-4 text-title-md">Entra nella console</h2>

            {!configurata ? (
              <div className="mt-8 border-l-2 border-brass bg-paper-warm px-5 py-4 text-body-sm text-ink-soft">
                <p className="text-ink">La console non è ancora configurata.</p>
                <p className="mt-2">
                  Mancano le variabili d&apos;ambiente <code>ADMIN_EMAIL</code>,{' '}
                  <code>ADMIN_PASSWORD_HASH</code> e <code>ADMIN_SESSION_SECRET</code>. Si
                  generano con <code>npm run admin:password</code> e si impostano come
                  «Secret» nel Worker su Cloudflare. Istruzioni nel README.
                </p>
              </div>
            ) : (
              <>
                <p className="mt-3 text-body-sm text-ink-muted">
                  Inserisca le credenziali che le sono state assegnate.
                </p>

                <form onSubmit={entra} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-body-sm text-ink-soft">
                      Indirizzo email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="username"
                      className={campo}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-body-sm text-ink-soft">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      className={campo}
                    />
                  </div>

                  {errore ? (
                    <p role="alert" className="border-l-2 border-brass bg-paper-warm px-4 py-3 text-body-sm text-ink">
                      {errore}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={inCorso}
                    className="w-full rounded bg-brass px-6 py-3.5 text-body-sm text-paper transition-colors hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {inCorso ? 'Verifica in corso…' : 'Entra nella console'}
                  </button>
                </form>
              </>
            )}

            <p className="mt-10 text-body-sm">
              <a href="/" className="link">
                Torna al sito
              </a>
            </p>
          </div>
        </Container>
      </div>
    </div>
  )
}
