/**
 * SCADENZARIO FISCALE
 *
 * ⚠️ Da rivedere e confermare ogni anno dal professionista prima della pubblicazione.
 * Le date qui riportate sono quelle ordinarie: possono essere differite da
 * provvedimenti successivi, e alcune slittano al primo giorno lavorativo utile
 * quando cadono di sabato o in giorno festivo.
 *
 * COME AGGIORNARE (istruzioni complete nel README):
 *   — una voce per scadenza, in ordine qualsiasi: l'ordinamento è automatico;
 *   — `data` in formato AAAA-MM-GG;
 *   — `destinatari` decide in quali filtri la scadenza compare;
 *   — `servizio` (facoltativo) collega la scadenza a un'area di attività.
 *
 * Non inserire commenti o valutazioni: lo scadenzario è informazione, non consulenza.
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

export const annoScadenzario = 2026

export const scadenze: Scadenza[] = [
  {
    data: '2026-01-16',
    titolo: 'Liquidazione IVA di dicembre',
    descrizione:
      "Versamento dell'IVA a debito relativa al mese di dicembre per i contribuenti con liquidazione mensile.",
    destinatari: ['impresa', 'professionista', 'societa'],
    servizio: 'contabilita-e-bilancio',
  },
  {
    data: '2026-01-16',
    titolo: 'Ritenute su redditi di lavoro e di capitale',
    descrizione:
      "Versamento delle ritenute operate nel mese precedente su retribuzioni, compensi e altri redditi.",
    destinatari: ['sostituto', 'impresa', 'societa'],
  },
  {
    data: '2026-02-16',
    titolo: 'Quarta rata IVA trimestrale e ritenute',
    descrizione:
      'Versamento delle ritenute del mese precedente e degli adempimenti IVA periodici.',
    destinatari: ['impresa', 'professionista', 'societa', 'sostituto'],
  },
  {
    data: '2026-03-02',
    titolo: 'Comunicazione delle liquidazioni periodiche IVA — quarto trimestre',
    descrizione:
      "Invio telematico della comunicazione dei dati delle liquidazioni IVA dell'ultimo trimestre dell'anno precedente.",
    destinatari: ['impresa', 'professionista', 'societa'],
    servizio: 'contabilita-e-bilancio',
  },
  {
    data: '2026-03-16',
    titolo: 'Versamento del saldo IVA annuale',
    descrizione:
      "Versamento in unica soluzione del saldo IVA risultante dalla dichiarazione annuale, o prima rata in caso di rateizzazione.",
    destinatari: ['impresa', 'professionista', 'societa'],
    servizio: 'contabilita-e-bilancio',
  },
  {
    data: '2026-03-16',
    titolo: 'Certificazione Unica — consegna ai percipienti',
    descrizione:
      "Consegna della Certificazione Unica ai lavoratori dipendenti e ai percettori di redditi di lavoro autonomo, e invio telematico all'Agenzia delle Entrate.",
    destinatari: ['sostituto', 'impresa', 'societa'],
  },
  {
    data: '2026-04-30',
    titolo: 'Dichiarazione IVA annuale',
    descrizione: "Termine per l'invio telematico della dichiarazione IVA relativa all'anno precedente.",
    destinatari: ['impresa', 'professionista', 'societa'],
    servizio: 'contabilita-e-bilancio',
  },
  {
    data: '2026-05-31',
    titolo: 'Comunicazione delle liquidazioni periodiche IVA — primo trimestre',
    descrizione: 'Invio telematico della comunicazione dei dati delle liquidazioni del primo trimestre.',
    destinatari: ['impresa', 'professionista', 'societa'],
  },
  {
    data: '2026-06-16',
    titolo: 'Acconto IMU',
    descrizione:
      "Versamento della prima rata dell'imposta municipale propria sugli immobili posseduti.",
    destinatari: ['privato', 'impresa', 'societa'],
    servizio: 'persone-fisiche',
  },
  {
    data: '2026-06-30',
    titolo: 'Saldo e primo acconto delle imposte sui redditi',
    descrizione:
      "Versamento del saldo delle imposte relative all'anno precedente e del primo acconto per l'anno in corso, per persone fisiche e società con esercizio coincidente con l'anno solare.",
    destinatari: ['impresa', 'professionista', 'forfettario', 'societa', 'privato'],
  },
  {
    data: '2026-07-31',
    titolo: 'Versamento con maggiorazione dello 0,40 per cento',
    descrizione:
      "Termine differito per il versamento di saldo e primo acconto, con applicazione della maggiorazione dello 0,40 per cento.",
    destinatari: ['impresa', 'professionista', 'forfettario', 'societa', 'privato'],
  },
  {
    data: '2026-09-30',
    titolo: 'Dichiarazione dei redditi — modello 730',
    descrizione:
      'Termine per la presentazione del modello 730 per lavoratori dipendenti e pensionati.',
    destinatari: ['privato'],
    servizio: 'persone-fisiche',
  },
  {
    data: '2026-10-31',
    titolo: 'Dichiarazione dei redditi — modello Redditi',
    descrizione:
      "Termine per l'invio telematico del modello Redditi persone fisiche, società di persone e società di capitali con esercizio coincidente con l'anno solare.",
    destinatari: ['impresa', 'professionista', 'forfettario', 'societa', 'privato'],
  },
  {
    data: '2026-11-30',
    titolo: 'Secondo acconto delle imposte sui redditi',
    descrizione:
      "Versamento del secondo o unico acconto delle imposte sui redditi e dei contributi previdenziali.",
    destinatari: ['impresa', 'professionista', 'forfettario', 'societa', 'privato'],
  },
  {
    data: '2026-12-16',
    titolo: 'Saldo IMU',
    descrizione:
      "Versamento della seconda rata dell'imposta municipale propria, a conguaglio di quanto versato in acconto.",
    destinatari: ['privato', 'impresa', 'societa'],
    servizio: 'persone-fisiche',
  },
  {
    data: '2026-12-27',
    titolo: 'Acconto IVA',
    descrizione:
      "Versamento dell'acconto IVA dovuto per l'ultimo periodo dell'anno, mensile o trimestrale.",
    destinatari: ['impresa', 'professionista', 'societa'],
    servizio: 'contabilita-e-bilancio',
  },
]

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
