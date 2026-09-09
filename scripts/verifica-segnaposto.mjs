#!/usr/bin/env node
/**
 * Verifica di go-live: cerca i segnaposto «TBD:…» rimasti nel sito.
 *
 * Esce con codice 1 se ne trova: così, se un giorno la pubblicazione passerà da una
 * pipeline automatica, il sito con dati mancanti non potrà andare online per distrazione.
 *
 * I documenti di progetto (docs/, README) sono esclusi: lì i segnaposto sono l'oggetto
 * del discorso, non un difetto.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const radice = fileURLToPath(new URL('..', import.meta.url))
const CARTELLE = ['app', 'components', 'content', 'lib']
const ESTENSIONI = /\.(ts|tsx|mdx|json|css)$/
const SEGNAPOSTO = /«TBD:[^»]*»/g

/**
 * Esclusioni.
 * — `app/showcase` è la pagina interna del design system, esclusa dai motori di
 *   ricerca: il segnaposto lì è un esempio del componente, non un dato mancante.
 * — I riferimenti scritti dentro un template literal (`${id}`) sono la definizione
 *   della funzione che genera i segnaposto, non un segnaposto. Vale lo stesso per una
 *   corrispondenza che contiene metacaratteri di espressione regolare: è la regola che
 *   li riconosce, non un dato mancante.
 */
const PERCORSI_ESCLUSI = ['app/showcase']
const daIgnorare = (testo) => testo.includes('${') || /[[\]^\\]/.test(testo)

async function* file(cartella) {
  let voci
  try {
    voci = await readdir(cartella, { withFileTypes: true })
  } catch {
    return
  }
  for (const voce of voci) {
    const percorso = join(cartella, voce.name)
    if (voce.isDirectory()) {
      if (voce.name === 'node_modules' || voce.name.startsWith('.')) continue
      yield* file(percorso)
    } else if (ESTENSIONI.test(voce.name)) {
      yield percorso
    }
  }
}

const trovati = []

for (const cartella of CARTELLE) {
  for await (const percorso of file(join(radice, cartella))) {
    const relativo = relative(radice, percorso).replace(/\\/g, '/')
    if (PERCORSI_ESCLUSI.some((escluso) => relativo.startsWith(escluso))) continue

    const testo = await readFile(percorso, 'utf8')
    testo.split('\n').forEach((riga, indice) => {
      for (const trovato of riga.match(SEGNAPOSTO) ?? []) {
        if (daIgnorare(trovato)) continue
        trovati.push({ percorso: relativo, riga: indice + 1, testo: trovato })
      }
    })
  }
}

if (trovati.length === 0) {
  console.log('✓ Nessun segnaposto rimasto. Il sito è pubblicabile per questo aspetto.')
  console.log('  Restano da spuntare le altre voci della checklist nel README.')
  process.exit(0)
}

console.error(`⛔ ${trovati.length} segnaposto ancora presenti: il sito NON va pubblicato.\n`)

const perIdentificativo = new Map()
for (const voce of trovati) {
  const id = voce.testo.slice(5, -1)
  if (!perIdentificativo.has(id)) perIdentificativo.set(id, [])
  perIdentificativo.get(id).push(voce)
}

for (const [id, voci] of [...perIdentificativo].sort()) {
  console.error(`  «TBD:${id}» — ${voci.length} occorrenz${voci.length === 1 ? 'a' : 'e'}`)
  for (const voce of voci) console.error(`      ${voce.percorso}:${voce.riga}`)
}

console.error('\n  Dettaglio di ogni dato mancante: docs/DATI-MANCANTI.md')
process.exit(1)
