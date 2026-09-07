/**
 * Gestione del consenso ai cookie.
 *
 * Il sito non usa cookie di profilazione né analitici di terze parti. L'unica
 * categoria che richiede consenso è quella dei contenuti esterni: oggi solo la
 * mappa OpenStreetMap, che stabilisce una connessione a un dominio di terzi.
 *
 * Finché il consenso non è dato, la mappa NON viene caricata: al suo posto compare
 * un segnaposto con l'indirizzo in chiaro e un collegamento esterno. Il sito resta
 * pienamente utilizzabile rifiutando tutto — che è il presupposto perché il
 * consenso sia libero.
 */

export type CategoriaConsenso = 'necessari' | 'contenutiEsterni'

export type Consenso = {
  necessari: true
  contenutiEsterni: boolean
  /** Data ISO della scelta: serve a dimostrare quando è stata espressa. */
  dataScelta: string
  versione: number
}

/** Alzare la versione invalida i consensi raccolti in precedenza. */
export const VERSIONE_CONSENSO = 1

const CHIAVE = 'sm-consenso-cookie'
export const EVENTO_CONSENSO = 'sm:consenso-aggiornato'

export function leggiConsenso(): Consenso | null {
  if (typeof window === 'undefined') return null
  try {
    const grezzo = window.localStorage.getItem(CHIAVE)
    if (!grezzo) return null
    const dato = JSON.parse(grezzo) as Partial<Consenso>
    if (dato.versione !== VERSIONE_CONSENSO) return null
    if (typeof dato.contenutiEsterni !== 'boolean') return null
    return {
      necessari: true,
      contenutiEsterni: dato.contenutiEsterni,
      dataScelta: typeof dato.dataScelta === 'string' ? dato.dataScelta : '',
      versione: VERSIONE_CONSENSO,
    }
  } catch {
    // localStorage non disponibile (modalità privata, storage pieno): si procede
    // come se il consenso non fosse mai stato dato, cioè rifiutando.
    return null
  }
}

export function salvaConsenso(contenutiEsterni: boolean): Consenso {
  const consenso: Consenso = {
    necessari: true,
    contenutiEsterni,
    dataScelta: new Date().toISOString(),
    versione: VERSIONE_CONSENSO,
  }
  try {
    window.localStorage.setItem(CHIAVE, JSON.stringify(consenso))
  } catch {
    /* se non si può salvare, la scelta vale per la sessione corrente */
  }
  window.dispatchEvent(new CustomEvent<Consenso>(EVENTO_CONSENSO, { detail: consenso }))
  return consenso
}

/** Revoca: riapre il banner e disattiva i contenuti esterni già caricati. */
export function revocaConsenso(): void {
  try {
    window.localStorage.removeItem(CHIAVE)
  } catch {
    /* niente da fare */
  }
  window.dispatchEvent(new CustomEvent(EVENTO_CONSENSO, { detail: null }))
}
