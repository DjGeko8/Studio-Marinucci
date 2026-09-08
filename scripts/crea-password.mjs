#!/usr/bin/env node
/**
 * Genera i valori da mettere nelle variabili d'ambiente della console.
 *
 *     npm run admin:password
 *
 * Stampa l'hash della password e un segreto di sessione. Nessuno dei due va nel
 * repository: si incollano nel pannello Cloudflare, fra le variabili del Worker,
 * marcandoli come «Secret» — non come «Text», altrimenti restano leggibili in chiaro
 * a chiunque apra le impostazioni.
 *
 * La password in chiaro non viene salvata da nessuna parte: da qui esce solo
 * l'hash, dal quale non si torna indietro.
 */

import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const ITERAZIONI = 210_000

function esadecimale(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password) {
  const chiave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bit = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERAZIONI, hash: 'SHA-256' },
    chiave,
    256,
  )
  return `${ITERAZIONI}:${esadecimale(salt.buffer)}:${esadecimale(bit)}`
}

const rl = createInterface({ input: stdin, output: stdout })

console.log('\nGenerazione delle credenziali della console\n')
const email = (await rl.question('Email di accesso: ')).trim()
const password = await rl.question('Password (verrà mostrata a schermo): ')
rl.close()

if (!email.includes('@')) {
  console.error('\n✗ Email non valida.')
  process.exit(1)
}
if (password.length < 12) {
  console.error(
    '\n✗ Password troppo corta: almeno 12 caratteri.' +
      '\n  È l’unica cosa che protegge la console: una lunga e inventata sul momento' +
      '\n  vale più di una corta e complicata.',
  )
  process.exit(1)
}

const hash = await hashPassword(password)
const segreto = esadecimale(crypto.getRandomValues(new Uint8Array(32)).buffer)

console.log('\n' + '─'.repeat(72))
console.log('Variabili da impostare come SECRET nel Worker su Cloudflare:\n')
console.log(`ADMIN_EMAIL=${email}`)
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
console.log(`ADMIN_SESSION_SECRET=${segreto}`)
console.log('\nServe inoltre un token GitHub con permesso di scrittura sul repository:')
console.log('GITHUB_TOKEN=...')
console.log('GITHUB_REPO=DjGeko8/Studio-Marinucci')
console.log('─'.repeat(72))
console.log('\nNON metterli nel repository. Se un giorno cambia la password, si rigenera')
console.log('solo ADMIN_PASSWORD_HASH: le sessioni aperte restano valide fino a scadenza,')
console.log('e per chiuderle subito basta cambiare anche ADMIN_SESSION_SECRET.\n')
