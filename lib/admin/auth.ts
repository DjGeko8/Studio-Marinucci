/**
 * Autenticazione della console.
 *
 * Un solo utente: il professionista. Niente registrazione, niente recupero
 * password via email, niente ruoli — tutte cose che aggiungerebbero superficie
 * d'attacco a un pannello usato da una persona sola.
 *
 * SCELTE, E PERCHÉ
 *
 * — La password non sta mai nel repository. In `ADMIN_PASSWORD_HASH` va il
 *   risultato di `npm run admin:password`, cioè `iterazioni:salt:hash` in esadecimale.
 *   Chi legge il codice sorgente non ricava la password.
 *
 * — La derivazione usa PBKDF2-SHA256 con 210.000 iterazioni: rende il tentativo a
 *   forza bruta costoso anche se un giorno l'hash trapelasse.
 *
 * — La sessione è un cookie firmato, non un identificativo da cercare in un
 *   archivio: il sito non ha un database e non deve acquisirne uno per questo.
 *   Il cookie contiene la scadenza e una firma HMAC; se qualcuno lo modifica, la
 *   firma non torna.
 *
 * — I confronti di firma sono a tempo costante. Con `===` la durata del confronto
 *   dipende da quanti caratteri iniziali coincidono, e da quella differenza si può
 *   ricostruire una firma valida un carattere alla volta.
 *
 * — L'errore di accesso è sempre lo stesso, sia che l'email non esista sia che la
 *   password sia sbagliata: dire «email inesistente» confermerebbe a un estraneo
 *   quali indirizzi sono validi.
 */

const ITERAZIONI_PREDEFINITE = 210_000
const DURATA_SESSIONE_MS = 12 * 60 * 60 * 1000 // 12 ore
export const COOKIE_SESSIONE = 'sm_console'

const codificatore = new TextEncoder()

function esadecimale(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function daEsadecimale(testo: string): Uint8Array {
  const byte = new Uint8Array(testo.length / 2)
  for (let i = 0; i < byte.length; i++) {
    byte[i] = Number.parseInt(testo.slice(i * 2, i * 2 + 2), 16)
  }
  return byte
}

/** Confronto a tempo costante: la durata non dipende da dove cade la differenza. */
function ugualiATempoCostante(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let differenza = 0
  for (let i = 0; i < a.length; i++) {
    differenza |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return differenza === 0
}

async function derivaPassword(
  password: string,
  salt: Uint8Array,
  iterazioni: number,
): Promise<string> {
  const chiave = await crypto.subtle.importKey(
    'raw',
    codificatore.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bit = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: iterazioni, hash: 'SHA-256' },
    chiave,
    256,
  )
  return esadecimale(bit)
}

/** Produce la stringa da mettere in ADMIN_PASSWORD_HASH. Usata da scripts/. */
export async function creaHashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derivaPassword(password, salt, ITERAZIONI_PREDEFINITE)
  return `${ITERAZIONI_PREDEFINITE}:${esadecimale(salt.buffer as ArrayBuffer)}:${hash}`
}

export async function passwordCorretta(password: string, memorizzato: string): Promise<boolean> {
  const parti = memorizzato.split(':')
  if (parti.length !== 3) return false
  const [iterazioniTesto, saltTesto, hashAtteso] = parti as [string, string, string]
  const iterazioni = Number.parseInt(iterazioniTesto, 10)
  if (!Number.isFinite(iterazioni) || iterazioni < 1000) return false

  const hash = await derivaPassword(password, daEsadecimale(saltTesto), iterazioni)
  return ugualiATempoCostante(hash, hashAtteso)
}

// ── Sessione ────────────────────────────────────────────────────────────────

async function firma(messaggio: string, segreto: string): Promise<string> {
  const chiave = await crypto.subtle.importKey(
    'raw',
    codificatore.encode(segreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return esadecimale(await crypto.subtle.sign('HMAC', chiave, codificatore.encode(messaggio)))
}

export async function creaSessione(segreto: string): Promise<{ valore: string; scadeIl: Date }> {
  const scadenza = Date.now() + DURATA_SESSIONE_MS
  const corpo = String(scadenza)
  return {
    valore: `${corpo}.${await firma(corpo, segreto)}`,
    scadeIl: new Date(scadenza),
  }
}

export async function sessioneValida(
  cookie: string | undefined,
  segreto: string,
): Promise<boolean> {
  if (!cookie) return false
  const punto = cookie.lastIndexOf('.')
  if (punto <= 0) return false

  const corpo = cookie.slice(0, punto)
  const firmaRicevuta = cookie.slice(punto + 1)

  if (!ugualiATempoCostante(firmaRicevuta, await firma(corpo, segreto))) return false

  const scadenza = Number.parseInt(corpo, 10)
  return Number.isFinite(scadenza) && scadenza > Date.now()
}

// ── Configurazione ──────────────────────────────────────────────────────────

export type ConfigurazioneConsole = {
  email: string
  hashPassword: string
  segretoSessione: string
}

/**
 * Legge la configurazione dalle variabili d'ambiente.
 * Restituisce `null` se manca qualcosa: in quel caso la console si dichiara non
 * configurata invece di accettare accessi. Un pannello che si apre perché una
 * variabile è vuota è il modo peggiore di sbagliare.
 */
export function configurazioneConsole(): ConfigurazioneConsole | null {
  const email = process.env.ADMIN_EMAIL?.trim()
  const hashPassword = process.env.ADMIN_PASSWORD_HASH?.trim()
  const segretoSessione = process.env.ADMIN_SESSION_SECRET?.trim()

  if (!email || !hashPassword || !segretoSessione) return null
  if (segretoSessione.length < 32) return null

  return { email, hashPassword, segretoSessione }
}
