/**
 * Protezione dei testi scritti in console prima di salvarli come MDX.
 *
 * IL PROBLEMA
 *
 * Gli articoli sono file `.mdx`, dove `{` apre un'espressione e `<` apre un
 * elemento: sono caratteri di codice, non di testo. Chi scrivesse in console
 * «un aumento < 5%» oppure «la formula {x}» produrrebbe un file che non compila,
 * e da quel momento il sito smetterebbe di aggiornarsi — con l'errore visibile
 * solo nei log di Cloudflare, lontanissimo da chi ha premuto «salva».
 *
 * LA SCELTA
 *
 * Si protegge invece di rifiutare. Rifiutare avrebbe significato spiegare a chi
 * scrive un testo professionale che certi caratteri sono vietati per ragioni
 * tecniche che non lo riguardano. Qui il carattere viene preceduto da una barra
 * rovesciata al salvataggio — che MDX interpreta come «questo è testo» — e la
 * barra viene tolta quando il testo torna nella console.
 *
 * Chi scrive non se ne accorge mai, ed è il punto.
 *
 * `>` non è toccato: in Markdown a inizio riga fa una citazione, ed è un uso
 * legittimo che non rompe nulla.
 */

const DA_PROTEGGERE = /(?<!\\)([{}<])/g

/** Da quello che si scrive in console a quello che si salva nel file. */
export function proteggiPerMdx(testo: string): string {
  return testo.replace(DA_PROTEGGERE, '\\$1')
}

/** Da quello che c'è nel file a quello che si mostra in console. */
export function ripristinaDaMdx(testo: string): string {
  return testo.replace(/\\([{}<])/g, '$1')
}
