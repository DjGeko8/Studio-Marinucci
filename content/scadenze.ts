import dati from './dati/scadenze.json'

/**
 * SCADENZARIO FISCALE
 *
 * I dati stanno in `dati/scadenze.json`, che è modificabile dalla console in
 * /admin oppure a mano. Qui restano soltanto i tipi, la validazione e le funzioni.
 *
 * ⚠️ Da rivedere e confermare ogni anno dal professionista. Le date riportate sono
 * quelle ordinarie: possono essere differite da provvedimenti successivi, e alcune
 * slittano al primo giorno lavorativo utile quando cadono di sabato o in festivo.
 *
 * Nel testo delle scadenze va SOLO l'informazione, mai una valutazione o un
 * consiglio: lo scadenzario è informazione, non consulenza.
 */

export const DESTINATARI = {
  impresa: 'Imprese',
  professionista: 'Professionisti e autonomi',
  forfettario: 'Forfettari',
  societa: 'Società di capitali',
  privato: 'Privati',
  sostituto: "Sostituti d'imposta",
} as const

export type Destinatario = keyof typeof DESTINATARI

export type Scadenza = {
  /** AAAA-MM-GG */
  data: string
  titolo: string
  descrizione: string
  destinatari: Destinatario[]
  /** Slug di un'area in content/servizi.ts, se pertinente. */
  servizio?: string
}

/**
 * Validazione all'avvio.
 *
 * Il file JSON può essere scritto dalla console, quindi da un modulo web e non
 * più solo da chi conosce il codice. Una voce malformata deve far fallire la
 * compilazione con un messaggio chiaro, non arrivare a schermo come pagina rotta:
 * la build è il cancello, ed è meglio che si chiuda rumorosamente.
 */
function validaVoce(voce: unknown, indice: number): Scadenza {
  const dove = `dati/scadenze.json, voce ${indice + 1}`
  if (typeof voce !== 'object' || voce === null) {
    throw new Error(`${dove}: non è un oggetto.`)
  }
  const v = voce as Record<string, unknown>

  if (typeof v.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.data)) {
    throw new Error(`${dove}: "data" deve essere nel formato AAAA-MM-GG.`)
  }
  if (typeof v.titolo !== 'string' || v.titolo.trim() === '') {
    throw new Error(`${dove}: "titolo" mancante.`)
  }
  if (typeof v.descrizione !== 'string' || v.descrizione.trim() === '') {
    throw new Error(`${dove}: "descrizione" mancante.`)
  }
  if (!Array.isArray(v.destinatari) || v.destinatari.length === 0) {
    throw new Error(`${dove}: "destinatari" deve elencare almeno un tipo di contribuente.`)
  }
  for (const d of v.destinatari) {
    if (typeof d !== 'string' || !(d in DESTINATARI)) {
      throw new Error(
        `${dove}: destinatario "${String(d)}" non valido. ` +
          `Ammessi: ${Object.keys(DESTINATARI).join(', ')}.`,
      )
    }
  }
  if (v.servizio !== undefined && typeof v.servizio !== 'string') {
    throw new Error(`${dove}: "servizio" deve essere lo slug di un'area di attività.`)
  }

  return {
    data: v.data,
    titolo: v.titolo,
    descrizione: v.descrizione,
    destinatari: v.destinatari as Destinatario[],
    ...(typeof v.servizio === 'string' ? { servizio: v.servizio } : {}),
  }
}

export const annoScadenzario: number = dati.anno

export const scadenze: Scadenza[] = dati.voci.map(validaVoce)

const MESI = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
] as const

/** Formatta una data ISO in «16 dicembre 2026» senza dipendere dal fuso del browser. */
export function formattaData(iso: string, conAnno = true): string {
  const [anno, mese, giorno] = iso.split('-')
  const nomeMese = MESI[Number(mese) - 1] ?? ''
  const g = Number(giorno)
  return conAnno ? `${g} ${nomeMese} ${anno}` : `${g} ${nomeMese}`
}

export function scadenzeOrdinate(): Scadenza[] {
  return [...scadenze].sort((a, b) => a.data.localeCompare(b.data))
}

/**
 * Le prossime scadenze a partire da una data.
 * `oggi` è passato esplicitamente dal chiamante perché il sito è statico: la data
 * viene fissata al momento della build, non letta dal browser di chi legge.
 */
export function prossimeScadenze(oggi: string, quante = 3): Scadenza[] {
  const future = scadenzeOrdinate().filter((s) => s.data >= oggi)
  // A fine anno lo scadenzario dell'anno corrente si esaurisce: si mostrano le ultime
  // anziché una sezione vuota, finché non viene caricato l'anno successivo.
  return (future.length > 0 ? future : scadenzeOrdinate().slice(-quante)).slice(0, quante)
}
