import { readFile, writeFile } from 'node:fs/promises'
import { join, normalize, sep } from 'node:path'

/**
 * Lettura e scrittura dei file di contenuto.
 *
 * Due modalità, scelte da sole in base alle variabili d'ambiente:
 *
 * — GITHUB: la console scrive tramite l'API di GitHub e crea un commit. Cloudflare
 *   se ne accorge e ricompila. È il funzionamento in produzione: il sito resta
 *   interamente statico, e ogni modifica resta nella cronologia del repository —
 *   si vede chi ha cambiato cosa e si torna indietro con un `git revert`.
 *
 * — LOCALE: scrive sul disco. Serve in sviluppo, per provare la console senza
 *   toccare il repository remoto.
 *
 * Il ritardo della modalità GitHub (un minuto o due, il tempo della
 * ricompilazione) è il prezzo di non avere un archivio a runtime. In cambio non
 * c'è nulla da difendere in lettura: le pagine restano file statici.
 */

export type ModalitaArchivio = 'github' | 'locale'

export type ConfigurazioneGitHub = {
  token: string
  proprietario: string
  repository: string
  ramo: string
}

export function configurazioneGitHub(): ConfigurazioneGitHub | null {
  const token = process.env.GITHUB_TOKEN?.trim()
  const repo = process.env.GITHUB_REPO?.trim() // formato «proprietario/repository»
  if (!token || !repo) return null

  const [proprietario, repository] = repo.split('/')
  if (!proprietario || !repository) return null

  return {
    token,
    proprietario,
    repository,
    ramo: process.env.GITHUB_BRANCH?.trim() || 'main',
  }
}

export function modalitaArchivio(): ModalitaArchivio {
  return configurazioneGitHub() ? 'github' : 'locale'
}

/**
 * I percorsi arrivano dal browser: vanno trattati come non fidati.
 * Sono ammessi solo percorsi relativi dentro `content/`, senza risalite. Senza
 * questo controllo, un `../../` permetterebbe di leggere o riscrivere qualunque
 * file del repository — comprese le impostazioni.
 */
export function percorsoAmmesso(percorso: string): boolean {
  if (percorso.includes('\0') || percorso.includes('..')) return false
  if (!percorso.startsWith('content/')) return false
  return /^[A-Za-z0-9/_.-]+$/.test(percorso) && !percorso.endsWith('/')
}

const codificatore = new TextEncoder()
const decodificatore = new TextDecoder()

/** base64 che regge gli accenti: `btoa` da solo lavora sui byte, non sull'UTF-8. */
function inBase64(testo: string): string {
  const byte = codificatore.encode(testo)
  let binario = ''
  for (const b of byte) binario += String.fromCharCode(b)
  return btoa(binario)
}

function daBase64(base64: string): string {
  const binario = atob(base64.replace(/\s/g, ''))
  const byte = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) byte[i] = binario.charCodeAt(i)
  return decodificatore.decode(byte)
}

export type Documento = {
  contenuto: string
  /** Identificativo della versione letta. Serve a evitare sovrascritture cieche. */
  versione: string | null
}

async function chiamaGitHub(
  cfg: ConfigurazioneGitHub,
  percorso: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `https://api.github.com/repos/${cfg.proprietario}/${cfg.repository}/contents/${percorso}`
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'studio-marinucci-console',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
}

export async function leggiDocumento(percorso: string): Promise<Documento> {
  if (!percorsoAmmesso(percorso)) throw new Error(`Percorso non ammesso: ${percorso}`)

  const cfg = configurazioneGitHub()
  if (cfg) {
    const risposta = await chiamaGitHub(cfg, `${percorso}?ref=${encodeURIComponent(cfg.ramo)}`)
    if (!risposta.ok) {
      throw new Error(`Lettura da GitHub non riuscita (${risposta.status}) per ${percorso}`)
    }
    const dato = (await risposta.json()) as { content?: string; sha?: string }
    if (typeof dato.content !== 'string') throw new Error(`${percorso} non è un file.`)
    return { contenuto: daBase64(dato.content), versione: dato.sha ?? null }
  }

  const assoluto = join(process.cwd(), normalize(percorso))
  if (!assoluto.startsWith(join(process.cwd(), 'content') + sep)) {
    throw new Error(`Percorso fuori da content/: ${percorso}`)
  }
  return { contenuto: await readFile(assoluto, 'utf8'), versione: null }
}

export async function scriviDocumento(
  percorso: string,
  contenuto: string,
  messaggio: string,
  versioneAttesa: string | null,
): Promise<{ modalita: ModalitaArchivio; versione: string | null }> {
  if (!percorsoAmmesso(percorso)) throw new Error(`Percorso non ammesso: ${percorso}`)

  const cfg = configurazioneGitHub()
  if (cfg) {
    // `sha` è la versione da cui si parte: se nel frattempo qualcun altro ha
    // modificato il file, GitHub rifiuta con 409 invece di sovrascriverlo.
    const risposta = await chiamaGitHub(cfg, percorso, {
      method: 'PUT',
      body: JSON.stringify({
        message: messaggio,
        content: inBase64(contenuto),
        branch: cfg.ramo,
        ...(versioneAttesa ? { sha: versioneAttesa } : {}),
      }),
    })

    if (risposta.status === 409 || risposta.status === 422) {
      throw new Error(
        'Il file è stato modificato da qualcun altro dopo che questa pagina è stata aperta. ' +
          'Ricarichi la console e ripeta la modifica, così non si sovrascrive il lavoro altrui.',
      )
    }
    if (!risposta.ok) {
      throw new Error(`Scrittura su GitHub non riuscita (${risposta.status}).`)
    }

    const dato = (await risposta.json()) as { content?: { sha?: string } }
    return { modalita: 'github', versione: dato.content?.sha ?? null }
  }

  const assoluto = join(process.cwd(), normalize(percorso))
  if (!assoluto.startsWith(join(process.cwd(), 'content') + sep)) {
    throw new Error(`Percorso fuori da content/: ${percorso}`)
  }
  await writeFile(assoluto, contenuto, 'utf8')
  return { modalita: 'locale', versione: null }
}
