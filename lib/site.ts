/**
 * Configurazione del sito.
 *
 * `«TBD:…»` rimanda a docs/DATI-MANCANTI.md. Prima del go-live nel repository
 * non deve esistere alcuna occorrenza di «TBD:.
 */

/** Segnaposto tracciato: rende evidente a schermo ciò che manca. */
export function tbd(id: string): string {
  return `«TBD:${id}»`
}

export const site = {
  /**
   * «TBD:DOMINIO» — dominio definitivo, ancora da registrare.
   *
   * ⚠️ NON usare `studiomarinucci.it`: è già registrato da un altro studio
   * (Sonia Marinucci, finanza agevolata ed europrogettazione). Vedi
   * docs/DATI-MANCANTI.md §F.
   *
   * Il segnaposto usa il dominio riservato `.invalid` (RFC 2606): non può
   * risolvere a nessun sito reale, quindi se finisse per errore in produzione
   * non manderebbe visitatori a casa d'altri.
   */
  url: 'https://dominio-da-registrare.invalid',
  /** «TBD:DENOM» — denominazione ufficiale da confermare. */
  name: 'Studio Marinucci',
  shortName: 'Studio Marinucci',
  locale: 'it_IT',
  description:
    'Dott. Massimo Marinucci, dottore commercialista e revisore legale a Termoli. Consulenza fiscale, contabile e societaria per imprese, professionisti e famiglie del basso Molise.',
} as const

/**
 * Il sito è ancora un'anteprima?
 *
 * Si deduce dal dominio: finché `site.url` punta al segnaposto `.invalid`, il
 * dominio definitivo non è stato registrato e quindi quello che si sta guardando
 * è un'anteprima — tipicamente su un indirizzo *.workers.dev.
 *
 * In quel caso il sito chiede ai motori di ricerca di NON indicizzarlo. Serve a
 * evitare che finiscano nei risultati di ricerca pagine con i segnaposto «TBD»
 * ancora visibili, fotografie marchiate come provvisorie e testi non ancora
 * validati dal professionista.
 *
 * Non c'è nulla da configurare e nulla da ricordarsi: il giorno in cui si scrive
 * il dominio vero in `site.url`, l'indicizzazione si riattiva da sola.
 */
export const inAnteprima = site.url.endsWith('.invalid')

export const professionista = {
  nome: 'Massimo Marinucci',
  nomeCompleto: 'Dott. Massimo Marinucci',
  titolo: 'Dottore Commercialista',
  titoli: ['Dottore Commercialista', 'Revisore Legale'],
  ordine: 'Ordine dei Dottori Commercialisti e degli Esperti Contabili di Larino',
  ordineBreve: 'ODCEC di Larino',
  numeroIscrizione: '81/A',
  dataIscrizione: '2001-02-05',
  annoIscrizione: 2001,
  /** «TBD:REVISORI» — numero di iscrizione al Registro dei Revisori Legali. */
  numeroRevisori: tbd('REVISORI'),
  laurea: 'Economia e Commercio',
  cittaNascita: 'Termoli',
  annoNascita: 1970,
} as const

/**
 * ⚠️ Conflitto aperto — vedi docs/DATI-MANCANTI.md §A.
 * L'albo ODCEC registra Via Venezia 76 come domicilio professionale e
 * Via Madonna delle Grazie 25 come residenza. Il sito pubblica la seconda su
 * indicazione del committente: va verificato con il professionista se aggiornare
 * la posizione presso l'ordine.
 *
 * Questo oggetto è l'UNICO punto in cui l'indirizzo compare: cambiarlo costa una riga.
 */
export const sede = {
  via: 'Via Madonna delle Grazie, 25',
  cap: '86039',
  citta: 'Termoli',
  provincia: 'CB',
  regione: 'Molise',
  nazione: 'IT',
  /** «TBD» — coordinate da rilevare sull'indirizzo definitivo, non stimate. */
  lat: null as number | null,
  lng: null as number | null,
  get completo() {
    return `${this.via} — ${this.cap} ${this.citta} (${this.provincia})`
  },
} as const

export const contatti = {
  telefono: '0875 85519',
  telefonoE164: '+39087585519',
  telefonoHref: 'tel:+39087585519',
  /** «TBD:EMAIL» — l'indirizzo @virgilio.it va sostituito con uno su dominio proprio. */
  email: tbd('EMAIL'),
  /** Da comporre sul dominio scelto: `info@` + dominio registrato. */
  emailProposta: tbd('EMAIL'),
  /** «TBD:PEC» */
  pec: tbd('PEC'),
  /** «TBD:FAX» — pubblicare solo se ancora attivo, e solo nella pagina contatti. */
  fax: '0875 910243',
  faxAttivo: null as boolean | null,
} as const

export const datiObbligatori = {
  /** «TBD:PIVA» */
  partitaIva: tbd('PIVA'),
  /** «TBD:POLIZZA» — art. 5 DPR 137/2012: compagnia e massimale. */
  polizzaRc: tbd('POLIZZA'),
} as const

/** «TBD:ORARI» — orari reali da confermare; questi non vanno pubblicati così come sono. */
export const orari = {
  confermati: false,
  righe: [
    { giorni: 'Lunedì — Venerdì', orario: tbd('ORARI') },
    { giorni: 'Sabato', orario: tbd('ORARI') },
  ],
  nota: 'Si riceve su appuntamento.',
  /** «TBD:ORARI» — sintesi per la barra superiore. */
  sintesi: tbd('ORARI'),
} as const

/** «TBD:AREA_GEO» — da confermare l'estensione reale dell'area servita. */
export const areaServita = ['Termoli', 'Basso Molise', 'Provincia di Campobasso'] as const

export const navPrincipale = [
  { href: '/studio', label: 'Studio' },
  { href: '/servizi', label: 'Servizi' },
  { href: '/scadenze', label: 'Scadenze' },
  { href: '/news', label: 'News' },
  { href: '/contatti', label: 'Contatti' },
] as const

export const navFooter = [
  { href: '/dove-siamo', label: 'Dove siamo' },
  { href: '/appuntamento', label: 'Prenota un appuntamento' },
  { href: '/note-legali', label: 'Note legali' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookie-policy', label: 'Cookie policy' },
] as const
