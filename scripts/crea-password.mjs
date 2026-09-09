#!/usr/bin/env node
/**
 * Genera i valori da mettere nelle variabili d'ambiente della console.
 *
 *     npm run admin:password              chiede email e password
 *     npm run admin:password -- --temporanee   ne inventa di provvisorie
 *
 * Stampa l'hash della password e un segreto di sessione, e li salva in
 * `.credenziali-console.txt` (escluso dal repository) perché
 * `npm run admin:imposta` possa caricarli su Cloudflare senza farli passare dagli
 * appunti — dove un'impronta di 104 caratteri si tronca con facilità.
 *
 * La password in chiaro non viene conservata da nessun'altra parte: da qui esce
 * solo l'impronta, dalla quale non si torna indietro.
 */

import { createInterface } from 'node:readline/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { stdin, stdout } from 'node:process'

// Deve corrispondere a ITERAZIONI_PREDEFINITE in lib/admin/auth.ts.
// Ottomila e' il massimo che sta nei 10 ms di CPU di un Worker sul piano gratuito;
// la robustezza viene dalla lunghezza della password, non dalle iterazioni.
const ITERAZIONI = 8_000

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

/**
 * Con `--temporanee` non chiede nulla e inventa una password.
 *
 * Serve a far partire la console subito, con credenziali da sostituire appena il
 * professionista sceglie le sue. Ventiquattro caratteri casuali sono comunque più
 * solidi di quasi tutte le password scelte a mano — l'unica ragione per cui vanno
 * cambiate è che queste sono passate da una conversazione.
 */
const temporanee = process.argv.includes('--temporanee')

let email
let password

if (temporanee) {
  // Alfabeto senza i caratteri che si confondono leggendo: l/I/1, O/0.
  const alfabeto = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  password = [...crypto.getRandomValues(new Uint8Array(24))]
    .map((n) => alfabeto[n % alfabeto.length])
    .join('')
  const forse = process.argv[process.argv.indexOf('--temporanee') + 1]
  email = forse && forse.includes('@') ? forse : 'console@studio-marinucci.local'
  console.log('\nCredenziali TEMPORANEE generate\n')
} else {
  const rl = createInterface({ input: stdin, output: stdout })
  console.log('\nGenerazione delle credenziali della console\n')
  email = (await rl.question('Email di accesso: ')).trim()
  password = await rl.question('Password (verrà mostrata a schermo): ')
  rl.close()

  if (!email.includes('@')) {
    console.error('\n✗ Email non valida.')
    process.exit(1)
  }
  if (password.length < 16) {
    console.error(
      '\n✗ Password troppo corta: almeno 16 caratteri.' +
        '\n  Le iterazioni di PBKDF2 sono per forza poche (10 ms di CPU sui Worker del' +
        '\n  piano gratuito), quindi la robustezza deve venire dalla lunghezza.' +
        '\n  Una frase lunga inventata sul momento vale più di una corta e complicata;' +
        '\n  in alternativa `--temporanee` ne genera una casuale di 24 caratteri.',
    )
    process.exit(1)
  }
}

const hash = await hashPassword(password)
const segreto = esadecimale(crypto.getRandomValues(new Uint8Array(32)).buffer)

const linea = '─'.repeat(72)
console.log(linea)
console.log('Variabili da impostare come SECRET nel Worker su Cloudflare:\n')
console.log(`ADMIN_EMAIL=${email}`)
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
console.log(`ADMIN_SESSION_SECRET=${segreto}`)
console.log('\nServe inoltre un token GitHub con permesso di scrittura sul repository,')
console.log('ma non blocca l’accesso: senza, si entra e si vede tutto in sola lettura.')
console.log('GITHUB_TOKEN=...')
console.log('GITHUB_REPO=DjGeko8/Studio-Marinucci')
console.log(linea)

const intestazione = temporanee
  ? '# Credenziali TEMPORANEE della console — da sostituire.\n'
  : '# Credenziali della console.\n'

const archivio = new URL('../.credenziali-console.txt', import.meta.url)

/**
 * Il file precedente si mette da parte, non si sovrascrive.
 *
 * Quel file è l'unico posto in cui resta scritta la password in chiaro: dell'impronta
 * non si torna indietro. Chi rigenera le credenziali per rimetterle a posto in locale
 * cancellerebbe, senza accorgersene, l'unica copia di quella con cui il sito
 * pubblicato funziona ancora — perché i Secret su Cloudflare restano quelli di prima
 * finché non si esegue `npm run admin:imposta`.
 */
try {
  const precedente = await readFile(archivio, 'utf8')
  const quando = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const copia = new URL(`../.credenziali-console.${quando}.txt`, import.meta.url)
  await writeFile(copia, precedente, 'utf8')
  console.log(`\nLe credenziali precedenti sono state messe da parte in ${basename(copia.pathname)}`)
  console.log('Restano quelle valide sul sito pubblicato finché non esegui admin:imposta.')
} catch (errore) {
  if (errore?.code !== 'ENOENT') throw errore
}

await writeFile(
  archivio,
  intestazione +
    '# NON versionare, NON condividere.\n' +
    `# Password: ${password}\n\n` +
    `ADMIN_EMAIL=${email}\n` +
    `ADMIN_PASSWORD_HASH=${hash}\n` +
    `ADMIN_SESSION_SECRET=${segreto}\n`,
  'utf8',
)

console.log('\nSalvati anche in .credenziali-console.txt, escluso dal repository.')
console.log('Per caricarli su Cloudflare:')
console.log('    npx wrangler login')
console.log('    npm run admin:imposta')

if (temporanee) {
  console.log('\n┌─ PASSWORD TEMPORANEA ' + '─'.repeat(48))
  console.log('│  ' + password)
  console.log('└' + '─'.repeat(69))
  console.log('\nAnnotala: da qui in poi resta solo la sua impronta.')
}

console.log(
  '\nSe un giorno cambia la password si rigenera solo ADMIN_PASSWORD_HASH: le sessioni\n' +
    'aperte restano valide fino a scadenza, e per chiuderle subito si cambia anche\n' +
    'ADMIN_SESSION_SECRET.\n',
)
