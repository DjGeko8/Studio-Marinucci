#!/usr/bin/env node
/**
 * Verifica di go-live: cerca fotografie provvisorie ancora in uso.
 *
 * Compagno di `verifica-segnaposto.mjs`. Quello controlla i dati mancanti, questo
 * le immagini di prova — che sono il tipo di provvisorio che più facilmente
 * sopravvive fino alla pubblicazione, perché a schermo «sembra finito».
 *
 * Esce con codice 1 se ne trova, così il controllo può diventare un cancello
 * automatico se un domani la pubblicazione passerà da una pipeline.
 */

import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'

const radice = fileURLToPath(new URL('..', import.meta.url))
const REGISTRO = join(radice, 'content', 'immagini.ts')
const CARTELLA_IMMAGINI = join(radice, 'public', 'immagini')
const MANIFESTO = join(radice, 'content', 'media-manifest.json')

let problemi = 0

// ── 1. Voci marcate come provvisorie nel registro ───────────────────────────
let registro = ''
try {
  registro = await readFile(REGISTRO, 'utf8')
} catch {
  console.error('⛔ content/immagini.ts non trovato.')
  process.exit(1)
}

// Ogni voce del registro è un blocco `'slot': { … }`: si isolano e si guarda
// quali dichiarano `provvisoria: true`.
const blocchi = [...registro.matchAll(/'([a-z-]+)':\s*\{([\s\S]*?)\n {2}\}/g)]
const provvisorie = blocchi
  .filter(([, , corpo]) => /provvisoria:\s*true/.test(corpo))
  .map(([, slot, corpo]) => {
    const credito = corpo.match(/credito:\s*'([^']*)'/)
    return { slot, credito: credito?.[1] ?? '' }
  })

if (provvisorie.length > 0) {
  problemi += provvisorie.length
  console.error(
    `⛔ ${provvisorie.length} fotografi${provvisorie.length === 1 ? 'a provvisoria' : 'e provvisorie'} in uso: il sito NON va pubblicato.\n`,
  )
  for (const { slot, credito } of provvisorie) {
    console.error(`  ${slot}`)
    if (credito) console.error(`      ${credito}`)
  }
  console.error(
    '\n  Ogni provvisoria porta impressa la fascia «PROVVISORIA — NON PUBBLICABILE».',
  )
  console.error('  Per sostituirla con quella reale:')
  console.error('      python scripts/prepara-immagine.py <file> <slot> --definitiva')
  console.error('  poi si toglie `provvisoria: true` in content/immagini.ts.\n')
}

// ── 2. File marchiati rimasti in public/ ────────────────────────────────────
let file = []
try {
  file = await readdir(CARTELLA_IMMAGINI)
} catch {
  /* nessuna cartella immagini: va bene, il sito usa i segnaposto grafici */
}

const marchiati = file.filter((nome) => nome.includes('-PROVVISORIA'))
if (marchiati.length > 0) {
  console.error(
    `⚠ ${marchiati.length} file marchiati in ${relative(radice, CARTELLA_IMMAGINI).replace(/\\/g, '/')}:`,
  )
  for (const nome of marchiati) console.error(`      ${nome}`)
  console.error('  Vanno cancellati quando arrivano le fotografie definitive.\n')
}

// ── 3. Spazi ancora scoperti (informativo, non bloccante) ───────────────────
try {
  const manifesto = JSON.parse(await readFile(MANIFESTO, 'utf8'))
  const scoperti = (manifesto.slot ?? []).filter(
    (voce) => voce.stato === 'da produrre' || voce.stato === 'facoltativo',
  )
  if (scoperti.length > 0) {
    console.log(`ℹ ${scoperti.length} spazi fotografici ancora senza immagine:`)
    for (const voce of scoperti) {
      console.log(`      ${voce.id.padEnd(24)} ${voce.pagina.padEnd(14)} ${voce.stato}`)
    }
    console.log('  Mostrano il segnaposto grafico: non è un errore, è lavoro in attesa.\n')
  }
} catch {
  /* manifesto assente o malformato: non blocca */
}

if (problemi === 0) {
  console.log('✓ Nessuna fotografia provvisoria in uso.')
  process.exit(0)
}

console.error('  Dettaglio degli spazi fotografici: content/media-manifest.json')
process.exit(1)
