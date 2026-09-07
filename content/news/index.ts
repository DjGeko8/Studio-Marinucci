/**
 * REGISTRO DEGLI APPROFONDIMENTI
 *
 * ⚠️ Tutti i testi vanno validati dal professionista prima della pubblicazione:
 * un articolo firmato dallo studio impegna la sua responsabilità professionale.
 *
 * COME AGGIUNGERE UN ARTICOLO (istruzioni complete nel README):
 *   1. creare `content/news/<slug>.mdx` con il testo;
 *   2. aggiungere qui una voce con lo stesso slug;
 *   3. l'ordinamento per data è automatico.
 *
 * La nota informativa in calce a ogni articolo è aggiunta dal modello di pagina:
 * non va ripetuta nel testo.
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

export const articoli: Articolo[] = [
  {
    slug: 'regime-forfettario-oltre-la-soglia',
    titolo: 'Regime forfettario: cosa succede davvero quando si supera la soglia',
    data: '2026-07-15',
    sommario:
      "Superare il limite di ricavi non produce lo stesso effetto in ogni caso: cambia tutto a seconda di quanto si supera e di quando ce se ne accorge. Una ricognizione delle conseguenze pratiche.",
    servizio: 'professionisti-e-forfettari',
    lettura: 6,
  },
  {
    slug: 'dichiarazione-di-successione',
    titolo: 'Dichiarazione di successione: tempi, documenti, errori frequenti',
    data: '2026-05-20',
    sommario:
      'Dodici mesi sembrano molti, ma la raccolta dei documenti ne consuma buona parte. Cosa serve, in quale ordine, e i punti su cui si perde più tempo.',
    servizio: 'persone-fisiche',
    lettura: 7,
  },
  {
    slug: 'adeguati-assetti-piccola-impresa',
    titolo: 'Adeguati assetti: cosa cambia concretamente per una piccola impresa',
    data: '2026-03-10',
    sommario:
      "L'obbligo esiste anche per le realtà minori, ma non richiede la struttura di una grande azienda. Cosa significa in pratica, con un metro proporzionato.",
    servizio: 'crisi-di-impresa',
    lettura: 6,
  },
]

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
