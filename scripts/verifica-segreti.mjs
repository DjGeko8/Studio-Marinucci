#!/usr/bin/env node
/**
 * Impedisce di pubblicare un pacchetto che contiene segreti.
 *
 * IL PROBLEMA
 *
 * L'adattatore OpenNext genera `.open-next/cloudflare/next-env.mjs` copiandoci
 * dentro le variabili d'ambiente presenti al momento della compilazione — comprese
 * quelle di un `.env.local` usato per provare la console in locale.
 *
 * Chi compilasse sul proprio computer e poi lanciasse `cf:deploy` pubblicherebbe
 * quindi la propria password e il proprio segreto di sessione dentro il Worker,
 * dove per giunta avrebbero la precedenza sui valori impostati come Secret nel
 * pannello Cloudflare. Il sito continuerebbe a funzionare: è il tipo di errore che
 * non si manifesta finché non è tardi.
 *
 * Non succede quando compila Cloudflare, perché `.env.local` non è nel repository.
 * Ma «di solito non succede» non è una difesa.
 *
 * QUESTO CONTROLLO
 *
 * Legge il file generato e verifica che le variabili sensibili siano vuote. Se
 * trova un valore, si ferma. Gira automaticamente prima di ogni `cf:deploy`.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const radice = fileURLToPath(new URL('..', import.meta.url))
const GENERATO = join(radice, '.open-next', 'cloudflare', 'next-env.mjs')

/** Variabili che non devono mai finire nel pacchetto: vanno impostate su Cloudflare. */
const SENSIBILI = [
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_SESSION_SECRET',
  'GITHUB_TOKEN',
  'MAIL_DESTINATARIO',
]

let testo
try {
  testo = await readFile(GENERATO, 'utf8')
} catch {
  console.error('⛔ Pacchetto non trovato. Esegua prima `npm run build`.')
  process.exit(1)
}

const trovate = []
for (const nome of SENSIBILI) {
  // Cerca «"NOME":"qualcosa"» con qualcosa di non vuoto.
  const trovato = testo.match(new RegExp(`"${nome}"\\s*:\\s*"([^"]+)"`))
  if (trovato?.[1]) trovate.push({ nome, lunghezza: trovato[1].length })
}

if (trovate.length === 0) {
  console.log('✓ Nessun segreto nel pacchetto: si può pubblicare.')
  process.exit(0)
}

console.error('⛔ PUBBLICAZIONE INTERROTTA: il pacchetto contiene segreti.\n')
for (const { nome, lunghezza } of trovate) {
  console.error(`  ${nome} — valore di ${lunghezza} caratteri, non mostrato`)
}
console.error(`
  Sono finiti in .open-next/cloudflare/next-env.mjs perché erano presenti come
  variabili d'ambiente durante la compilazione, quasi certamente da un .env.local.

  Pubblicandoli, quei valori finirebbero dentro il Worker e avrebbero la precedenza
  sui Secret impostati nel pannello Cloudflare.

  Come procedere:
      1. sposti o rinomini .env.local
      2. npm run build
      3. npm run cf:deploy

  In locale il file .env.local va benissimo: serve solo a non portarselo dietro.
`)
process.exit(1)
