import dati from './dati/servizi.json'

/**
 * AREE DI ATTIVITÀ
 *
 * I dati stanno in `dati/servizi.json`, modificabile dalla console in /admin.
 * Qui restano tipi, validazione e funzioni.
 *
 * ⚠️ ELENCO ANCORA DA VALIDARE («TBD:AREE»)
 *
 * Nessuna di queste voci è confermata dal professionista: sono le aree che ci si
 * attende tipicamente da un dottore commercialista abilitato alla revisione legale.
 *
 * PRIMA DELLA PUBBLICAZIONE:
 *   1. cancellare le aree non effettivamente prestate — cancellare, non attenuare:
 *      un'area elencata genera richieste, e un servizio non prestato è una
 *      dichiarazione ingannevole;
 *   2. riordinare mettendo per prime le due o tre aree più frequenti, perché
 *      l'ordine delle schede è posizionamento, non estetica;
 *   3. far validare ogni descrizione e ogni domanda frequente.
 *
 * Vincolo deontologico: si descrive l'attività prestata, non si promettono
 * risultati. Nessuna formula del tipo «riduciamo il carico fiscale».
 */

export type Servizio = {
  slug: string
  titolo: string
  /** Riga breve per le schede in home e nell'indice. */
  sintesi: string
  /** A chi si rivolge: compare sotto il titolo nella pagina di dettaglio. */
  destinatari: string
  /** Corpo della pagina: cosa comprende concretamente. */
  corpo: string[]
  faq: { domanda: string; risposta: string }[]
}

function testo(valore: unknown, dove: string, campo: string, minimo = 1): string {
  if (typeof valore !== 'string' || valore.trim().length < minimo) {
    throw new Error(`${dove}: "${campo}" mancante o troppo breve.`)
  }
  return valore
}

/**
 * Validazione all'avvio: il JSON può essere scritto dalla console, quindi da un
 * modulo web. Una voce malformata deve fermare la compilazione con un messaggio
 * chiaro, non arrivare a schermo come pagina rotta.
 */
function valida(voce: unknown, indice: number): Servizio {
  const dove = `dati/servizi.json, area ${indice + 1}`
  if (typeof voce !== 'object' || voce === null) throw new Error(`${dove}: non è un oggetto.`)
  const v = voce as Record<string, unknown>

  const slug = testo(v.slug, dove, 'slug')
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(
      `${dove}: "slug" può contenere solo lettere minuscole, numeri e trattini. ` +
        "È la parte finale dell'indirizzo della pagina.",
    )
  }

  if (!Array.isArray(v.corpo) || v.corpo.length === 0) {
    throw new Error(`${dove}: "corpo" deve contenere almeno un paragrafo.`)
  }
  const corpo = v.corpo.map((p, i) => testo(p, dove, `corpo, paragrafo ${i + 1}`, 20))

  const faqGrezze = Array.isArray(v.faq) ? v.faq : []
  const faq = faqGrezze.map((f, i) => {
    if (typeof f !== 'object' || f === null) {
      throw new Error(`${dove}: domanda frequente ${i + 1} non valida.`)
    }
    const d = f as Record<string, unknown>
    return {
      domanda: testo(d.domanda, dove, `domanda frequente ${i + 1}`, 5),
      risposta: testo(d.risposta, dove, `risposta ${i + 1}`, 20),
    }
  })

  return {
    slug,
    titolo: testo(v.titolo, dove, 'titolo', 3),
    sintesi: testo(v.sintesi, dove, 'sintesi', 20),
    destinatari: testo(v.destinatari, dove, 'destinatari', 5),
    corpo,
    faq,
  }
}

export const servizi: Servizio[] = dati.servizi.map(valida)

export function trovaServizio(slug: string): Servizio | undefined {
  return servizi.find((s) => s.slug === slug)
}

/** Le aree mostrate in home. Riordinare l'elenco cambia anche questa selezione. */
export const serviziInHome = servizi.slice(0, 6)
