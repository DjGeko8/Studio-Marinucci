#!/usr/bin/env node
/**
 * Ogni fotografia registrata esiste davvero?
 *
 * Gira PRIMA di ogni compilazione (`prebuild`) e la fa fallire se una voce di
 * `content/immagini.ts` punta a un file che non c'è.
 *
 * PERCHÉ QUI E NON NEL COMPONENTE
 *
 * Il componente `Foto` controllava da sé l'esistenza del file e, non trovandolo,
 * ripiegava sul segnaposto grafico. Sembrava prudente. In realtà, dopo il passaggio
 * a `output: 'standalone'` per OpenNext, quel controllo rispondeva «non c'è» sulla
 * macchina di compilazione di Cloudflare pur essendo i file al loro posto: il sito
 * è andato online con i rettangoli grigi al posto delle fotografie, senza che nulla
 * segnalasse un errore.
 *
 * Un controllo che si accorge del problema e lo nasconde è peggio di uno che si
 * ferma. Qui, se un file manca, la compilazione non parte proprio e dice quale.
 */

import { access, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const radice = fileURLToPath(new URL('..', import.meta.url))
const REGISTRO = join(radice, 'content', 'immagini.ts')

let sorgente
try {
  sorgente = await readFile(REGISTRO, 'utf8')
} catch {
  console.error('⛔ content/immagini.ts non trovato.')
  process.exit(1)
}

// Le voci sono scritte come  src: '/immagini/nome.jpg'  e  src2x: '/immagini/nome@2x.jpg'
const riferimenti = [...sorgente.matchAll(/\bsrc2?x?:\s*'(\/[^']+)'/g)].map((m) => m[1])

if (riferimenti.length === 0) {
  console.log('✓ Nessuna fotografia registrata: niente da verificare.')
  process.exit(0)
}

const mancanti = []
for (const riferimento of riferimenti) {
  const percorso = join(radice, 'public', riferimento.replace(/^\//, ''))
  try {
    await access(percorso)
  } catch {
    mancanti.push(riferimento)
  }
}

if (mancanti.length === 0) {
  console.log(
    `✓ Tutte le ${riferimenti.length} fotografie registrate sono al loro posto.`,
  )
  process.exit(0)
}

console.error('⛔ COMPILAZIONE INTERROTTA: mancano file registrati in content/immagini.ts\n')
for (const m of mancanti) console.error(`  manca  public${m}`)
console.error(`
  Le pagine punterebbero a immagini inesistenti.

  Come procedere, a seconda del caso:
    — il file esiste ma non è versionato → controlli il .gitignore
    — la fotografia non c'è ancora       → tolga la voce da content/immagini.ts,
                                           e lo spazio mostrerà il segnaposto grafico
    — va rigenerata                      → npm run prepara-provvisorie
`)
process.exit(1)
