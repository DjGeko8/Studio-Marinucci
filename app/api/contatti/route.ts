import { NextResponse } from 'next/server'

import { recapitaRichiesta } from '@/lib/mail'
import { consentito, identificaChiamante } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Ricezione dei moduli (contatto e richiesta di appuntamento).
 *
 * Antispam senza CAPTCHA invasivi, come da specifica:
 *   1. honeypot — un campo nascosto che un essere umano non compila mai;
 *   2. tempo minimo di compilazione — i bot inviano in meno di tre secondi;
 *   3. limite di frequenza per indirizzo IP.
 *
 * Il recapito vero e proprio è in lib/mail.ts, che su Cloudflare spedisce tramite
 * il binding Email Service. Finché la casella dello studio non è configurata
 * («TBD:EMAIL»), la richiesta resta nei log del server e chi scrive riceve
 * comunque conferma: il disservizio è nostro, non suo. Istruzioni nel README,
 * sezione «Attivare il modulo».
 */

const OGGETTI_AMMESSI = [
  'consulenza-fiscale',
  'contabilita',
  'partita-iva',
  'dichiarazione-redditi',
  'successione',
  'societa',
  'revisione',
  'contenzioso',
  'appuntamento',
  'altro',
] as const

type Esito = { ok: true } | { ok: false; errore: string }

function campo(dati: FormData, nome: string): string {
  const valore = dati.get(nome)
  return typeof valore === 'string' ? valore.trim() : ''
}

function valida(dati: FormData): Esito {
  const nome = campo(dati, 'nome')
  const email = campo(dati, 'email')
  const messaggio = campo(dati, 'messaggio')
  const oggetto = campo(dati, 'oggetto')
  const privacy = campo(dati, 'privacy')

  if (nome.length < 2 || nome.length > 100) {
    return { ok: false, errore: 'Indichi il suo nome.' }
  }
  // Controllo volutamente permissivo: un'espressione regolare severa scarta indirizzi
  // validi più spesso di quanto fermi quelli sbagliati.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    return { ok: false, errore: 'Controlli l’indirizzo email.' }
  }
  if (messaggio.length < 10 || messaggio.length > 4000) {
    return { ok: false, errore: 'Scriva qualche riga in più sulla sua richiesta.' }
  }
  if (!OGGETTI_AMMESSI.includes(oggetto as (typeof OGGETTI_AMMESSI)[number])) {
    return { ok: false, errore: 'Selezioni un oggetto dall’elenco.' }
  }
  if (privacy !== 'on') {
    return { ok: false, errore: 'È necessario prendere visione dell’informativa privacy.' }
  }
  return { ok: true }
}

export async function POST(richiesta: Request) {
  let dati: FormData
  try {
    dati = await richiesta.formData()
  } catch {
    return NextResponse.json({ ok: false, errore: 'Richiesta non valida.' }, { status: 400 })
  }

  // 1. Honeypot: campo nascosto, riempito solo dai bot.
  if (campo(dati, 'sito-web') !== '') {
    // Si risponde 200 di proposito: segnalare il blocco insegnerebbe al bot ad aggirarlo.
    return NextResponse.json({ ok: true })
  }

  // 2. Tempo minimo di compilazione.
  const apertura = Number(campo(dati, 'aperto-il'))
  if (!Number.isFinite(apertura) || Date.now() - apertura < 3000) {
    return NextResponse.json({ ok: true })
  }

  // 3. Limite di frequenza per IP.
  const chiamante = identificaChiamante(richiesta.headers)
  if (!consentito(`contatti:${chiamante}`, 5, 60 * 60 * 1000).ok) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          'Sono già state inviate diverse richieste da questo collegamento. Riprovi più tardi o chiami lo studio.',
      },
      { status: 429 },
    )
  }

  const esito = valida(dati)
  if (!esito.ok) {
    return NextResponse.json(esito, { status: 400 })
  }

  const esitoInvio = await recapitaRichiesta({
    ricevutaIl: new Date().toISOString(),
    nome: campo(dati, 'nome'),
    email: campo(dati, 'email'),
    telefono: campo(dati, 'telefono'),
    oggetto: campo(dati, 'oggetto'),
    messaggio: campo(dati, 'messaggio'),
    // Presenti solo nel modulo di richiesta appuntamento.
    modalita: campo(dati, 'modalita'),
    preferenze: campo(dati, 'preferenze'),
  })

  // Si risponde `ok` anche quando il recapito fallisce: chi ha compilato il modulo
  // ha fatto la sua parte, e la richiesta resta nei log. Il motivo del mancato
  // recapito non viene esposto — non gli servirebbe a nulla e direbbe a un
  // eventuale sondaggio automatico come è configurato il server.
  return NextResponse.json({ ok: true, recapitata: esitoInvio.recapitata })
}
