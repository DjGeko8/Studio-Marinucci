#!/usr/bin/env node
/**
 * Esegue un file TypeScript del progetto.
 *
 * Serve alle prove: `lib/` e `content/` usano l'alias `@/` e la sintassi di TypeScript,
 * che Node da solo non capisce. esbuild è già installato come dipendenza di Next, quindi
 * questo non aggiunge nulla al progetto: compila in memoria e passa il risultato a Node.
 *
 * Il file compilato finisce in `.prove/`, escluso dal versionamento.
 */

import { build } from 'esbuild'
import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const radice = fileURLToPath(new URL('..', import.meta.url))
const ingresso = process.argv[2]

if (!ingresso) {
  console.error('Uso: node scripts/esegui-ts.mjs <file.ts>')
  process.exit(2)
}

const cartella = resolve(radice, '.prove')
const uscita = resolve(cartella, basename(ingresso).replace(/\.ts$/, '.mjs'))

mkdirSync(cartella, { recursive: true })

await build({
  entryPoints: [resolve(radice, ingresso)],
  outfile: uscita,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  // Le dipendenze installate restano fuori dal fascio: qui si provano i moduli nostri.
  packages: 'external',
  loader: { '.json': 'json' },
  // Lo stesso alias del progetto, così i moduli si importano come nell'applicazione.
  alias: { '@': radice },
  logLevel: 'error',
})

const esito = spawnSync(process.execPath, [uscita], { stdio: 'inherit', cwd: radice })
rmSync(cartella, { recursive: true, force: true })
process.exit(esito.status ?? 1)
