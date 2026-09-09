#!/usr/bin/env node
/**
 * Carica su Cloudflare i tre Secret della console, in un colpo solo.
 *
 *     npx wrangler login          (una volta, la fai tu: è il tuo account)
 *     npm run admin:imposta
 *
 * Legge i valori da `.credenziali-console.txt`, generato da `npm run admin:password`,
 * e li passa a `wrangler secret put` uno per uno.
 *
 * PERCHÉ UNO SCRIPT INVECE DI TRE COPIA-INCOLLA
 *
 * L'impronta della password è lunga 104 caratteri e il segreto di sessione 64: sono
 * esattamente il genere di valori che si incollano a metà senza accorgersene, e il
 * risultato è una console che si dichiara non configurata senza dire perché. Qui i
 * valori passano dal file al comando senza mai attraversare gli appunti.
 *
 * I Secret sono diversi dalle variabili in chiaro: sopravvivono ai rilasci, mentre
 * le variabili «Text» vengono sostituite a ogni deploy da quelle di wrangler.jsonc.
 */

import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const radice = fileURLToPath(new URL('..', import.meta.url))
const FILE = join(radice, '.credenziali-console.txt')

let testo
try {
  testo = await readFile(FILE, 'utf8')
} catch {
  console.error(
    '⛔ Non trovo .credenziali-console.txt\n\n' +
      '  Lo genera `npm run admin:password`. Lo esegua prima di questo comando.\n',
  )
  process.exit(1)
}

const valori = new Map()
for (const riga of testo.split('\n')) {
  const trovato = riga.match(/^([A-Z_]+)=(.+)$/)
  if (trovato) valori.set(trovato[1], trovato[2].trim())
}

/** Elenco chiuso: nessun nome arriva da fuori. */
const ATTESI = ['ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET']
const mancanti = ATTESI.filter((n) => !valori.get(n))
if (mancanti.length > 0) {
  console.error(`⛔ Nel file mancano: ${mancanti.join(', ')}`)
  process.exit(1)
}

/** Esegue wrangler passando il valore su stdin, così non compare fra gli argomenti. */
function impostaSecret(nome, valore) {
  if (!ATTESI.includes(nome)) throw new Error(`Nome non ammesso: ${nome}`)
  return new Promise((risolvi) => {
    // `shell: true` è necessario su Windows: da Node 20 `spawn` rifiuta i file .cmd,
    // e `npx` lì è appunto un .cmd. Il comando è passato come stringa unica perché
    // con la shell gli argomenti separati non vengono protetti: qui `nome` viene
    // dall'elenco fisso qui sotto, mai da fuori, ma la forma giusta è comunque questa.
    const processo = spawn(`npx wrangler secret put ${nome}`, {
      cwd: radice,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    })
    let uscita = ''
    processo.stdout.on('data', (d) => (uscita += d))
    processo.stderr.on('data', (d) => (uscita += d))
    processo.stdin.write(valore + '\n')
    processo.stdin.end()
    processo.on('close', (codice) => risolvi({ codice, uscita }))
  })
}

console.log('\nCaricamento dei Secret sul Worker…\n')

let falliti = 0
for (const nome of ATTESI) {
  const { codice, uscita } = await impostaSecret(nome, valori.get(nome))
  if (codice === 0) {
    console.log(`  ✓ ${nome}`)
  } else {
    falliti++
    console.log(`  ✗ ${nome}`)
    const motivo = uscita.split('\n').find((r) => /error|authenticat|login/i.test(r))
    if (motivo) console.log(`      ${motivo.trim().slice(0, 110)}`)
  }
}

if (falliti > 0) {
  console.error(
    '\n  Se il motivo è l’autenticazione, esegua prima:\n' +
      '      npx wrangler login\n',
  )
  process.exit(1)
}

console.log('\n  Verifica di quello che risulta ora sul Worker:\n      npx wrangler secret list')
console.log('  Poi ricarichi /admin: i Secret valgono dalla richiesta successiva.\n')
