import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, sep } from 'node:path'

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

/**
 * Scrive più file in UN SOLO commit, tramite l'API Git di GitHub.
 *
 * Serve perché alcune cose sono fatte di più file: un articolo è i suoi metadati
 * più il testo. Scrivendoli con due chiamate separate si otterrebbero due commit,
 * due ricompilazioni e — peggio — un istante in cui il sito ha i metadati di un
 * articolo il cui testo non esiste ancora, e la compilazione fallisce.
 *
 * Il procedimento è quello di git: si creano gli oggetti (blob), si costruisce
 * l'albero a partire da quello attuale, si crea il commit, si sposta il ramo.
 */
export async function scriviDocumenti(
  /** `contenuto: null` significa «elimina questo file». */
  file: { percorso: string; contenuto: string | null }[],
  messaggio: string,
): Promise<{ modalita: ModalitaArchivio }> {
  for (const f of file) {
    if (!percorsoAmmesso(f.percorso)) throw new Error(`Percorso non ammesso: ${f.percorso}`)
  }

  const cfg = configurazioneGitHub()
  if (!cfg) {
    // In locale non c'è nulla da raggruppare: si scrive e basta.
    for (const f of file) {
      const assoluto = join(process.cwd(), normalize(f.percorso))
      if (!assoluto.startsWith(join(process.cwd(), 'content') + sep)) {
        throw new Error(`Percorso fuori da content/: ${f.percorso}`)
      }
      if (f.contenuto === null) {
        await rm(assoluto, { force: true })
      } else {
        await mkdir(dirname(assoluto), { recursive: true })
        await writeFile(assoluto, f.contenuto, 'utf8')
      }
    }
    return { modalita: 'locale' }
  }

  const base = `https://api.github.com/repos/${cfg.proprietario}/${cfg.repository}`
  const intestazioni = {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'studio-marinucci-console',
    'Content-Type': 'application/json',
  }

  async function chiedi(percorso: string, init?: RequestInit): Promise<Record<string, unknown>> {
    const risposta = await fetch(`${base}${percorso}`, { ...init, headers: intestazioni })
    if (!risposta.ok) {
      throw new Error(`GitHub ha risposto ${risposta.status} su ${percorso}`)
    }
    return (await risposta.json()) as Record<string, unknown>
  }

  // 1. dov'è ora il ramo
  const riferimento = await chiedi(`/git/ref/heads/${encodeURIComponent(cfg.ramo)}`)
  const commitAttuale = (riferimento.object as { sha: string }).sha
  const commit = await chiedi(`/git/commits/${commitAttuale}`)
  const alberoAttuale = (commit.tree as { sha: string }).sha

  // 2. un oggetto per ogni file
  const voci = await Promise.all(
    file.map(async (f) => {
      // In un albero git, `sha: null` su un percorso significa rimuoverlo.
      if (f.contenuto === null) {
        return { path: f.percorso, mode: '100644' as const, type: 'blob' as const, sha: null }
      }
      const blob = await chiedi('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: f.contenuto, encoding: 'utf-8' }),
      })
      return {
        path: f.percorso,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha as string,
      }
    }),
  )

  // 3. il nuovo albero, 4. il commit, 5. lo spostamento del ramo
  const albero = await chiedi('/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: alberoAttuale, tree: voci }),
  })
  const nuovoCommit = await chiedi('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message: messaggio, tree: albero.sha, parents: [commitAttuale] }),
  })
  await chiedi(`/git/refs/heads/${encodeURIComponent(cfg.ramo)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: nuovoCommit.sha }),
  })

  return { modalita: 'github' }
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
