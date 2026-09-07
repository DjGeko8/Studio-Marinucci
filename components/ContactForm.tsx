'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { cx } from '@/components/ui'

/**
 * Modulo di contatto e di richiesta appuntamento.
 *
 * Antispam senza CAPTCHA: honeypot + tempo minimo di compilazione, verificati lato
 * server in app/api/contatti/route.ts. Nessuno dei due chiede nulla all'utente, il
 * che è il punto: un CAPTCHA su un sito di consulenza allontana proprio le persone
 * meno pratiche, che sono una parte del pubblico dello studio.
 */

const OGGETTI = [
  { valore: 'consulenza-fiscale', etichetta: 'Consulenza fiscale' },
  { valore: 'contabilita', etichetta: 'Contabilità e bilancio' },
  { valore: 'partita-iva', etichetta: 'Apertura partita IVA' },
  { valore: 'dichiarazione-redditi', etichetta: 'Dichiarazione dei redditi' },
  { valore: 'successione', etichetta: 'Successione' },
  { valore: 'societa', etichetta: 'Società e operazioni societarie' },
  { valore: 'revisione', etichetta: 'Revisione legale' },
  { valore: 'contenzioso', etichetta: 'Controlli, accertamenti, cartelle' },
  { valore: 'altro', etichetta: 'Altro' },
]

type Stato = 'compilazione' | 'invio' | 'inviato' | 'errore'

const etichetta = 'block text-body-sm text-ink-soft'
const campo =
  'mt-2 w-full rounded border border-line-strong bg-paper px-4 py-3 text-body-sm text-ink ' +
  'transition-colors placeholder:text-ink-muted/70 hover:border-ink-muted ' +
  'focus:border-petrolio-600 focus:outline-none focus:ring-2 focus:ring-petrolio-600/30'

export function ContactForm({
  variante = 'completo',
  oggettoIniziale,
}: {
  /** `appuntamento` aggiunge modalità e preferenze di data. */
  variante?: 'completo' | 'compatto' | 'appuntamento'
  oggettoIniziale?: string
}) {
  const [stato, setStato] = useState<Stato>('compilazione')
  const [errore, setErrore] = useState<string>('')
  const apertoIl = useRef<number>(0)
  const esitoRef = useRef<HTMLDivElement>(null)

  // Momento in cui il modulo è comparso: serve al controllo del tempo minimo.
  useEffect(() => {
    apertoIl.current = Date.now()
  }, [])

  // Porta il focus sull'esito: chi naviga da tastiera o con screen reader
  // altrimenti non si accorge che l'invio è andato a buon fine.
  useEffect(() => {
    if (stato === 'inviato' || stato === 'errore') esitoRef.current?.focus()
  }, [stato])

  async function invia(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const modulo = evento.currentTarget
    const dati = new FormData(modulo)
    dati.set('aperto-il', String(apertoIl.current))

    setStato('invio')
    setErrore('')

    try {
      const risposta = await fetch('/api/contatti', { method: 'POST', body: dati })
      const esito = (await risposta.json()) as { ok: boolean; errore?: string }
      if (!risposta.ok || !esito.ok) {
        setErrore(esito.errore ?? 'Invio non riuscito. Riprovi o chiami lo studio.')
        setStato('errore')
        return
      }
      modulo.reset()
      setStato('inviato')
    } catch {
      setErrore(
        'Non è stato possibile inviare la richiesta. Controlli il collegamento oppure chiami lo studio.',
      )
      setStato('errore')
    }
  }

  if (stato === 'inviato') {
    return (
      <div
        ref={esitoRef}
        tabIndex={-1}
        role="status"
        className="rounded border border-petrolio-200 bg-petrolio-50 p-6 focus:outline-none"
      >
        <p className="font-serif text-title-xs text-petrolio-900">Richiesta inviata</p>
        <p className="mt-3 text-body-sm text-ink-soft">
          Grazie. La richiesta è stata registrata e lo studio la ricontatterà. Se la
          questione è urgente, può chiamare direttamente durante gli orari di apertura.
        </p>
        <button
          type="button"
          onClick={() => setStato('compilazione')}
          className="mt-5 text-body-sm text-petrolio-700 underline underline-offset-4"
        >
          Invia un&apos;altra richiesta
        </button>
      </div>
    )
  }

  const compatto = variante === 'compatto'

  return (
    <form onSubmit={invia} noValidate className="space-y-5">
      {/* Honeypot: fuori dal flusso, escluso dal tab e dagli screen reader. */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="sito-web">Non compilare questo campo</label>
        <input id="sito-web" type="text" name="sito-web" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={cx('grid gap-5', !compatto && 'sm:grid-cols-2')}>
        <div>
          <label htmlFor="nome" className={etichetta}>
            Nome e cognome <span className="text-brass">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            autoComplete="name"
            maxLength={100}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="email" className={etichetta}>
            Email <span className="text-brass">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            className={campo}
          />
        </div>
      </div>

      <div className={cx('grid gap-5', !compatto && 'sm:grid-cols-2')}>
        <div>
          <label htmlFor="telefono" className={etichetta}>
            Telefono <span className="text-ink-muted">(facoltativo)</span>
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="oggetto" className={etichetta}>
            Oggetto della richiesta <span className="text-brass">*</span>
          </label>
          <select
            id="oggetto"
            name="oggetto"
            required
            defaultValue={oggettoIniziale ?? (variante === 'appuntamento' ? 'appuntamento' : '')}
            className={campo}
          >
            <option value="" disabled>
              Selezioni un oggetto
            </option>
            {variante === 'appuntamento' ? (
              <option value="appuntamento">Richiesta di appuntamento</option>
            ) : null}
            {OGGETTI.map((o) => (
              <option key={o.valore} value={o.valore}>
                {o.etichetta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {variante === 'appuntamento' ? (
        <>
          <fieldset>
            <legend className={etichetta}>Modalità dell&apos;incontro</legend>
            <div className="mt-3 flex flex-wrap gap-6">
              {[
                { valore: 'studio', etichetta: 'In studio, a Termoli' },
                { valore: 'videochiamata', etichetta: 'In videochiamata' },
                { valore: 'indifferente', etichetta: 'Indifferente' },
              ].map((opzione, indice) => (
                <label
                  key={opzione.valore}
                  className="flex items-center gap-2.5 text-body-sm text-ink"
                >
                  <input
                    type="radio"
                    name="modalita"
                    value={opzione.valore}
                    defaultChecked={indice === 0}
                    className="h-4 w-4 accent-petrolio-700"
                  />
                  {opzione.etichetta}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="preferenze" className={etichetta}>
              Giorni e fasce orarie preferite
            </label>
            <input
              id="preferenze"
              name="preferenze"
              type="text"
              maxLength={200}
              placeholder="Es. martedì o giovedì mattina, oppure venerdì pomeriggio"
              className={campo}
            />
            <p className="mt-2 text-body-sm text-ink-muted">
              Indichi due o tre alternative: lo studio confermerà l&apos;orario disponibile
              più vicino alle sue preferenze.
            </p>
          </div>
        </>
      ) : null}

      <div>
        <label htmlFor="messaggio" className={etichetta}>
          La sua richiesta <span className="text-brass">*</span>
        </label>
        <textarea
          id="messaggio"
          name="messaggio"
          required
          rows={compatto ? 4 : 6}
          minLength={10}
          maxLength={4000}
          className={campo}
        />
        <p className="mt-2 text-body-sm text-ink-muted">
          Non inserisca in questo modulo dati sensibili o documenti riservati: per quelli
          si concorderà un canale adeguato.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          required
          className="mt-1.5 h-4 w-4 shrink-0 accent-petrolio-700"
        />
        <label htmlFor="privacy" className="text-body-sm text-ink-soft">
          Ho preso visione dell&apos;
          <Link href="/privacy" className="link">
            informativa privacy
          </Link>{' '}
          e acconsento al trattamento dei dati per rispondere alla mia richiesta.{' '}
          <span className="text-brass">*</span>
        </label>
      </div>

      {stato === 'errore' ? (
        <div
          ref={esitoRef}
          tabIndex={-1}
          role="alert"
          className="rounded border-l-2 border-brass bg-paper-warm px-4 py-3 text-body-sm text-ink focus:outline-none"
        >
          {errore}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={stato === 'invio'}
          className="rounded bg-petrolio-700 px-7 py-3.5 text-body-sm text-paper transition-colors hover:bg-petrolio-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {stato === 'invio' ? 'Invio in corso…' : 'Invia la richiesta'}
        </button>
        <p className="text-body-sm text-ink-muted">
          I campi contrassegnati con <span className="text-brass">*</span> sono obbligatori.
        </p>
      </div>
    </form>
  )
}
