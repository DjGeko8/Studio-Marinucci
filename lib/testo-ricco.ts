/**
 * TESTO RICCO — la lingua in cui sono scritti i testi modificabili dalla console.
 *
 * È volutamente minuscola: quattro cose e basta.
 *
 *   **grassetto**            enfasi
 *   [testo](/pagina)         collegamento interno
 *   [testo](https://…)       collegamento esterno
 *   {{campo}}                un dato dello studio, sostituito al momento
 *   un segnaposto TBD        dato ancora mancante, evidenziato in pagina
 *
 * Perché i `{{campo}}` esistono. Certi periodi contengono un dato obbligatorio:
 * «iscritto all'ordine al numero 81/A». Se quel numero venisse scritto a mano nel
 * testo, il giorno in cui cambia resterebbe indietro in silenzio, e nessuno se ne
 * accorgerebbe finché non lo verifica qualcuno che ha motivo di farlo. Con un campo
 * automatico il dato ha una sola sorgente — `lib/site.ts` — e il testo la cita.
 *
 * Il testo NON diventa mai HTML: viene trasformato in elementi React, quindi non c'è
 * modo di iniettare marcatura dalla console. È il motivo per cui questa lingua è così
 * piccola: ogni costrutto in più sarebbe una superficie in più da controllare.
 */

import { contatti, datiObbligatori, professionista, sede, site } from '@/lib/site'

/**
 * I campi automatici disponibili.
 *
 * L'etichetta è quella mostrata nella console: chi scrive non deve indovinare cosa
 * produca `{{numeroAlbo}}`, lo vede accanto al nome.
 */
export const CAMPI: Record<string, { etichetta: string; valore: string }> = {
  nomeStudio: { etichetta: 'Denominazione dello studio', valore: site.name },
  nome: { etichetta: 'Nome e cognome', valore: professionista.nome },
  nomeCompleto: { etichetta: 'Nome con titolo', valore: professionista.nomeCompleto },
  titolo: { etichetta: 'Titolo professionale', valore: professionista.titolo },
  ordine: { etichetta: 'Ordine di appartenenza', valore: professionista.ordine },
  ordineBreve: { etichetta: 'Ordine (forma breve)', valore: professionista.ordineBreve },
  numeroAlbo: { etichetta: 'Numero di iscrizione', valore: professionista.numeroIscrizione },
  annoIscrizione: {
    etichetta: 'Anno di iscrizione',
    valore: String(professionista.annoIscrizione),
  },
  dataIscrizione: {
    etichetta: "Data d'iscrizione all'albo",
    valore: new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(
      new Date(professionista.dataIscrizione + 'T12:00:00Z'),
    ),
  },
  numeroRevisori: {
    etichetta: 'N. Registro Revisori Legali',
    valore: professionista.numeroRevisori,
  },
  laurea: { etichetta: 'Titolo di studio', valore: professionista.laurea },
  cittaNascita: { etichetta: 'Città di nascita', valore: professionista.cittaNascita },
  annoNascita: { etichetta: 'Anno di nascita', valore: String(professionista.annoNascita) },
  sede: { etichetta: 'Indirizzo completo', valore: sede.completo },
  via: { etichetta: 'Via e numero civico', valore: sede.via },
  citta: { etichetta: 'Città dello studio', valore: sede.citta },
  telefono: { etichetta: 'Telefono', valore: contatti.telefono },
  email: { etichetta: 'Email', valore: contatti.email },
  pec: { etichetta: 'PEC', valore: contatti.pec },
  partitaIva: { etichetta: 'Partita IVA', valore: datiObbligatori.partitaIva },
}

export type Frammento =
  | { tipo: 'testo'; valore: string }
  | { tipo: 'forte'; parti: Frammento[] }
  | { tipo: 'campo'; nome: string; valore: string }
  | { tipo: 'link'; testo: string; href: string }
  | { tipo: 'tbd'; valore: string }

/**
 * Una regola nuova a ogni chiamata, non una condivisa.
 *
 * `analizza` richiama sé stessa per il contenuto del grassetto, e un'espressione
 * regolare globale si porta dietro la posizione raggiunta: la chiamata annidata la
 * riazzererebbe, facendo ripartire da capo quella esterna. Sarebbe un ciclo senza fine
 * su qualunque testo contenente `**grassetto**` — cioè su metà delle pagine legali.
 * Una funzione che restituisce il letterale ne crea una nuova ogni volta.
 */
const nuovaRegola = () =>
  /\{\{\s*([a-zA-Z]+)\s*\}\}|\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|(«TBD:[^»\n]*»)/g

/** Un indirizzo che possiamo mettere in un `href` senza pensarci due volte. */
export function hrefAmmesso(href: string): boolean {
  return (
    (href.startsWith('/') && !href.startsWith('//')) ||
    href.startsWith('https://') ||
    href.startsWith('http://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  )
}

export function analizza(testo: string, dentroForte = false): Frammento[] {
  const frammenti: Frammento[] = []
  const regola = nuovaRegola()
  let ultimo = 0

  let trovato: RegExpExecArray | null
  while ((trovato = regola.exec(testo)) !== null) {
    const [intero, campo, etichettaLink, href, forte, tbd] = trovato

    // Il grassetto dentro il grassetto non esiste: lasciarlo passare produrrebbe una
    // ricorsione senza fondo su un testo scritto male.
    if (forte !== undefined && dentroForte) continue

    if (trovato.index > ultimo) {
      frammenti.push({ tipo: 'testo', valore: testo.slice(ultimo, trovato.index) })
    }

    if (campo !== undefined) {
      const definizione = CAMPI[campo]
      // Un campo sconosciuto resta a schermo com'è stato scritto. La validazione lo
      // rifiuta prima del salvataggio, quindi qui non può arrivare da un testo
      // pubblicato: se arriva, è un file modificato a mano, e vederlo aiuta.
      frammenti.push(
        definizione
          ? { tipo: 'campo', nome: campo, valore: definizione.valore }
          : { tipo: 'testo', valore: intero },
      )
    } else if (etichettaLink !== undefined && href !== undefined) {
      frammenti.push(
        hrefAmmesso(href)
          ? { tipo: 'link', testo: etichettaLink, href }
          : { tipo: 'testo', valore: intero },
      )
    } else if (forte !== undefined) {
      frammenti.push({ tipo: 'forte', parti: analizza(forte, true) })
    } else if (tbd !== undefined) {
      frammenti.push({ tipo: 'tbd', valore: tbd })
    }

    ultimo = trovato.index + intero.length
  }

  if (ultimo < testo.length) frammenti.push({ tipo: 'testo', valore: testo.slice(ultimo) })
  return frammenti
}

/**
 * Controllo prima del salvataggio.
 *
 * Restituisce il primo problema trovato, spiegato a chi ha premuto «salva» e non a chi
 * ha scritto il programma: un campo inesistente e un indirizzo malformato sono errori
 * di battitura, e chi li commette deve poterli correggere senza sapere cos'è una regex.
 */
export function problemaNelTesto(testo: string): string | null {
  for (const trovato of testo.matchAll(/\{\{\s*([a-zA-Z]*)\s*\}\}/g)) {
    const nome = trovato[1] ?? ''
    if (!CAMPI[nome]) {
      return (
        `«${trovato[0]}» non è un campo automatico. ` +
        `Quelli disponibili sono: ${Object.keys(CAMPI).join(', ')}.`
      )
    }
  }

  for (const trovato of testo.matchAll(/\[([^\]\n]+)\]\(([^)\s]*)\)/g)) {
    const href = trovato[2] ?? ''
    if (!hrefAmmesso(href)) {
      return (
        `Il collegamento «${href}» non è valido. Un indirizzo di questo sito inizia ` +
        'con «/» (per esempio /privacy), uno esterno con «https://».'
      )
    }
  }

  return null
}

/** Il testo senza marcatura: serve per le descrizioni nei risultati di ricerca. */
export function soloTesto(testo: string): string {
  return analizza(testo)
    .map((f) => {
      switch (f.tipo) {
        case 'testo':
          return f.valore
        case 'forte':
          return f.parti.map((p) => (p.tipo === 'testo' ? p.valore : '')).join('')
        case 'campo':
          return f.valore
        case 'link':
          return f.testo
        case 'tbd':
          return f.valore
      }
    })
    .join('')
}
