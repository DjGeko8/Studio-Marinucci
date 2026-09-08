import { NextResponse } from 'next/server'

import {
  COOKIE_SESSIONE,
  configurazioneConsole,
  creaSessione,
  passwordCorretta,
} from '@/lib/admin/auth'
import { consentito, identificaChiamante } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Accesso e uscita dalla console.
 *
 * Il messaggio d'errore è sempre lo stesso, sia che l'email non corrisponda sia
 * che la password sia sbagliata: distinguerli direbbe a un estraneo quali indirizzi
 * sono validi.
 *
 * Il ritardo minimo di un secondo su ogni tentativo fallito rende la forza bruta
 * lenta anche prima che scatti il limite di frequenza.
 */

const ERRORE_GENERICO = 'Email o password non corretti.'

function attendi(ms: number) {
  return new Promise((risolvi) => setTimeout(risolvi, ms))
}

export async function POST(richiesta: Request) {
  const cfg = configurazioneConsole()
  if (!cfg) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          'La console non è configurata su questo server. Servono ADMIN_EMAIL, ADMIN_PASSWORD_HASH e ADMIN_SESSION_SECRET.',
      },
      { status: 503 },
    )
  }

  const chiamante = identificaChiamante(richiesta.headers)
  if (!consentito(`console:${chiamante}`, 8, 15 * 60 * 1000).ok) {
    return NextResponse.json(
      { ok: false, errore: 'Troppi tentativi. Riprovi fra un quarto d’ora.' },
      { status: 429 },
    )
  }

  let dati: { email?: unknown; password?: unknown }
  try {
    dati = (await richiesta.json()) as typeof dati
  } catch {
    return NextResponse.json({ ok: false, errore: ERRORE_GENERICO }, { status: 400 })
  }

  const email = typeof dati.email === 'string' ? dati.email.trim().toLowerCase() : ''
  const password = typeof dati.password === 'string' ? dati.password : ''

  const emailCorretta = email === cfg.email.toLowerCase()
  // La password viene verificata sempre, anche a email sbagliata: così il tempo di
  // risposta non rivela se l'indirizzo esiste.
  const passwordOk = await passwordCorretta(password, cfg.hashPassword)

  if (!emailCorretta || !passwordOk) {
    await attendi(1000)
    return NextResponse.json({ ok: false, errore: ERRORE_GENERICO }, { status: 401 })
  }

  const sessione = await creaSessione(cfg.segretoSessione)
  const risposta = NextResponse.json({ ok: true })
  risposta.cookies.set(COOKIE_SESSIONE, sessione.valore, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: sessione.scadeIl,
  })
  return risposta
}

export async function DELETE() {
  const risposta = NextResponse.json({ ok: true })
  risposta.cookies.set(COOKIE_SESSIONE, '', { path: '/', maxAge: 0 })
  return risposta
}
