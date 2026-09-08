import dati from '../dati/articoli.json'

/**
 * APPROFONDIMENTI
 *
 * I metadati stanno in `dati/articoli.json`; il testo di ciascun articolo in
 * `news/<slug>.mdx`. La console in /admin scrive entrambi in un solo commit, così
 * non esiste un istante in cui un articolo è registrato ma senza testo — che
 * farebbe fallire la compilazione.
 *
 * ⚠️ Ogni articolo firmato dallo studio impegna la responsabilità professionale di
 * chi lo firma: va validato dal professionista prima della pubblicazione.
 *
 * La nota informativa in calce è aggiunta dal modello di pagina: non va ripetuta
 * nel testo.
 */

export type Articolo = {
  slug: string
  titolo: string
  /** AAAA-MM-GG */
  data: string
  /** Compare nell'indice e nella meta description. Due o tre righe. */
  sommario: string
  /** Slug di un'area in content/servizi.ts, se pertinente. */
  servizio?: string
  /** Minuti di lettura, arrotondati. */
  lettura: number
}

/**
 * Validazione all'avvio: il JSON può essere scritto dalla console, quindi da un
 * modulo web. Una voce malformata deve fermare la compilazione con un messaggio
 * chiaro, non arrivare a schermo come pagina rotta.
 */
function valida(voce: unknown, indice: number): Articolo {
  const dove = `dati/articoli.json, articolo ${indice + 1}`
  if (typeof voce !== 'object' || voce === null) throw new Error(`${dove}: non è un oggetto.`)
  const v = voce as Record<string, unknown>

  if (typeof v.slug !== 'string' || !/^[a-z0-9-]+$/.test(v.slug)) {
    throw new Error(
      `${dove}: "slug" deve contenere solo lettere minuscole, numeri e trattini. ` +
        'È la parte finale dell’indirizzo della pagina.',
    )
  }
  if (typeof v.titolo !== 'string' || v.titolo.trim() === '') {
    throw new Error(`${dove}: manca il titolo.`)
  }
  if (typeof v.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.data)) {
    throw new Error(`${dove}: "data" deve essere nel formato AAAA-MM-GG.`)
  }
  if (typeof v.sommario !== 'string' || v.sommario.trim() === '') {
    throw new Error(`${dove}: manca il sommario.`)
  }
  const lettura = Number(v.lettura)
  if (!Number.isFinite(lettura) || lettura < 1 || lettura > 60) {
    throw new Error(`${dove}: "lettura" deve essere un numero di minuti fra 1 e 60.`)
  }
  if (v.servizio !== undefined && typeof v.servizio !== 'string') {
    throw new Error(`${dove}: "servizio" deve essere lo slug di un'area di attività.`)
  }

  return {
    slug: v.slug,
    titolo: v.titolo,
    data: v.data,
    sommario: v.sommario,
    lettura: Math.round(lettura),
    ...(typeof v.servizio === 'string' && v.servizio ? { servizio: v.servizio } : {}),
  }
}

export const articoli: Articolo[] = dati.articoli.map(valida)

export function articoliOrdinati(): Articolo[] {
  return [...articoli].sort((a, b) => b.data.localeCompare(a.data))
}

export function trovaArticolo(slug: string): Articolo | undefined {
  return articoli.find((a) => a.slug === slug)
}

/**
 * La sezione News compare nel sito solo con almeno tre articoli.
 * Una sezione con un solo post di dodici mesi fa comunica abbandono, ed è peggio
 * dell'assenza: vedi docs/FASE-2-ARCHITETTURA.md §7.
 */
export const SOGLIA_PUBBLICAZIONE = 3
export const newsAttiva = articoli.length >= SOGLIA_PUBBLICAZIONE
