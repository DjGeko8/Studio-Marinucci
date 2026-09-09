import dati from './dati/pagine.json'

/**
 * TESTI DELLE PAGINE
 *
 * I testi discorsivi di «Lo studio», «Informativa privacy», «Cookie policy» e «Note
 * legali» stanno in `dati/pagine.json`, modificabile dalla console in /admin.
 *
 * ⚠️ COSA NON C'È QUI, E PERCHÉ
 *
 * I dati obbligatori — partita IVA, PEC, numero di iscrizione all'albo, estremi della
 * polizza, titolare del trattamento — NON sono modificabili dalla console. Restano
 * generati da `lib/site.ts` e stampati dalle pagine in blocchi che la console non
 * tocca.
 *
 * Non è diffidenza verso chi scrive: è che quei dati la legge impone di pubblicarli
 * (art. 5 DPR 137/2012 per la polizza, artt. 13-14 GDPR per il titolare), e un testo
 * libero è il posto sbagliato per qualcosa che deve esserci per forza. In un campo di
 * testo una riga si cancella per distrazione e nessuno se ne accorge; da `lib/site.ts`
 * si cancella solo di proposito, e `npm run verifica-segnaposto` se ne accorge comunque.
 *
 * Nei testi si possono però *citare*, con i campi automatici `{{...}}` — vedi
 * `lib/testo-ricco.ts`. Il dato resta uno solo, e il testo lo segue.
 */

export type Blocco =
  | { tipo: 'paragrafo'; testo: string }
  | { tipo: 'elenco'; voci: string[] }

export type Sezione = {
  id: string
  occhiello?: string
  titolo?: string
  /** Solo per le sezioni dichiarate opzionali: falso la fa sparire dalla pagina. */
  visibile?: boolean
  blocchi: Blocco[]
}

export type PaginaTesti = {
  chiave: string
  occhiello: string
  titolo: string
  sommario: string
  metaDescrizione: string
  sezioni: Sezione[]
}

/**
 * Una sezione prevista dall'impaginazione.
 *
 * `nota` descrive ciò che la pagina stampa da sé accanto a quella sezione: la console
 * la mostra, così chi scrive sa che sotto al suo paragrafo comparirà un blocco di dati
 * che non vede nel modulo e non deve ripetere a mano.
 */
export type SezionePrevista = {
  id: string
  nome: string
  nota?: string
  opzionale?: boolean
}

export type StrutturaPagina = {
  nome: string
  percorso: string
  /** Descrive alla console di che pagina si tratta e cosa comporta modificarla. */
  avvertenza?: string
  sezioni: SezionePrevista[]
  /**
   * La pagina stampa le soprarighe sopra ai titoli di sezione?
   *
   * Serve alla console: mostrare un campo che la pagina non stampa fa scrivere testo
   * destinato a non comparire da nessuna parte.
   */
  usaOcchielli: boolean
  /**
   * Se vere, alla pagina si possono aggiungere sezioni nuove dalla console.
   *
   * È vero per le pagine legali, che nel tempo crescono — un fornitore da nominare,
   * un trattamento nuovo da descrivere — e falso per «Lo studio», che non è un
   * documento ma un'impaginazione: lì una sezione inventata non avrebbe un posto
   * dove andare.
   */
  sezioniLibere: boolean
}

export const STRUTTURA: Record<string, StrutturaPagina> = {
  studio: {
    nome: 'Lo studio',
    percorso: '/studio',
    avvertenza:
      'Questa pagina ha un\'impaginazione fissa: le sezioni sono quelle previste dal disegno e non se ne possono aggiungere. I dati d\'albo nella colonna a destra sono stampati dal sito e non compaiono qui.',
    usaOcchielli: true,
    sezioniLibere: false,
    sezioni: [
      {
        id: 'percorso',
        nome: 'Percorso professionale',
        nota: 'Accanto a questa sezione la pagina stampa da sé il ritratto e la tabella dei dati d\'albo.',
      },
      { id: 'metodo', nome: 'Come lavora lo studio' },
      {
        id: 'incarichi',
        nome: 'Incarichi ricoperti',
        opzionale: true,
        nota: 'Va compilata solo con incarichi reali e verificabili. Se non ce ne sono, si toglie la spunta e la sezione sparisce: un elenco gonfiato è esattamente il dettaglio che un collega verifica.',
      },
      {
        id: 'spazio',
        nome: 'Lo spazio dello studio',
        nota: 'Accanto compare la fotografia del tavolo riunioni.',
      },
      {
        id: 'chiusura',
        nome: 'Invito finale',
        nota: 'I due pulsanti sotto al testo sono fissi.',
      },
    ],
  },

  privacy: {
    nome: 'Informativa privacy',
    percorso: '/privacy',
    avvertenza:
      'Testo con contenuto obbligatorio per legge (artt. 13-14 GDPR). Si può aggiornare — anzi va aggiornato quando cambia un fornitore o un trattamento — ma togliere una sezione significa togliere un\'informazione dovuta. Nel dubbio, si aggiunge invece di sostituire.',
    usaOcchielli: false,
    sezioniLibere: true,
    sezioni: [
      {
        id: 'titolare',
        nome: 'Titolare del trattamento',
        nota: 'Sotto al paragrafo la pagina stampa da sé i recapiti del titolare e, se nominato, il responsabile della protezione dei dati.',
      },
      { id: 'dati-raccolti', nome: 'Quali dati vengono raccolti' },
      { id: 'finalita', nome: 'Finalità e base giuridica' },
      { id: 'conferimento', nome: 'Conferimento dei dati' },
      { id: 'conservazione', nome: 'Periodo di conservazione' },
      { id: 'destinatari', nome: 'Destinatari' },
      { id: 'trasferimenti', nome: 'Trasferimenti extra UE' },
      { id: 'diritti', nome: "Diritti dell'interessato" },
      { id: 'decisioni-automatizzate', nome: 'Processi decisionali automatizzati' },
      { id: 'sicurezza', nome: 'Sicurezza' },
      { id: 'aggiornamenti', nome: 'Aggiornamenti' },
    ],
  },

  'cookie-policy': {
    nome: 'Cookie policy',
    percorso: '/cookie-policy',
    avvertenza:
      'Deve descrivere quello che il sito fa davvero. Se un giorno si aggiunge uno strumento di statistica o un contenuto esterno, questa pagina va aggiornata prima, non dopo.',
    usaOcchielli: false,
    sezioniLibere: true,
    sezioni: [
      { id: 'memorizza', nome: 'Cosa memorizza il sito' },
      { id: 'non-fa', nome: 'Cosa il sito non fa' },
      { id: 'mappa', nome: 'Contenuti esterni: la mappa' },
      {
        id: 'gestire',
        nome: 'Gestire o revocare il consenso',
        nota: 'Sotto a questa sezione compare il pannello con cui si revoca il consenso.',
      },
      { id: 'browser', nome: 'Impostazioni del browser' },
      { id: 'rinvio-privacy', nome: 'Rinvio all\'informativa privacy' },
    ],
  },

  'note-legali': {
    nome: 'Note legali',
    percorso: '/note-legali',
    avvertenza:
      'Pagina di trasparenza professionale. I dati identificativi e gli estremi della polizza (art. 5 DPR 137/2012) sono stampati dal sito e non si modificano da qui: stanno in lib/site.ts.',
    usaOcchielli: false,
    sezioniLibere: true,
    sezioni: [
      {
        id: 'esercente',
        nome: 'Esercente la professione',
        nota: 'Sotto compare la tabella con nome, titolo, ordine, numero di iscrizione, domicilio professionale, partita IVA e recapiti.',
      },
      {
        id: 'assicurazione',
        nome: 'Assicurazione responsabilità civile',
        nota: 'Sotto compare la tabella con compagnia, numero di polizza e massimale.',
      },
      { id: 'norme', nome: 'Norme professionali di riferimento' },
      { id: 'natura', nome: 'Natura delle informazioni pubblicate' },
      { id: 'comunicazione', nome: 'Comunicazione informativa' },
      { id: 'proprieta', nome: 'Proprietà dei contenuti' },
      { id: 'collegamenti', nome: 'Collegamenti a siti esterni' },
      { id: 'rinvio-privacy', nome: 'Trattamento dei dati personali' },
      {
        id: 'titolare-sito',
        nome: 'Titolare del sito',
        nota: 'Sotto al titolo la pagina stampa da sé denominazione, nome e sede.',
      },
    ],
  },
}

function testo(valore: unknown, dove: string, campo: string, minimo = 1): string {
  if (typeof valore !== 'string' || valore.trim().length < minimo) {
    throw new Error(`${dove}: "${campo}" mancante o troppo breve.`)
  }
  return valore
}

function validaBlocco(grezzo: unknown, dove: string, indice: number): Blocco {
  const dovePreciso = `${dove}, blocco ${indice + 1}`
  if (typeof grezzo !== 'object' || grezzo === null) {
    throw new Error(`${dovePreciso}: non è un oggetto.`)
  }
  const b = grezzo as Record<string, unknown>

  if (b.tipo === 'elenco') {
    if (!Array.isArray(b.voci) || b.voci.length === 0) {
      throw new Error(`${dovePreciso}: un elenco senza voci.`)
    }
    return { tipo: 'elenco', voci: b.voci.map((v, i) => testo(v, dovePreciso, `voce ${i + 1}`)) }
  }

  return { tipo: 'paragrafo', testo: testo(b.testo, dovePreciso, 'testo') }
}

/**
 * Validazione all'avvio.
 *
 * Il file è scritto da un modulo web, quindi da qualcuno che non vede il codice. Un
 * testo malformato deve fermare la compilazione con un messaggio comprensibile, non
 * arrivare a schermo come pagina rotta — e soprattutto non far sparire in silenzio una
 * sezione che la pagina si aspetta di trovare.
 */
function validaPagina(chiave: string, grezzo: unknown): PaginaTesti {
  const struttura = STRUTTURA[chiave]
  if (!struttura) throw new Error(`dati/pagine.json: pagina sconosciuta "${chiave}".`)
  const dove = `dati/pagine.json, pagina "${chiave}"`

  if (typeof grezzo !== 'object' || grezzo === null) throw new Error(`${dove}: non è un oggetto.`)
  const p = grezzo as Record<string, unknown>

  if (!Array.isArray(p.sezioni)) throw new Error(`${dove}: "sezioni" deve essere un elenco.`)

  const viste = new Set<string>()
  const sezioni: Sezione[] = p.sezioni.map((grezza, indice) => {
    const doveSezione = `${dove}, sezione ${indice + 1}`
    if (typeof grezza !== 'object' || grezza === null) {
      throw new Error(`${doveSezione}: non è un oggetto.`)
    }
    const s = grezza as Record<string, unknown>
    const id = testo(s.id, doveSezione, 'id')
    if (viste.has(id)) throw new Error(`${dove}: due sezioni con lo stesso id "${id}".`)
    viste.add(id)

    const prevista = struttura.sezioni.some((v) => v.id === id)
    if (!prevista && !struttura.sezioniLibere) {
      throw new Error(
        `${doveSezione}: la sezione "${id}" non è prevista dall'impaginazione di ` +
          `${struttura.percorso}, che non accetta sezioni aggiuntive.`,
      )
    }

    const blocchi = Array.isArray(s.blocchi)
      ? s.blocchi.map((b, i) => validaBlocco(b, doveSezione, i))
      : []

    const sezione: Sezione = { id, blocchi }
    if (typeof s.occhiello === 'string' && s.occhiello) sezione.occhiello = s.occhiello
    if (typeof s.titolo === 'string' && s.titolo) sezione.titolo = s.titolo
    if (s.visibile === false) sezione.visibile = false
    return sezione
  })

  // Una sezione prevista che sparisce porterebbe via con sé il blocco di dati che la
  // pagina le stampa accanto: la polizza, i recapiti del titolare. Meglio fermare la
  // compilazione che pubblicare una pagina legale monca.
  for (const prevista of struttura.sezioni) {
    if (!viste.has(prevista.id)) {
      throw new Error(
        `${dove}: manca la sezione obbligatoria "${prevista.id}" (${prevista.nome}).`,
      )
    }
  }

  return {
    chiave,
    occhiello: testo(p.occhiello, dove, 'occhiello'),
    titolo: testo(p.titolo, dove, 'titolo', 3),
    sommario: testo(p.sommario, dove, 'sommario', 20),
    metaDescrizione: testo(p.metaDescrizione, dove, 'metaDescrizione', 20),
    sezioni,
  }
}

const pagine = new Map<string, PaginaTesti>(
  Object.entries(dati.pagine as Record<string, unknown>).map(([chiave, valore]) => [
    chiave,
    validaPagina(chiave, valore),
  ]),
)

for (const chiave of Object.keys(STRUTTURA)) {
  if (!pagine.has(chiave)) throw new Error(`dati/pagine.json: manca la pagina "${chiave}".`)
}

export function testiPagina(chiave: keyof typeof STRUTTURA | string): PaginaTesti {
  const pagina = pagine.get(chiave)
  if (!pagina) throw new Error(`Testi non trovati per la pagina "${chiave}".`)
  return pagina
}

/**
 * Le sezioni da stampare, nell'ordine scelto, saltando quelle nascoste.
 *
 * Le pagine non leggono `pagina.sezioni` direttamente: passano da qui, così una
 * sezione resa invisibile dalla console sparisce ovunque allo stesso modo.
 */
export function sezioniVisibili(pagina: PaginaTesti): Sezione[] {
  return pagina.sezioni.filter((s) => s.visibile !== false)
}

/**
 * Una sezione singola, per le pagine che le collocano una per una invece di stampare
 * un documento di seguito. Restituisce `null` se la sezione e' stata nascosta dalla
 * console, cosi' la pagina puo' saltarla insieme a cio' che le sta intorno.
 */
export function sezione(pagina: PaginaTesti, id: string): Sezione | null {
  const trovata = pagina.sezioni.find((s) => s.id === id)
  if (!trovata) throw new Error(`Sezione "${id}" non trovata nella pagina "${pagina.chiave}".`)
  return trovata.visibile === false ? null : trovata
}
