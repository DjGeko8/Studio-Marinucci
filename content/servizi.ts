/**
 * ⚠️ AREE DI ATTIVITÀ — ELENCO DA VALIDARE («TBD:AREE»)
 *
 * Nessuna di queste voci è confermata dal professionista. Sono le aree che ci si
 * attende tipicamente da un dottore commercialista abilitato alla revisione legale.
 *
 * PRIMA DELLA PUBBLICAZIONE:
 *   1. cancellare le aree non effettivamente prestate (cancellare, non attenuare:
 *      un'area elencata genera richieste, e un servizio non prestato è una
 *      dichiarazione ingannevole);
 *   2. riordinare l'array mettendo per prime le due o tre aree più frequenti —
 *      l'ordine delle schede è posizionamento, non estetica;
 *   3. far validare ogni descrizione e ogni domanda frequente.
 *
 * Vincolo deontologico: si descrive l'attività prestata, non si promettono risultati.
 * Nessuna formula del tipo «riduciamo il carico fiscale» o «azzeriamo le cartelle».
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

export const servizi: Servizio[] = [
  {
    slug: 'contabilita-e-bilancio',
    titolo: 'Contabilità e bilancio',
    sintesi:
      "Tenuta della contabilità, scritture, bilancio d'esercizio e adempimenti periodici, con verifica costante dell'andamento durante l'anno.",
    destinatari: 'Imprese individuali, società di persone e di capitali',
    corpo: [
      "La contabilità non è solo un obbligo da assolvere: è lo strumento con cui si capisce come sta andando l'attività. Lo studio cura la tenuta della contabilità ordinaria e semplificata, le scritture di assestamento e la redazione del bilancio d'esercizio con nota integrativa, fino al deposito presso il Registro delle Imprese.",
      "Agli adempimenti periodici — liquidazioni IVA, registri, comunicazioni — si affianca una verifica dell'andamento nel corso dell'anno. Arrivare a dicembre conoscendo già il risultato atteso permette di decidere; scoprirlo a bilancio chiuso significa constatare.",
      'Per le realtà che tengono la contabilità internamente, lo studio può limitarsi alla supervisione e alla chiusura, mantenendo il controllo sui punti che contano.',
    ],
    faq: [
      {
        domanda: 'Devo portare i documenti in studio ogni mese?',
        risposta:
          "Si concorda il ritmo più comodo. La consegna può avvenire in studio o per via telematica; l'importante è che i documenti arrivino con l'anticipo necessario a rispettare le scadenze.",
      },
      {
        domanda: 'Posso passare dalla contabilità semplificata a quella ordinaria?',
        risposta:
          "Sì, per opzione o per superamento dei limiti di ricavi. È una scelta che va valutata prima dell'inizio dell'anno, perché incide su adempimenti e determinazione del reddito.",
      },
    ],
  },
  {
    slug: 'consulenza-fiscale-imprese',
    titolo: 'Consulenza fiscale e tributaria alle imprese',
    sintesi:
      "Imposte dirette e indirette, valutazione dei regimi applicabili, pianificazione degli adempimenti e assistenza nei rapporti con l'Agenzia delle Entrate.",
    destinatari: 'Imprese di ogni dimensione, dal negozio alla società strutturata',
    corpo: [
      "L'assistenza copre le imposte dirette e indirette: determinazione del reddito d'impresa, IVA, IRAP, dichiarazioni annuali e comunicazioni periodiche. Ogni adempimento è preceduto dalla verifica del regime applicabile, che cambia con la forma giuridica, i ricavi e il tipo di attività.",
      "La parte che incide di più, però, viene prima: le decisioni. L'acquisto di un bene strumentale, l'assunzione di un collaboratore, l'apertura di una seconda sede hanno conseguenze fiscali che conviene conoscere quando si decide, non quando si dichiara.",
      "Lo studio segue inoltre i rapporti ordinari con l'Agenzia delle Entrate: richieste di chiarimenti, comunicazioni di irregolarità, istanze e regolarizzazioni.",
    ],
    faq: [
      {
        domanda: 'Quanto costa la consulenza?',
        risposta:
          "Il compenso è concordato per iscritto prima di iniziare, sulla base del tipo di attività e degli adempimenti effettivamente necessari. Nel primo incontro si definisce cosa serve, così il preventivo riflette il lavoro reale.",
      },
      {
        domanda: 'Seguite anche chi ha già un altro commercialista?',
        risposta:
          "Sì, sia per un secondo parere su una singola questione, sia per il passaggio completo. In caso di subentro ci si coordina con il collega per il trasferimento della documentazione.",
      },
    ],
  },
  {
    slug: 'professionisti-e-forfettari',
    titolo: 'Professionisti, autonomi e regime forfettario',
    sintesi:
      'Apertura della partita IVA, scelta e verifica del regime, adempimenti ricorrenti e contributi previdenziali.',
    destinatari: 'Liberi professionisti, lavoratori autonomi, ditte individuali',
    corpo: [
      "Chi apre una partita IVA si trova davanti a scelte che condizionano gli anni successivi: regime fiscale, codice attività, cassa previdenziale, eventuale iscrizione alla gestione separata o alla gestione commercianti e artigiani. Lo studio segue l'apertura e la definizione di questo assetto iniziale.",
      "Il regime forfettario conviene in molti casi, ma non in tutti: la valutazione dipende dai costi effettivi, dalla presenza di dipendenti, dalle detrazioni che si perderebbero e dalla prospettiva di crescita. Vale la pena farla prima di scegliere, e rifarla quando l'attività cambia.",
      'Successivamente restano gli adempimenti ricorrenti: fatturazione elettronica, dichiarazione dei redditi, versamenti in acconto e a saldo, contributi. Lo studio ricorda le scadenze e prepara i calcoli in anticipo, così che i versamenti non arrivino inattesi.',
    ],
    faq: [
      {
        domanda: 'Quanto tempo serve per aprire una partita IVA?',
        risposta:
          "L'apertura è rapida, spesso pochi giorni. Il tempo utile si spende prima, nella scelta del regime e dell'inquadramento previdenziale: sono decisioni difficili da correggere a posteriori.",
      },
      {
        domanda: 'Cosa succede se supero la soglia del forfettario?',
        risposta:
          "Il superamento comporta l'uscita dal regime, con tempi diversi a seconda di quanto si supera. È una situazione da monitorare durante l'anno, non da scoprire a consuntivo.",
      },
      {
        domanda: 'Il forfettario conviene sempre?',
        risposta:
          "No. Chi sostiene costi rilevanti o ha detrazioni significative può trovarsi meglio nel regime ordinario. La convenienza si calcola sui numeri della singola posizione.",
      },
    ],
  },
  {
    slug: 'persone-fisiche',
    titolo: 'Persone fisiche: dichiarazioni, successioni, immobili',
    sintesi:
      'Dichiarazione dei redditi, dichiarazione di successione, imposte su immobili e locazioni.',
    destinatari: 'Privati, famiglie, pensionati, proprietari di immobili',
    corpo: [
      'Lo studio assiste le persone fisiche negli adempimenti che ricorrono nella vita di una famiglia: la dichiarazione dei redditi, con la verifica delle detrazioni spettanti; le imposte sugli immobili posseduti; la tassazione dei contratti di locazione e la scelta della cedolare secca.',
      "La successione è il momento in cui l'assistenza pesa di più. Va presentata entro dodici mesi dal decesso e richiede di ricostruire l'intero patrimonio del defunto: immobili, conti, partecipazioni, eventuali debiti. Lo studio cura la dichiarazione, le volture catastali e il calcolo delle imposte dovute.",
      "Per chi possiede immobili, l'assistenza copre anche gli aspetti fiscali di acquisto, vendita e ristrutturazione, comprese le agevolazioni edilizie e i relativi adempimenti.",
    ],
    faq: [
      {
        domanda: 'Entro quando va presentata la dichiarazione di successione?',
        risposta:
          'Entro dodici mesi dalla data del decesso. È utile muoversi prima: la raccolta dei documenti richiede tempo, soprattutto quando gli eredi sono più di uno o il patrimonio comprende immobili in comuni diversi.',
      },
      {
        domanda: 'Quali documenti servono per la dichiarazione dei redditi?',
        risposta:
          "Certificazione unica o documenti dei redditi percepiti, dati degli immobili, e le spese detraibili dell'anno: sanitarie, di istruzione, interessi sul mutuo, ristrutturazioni. Lo studio fornisce un elenco puntuale a inizio campagna.",
      },
    ],
  },
  {
    slug: 'societa-e-operazioni',
    titolo: 'Costituzione di società e operazioni societarie',
    sintesi:
      'Scelta della forma giuridica, costituzione, modifiche statutarie, cessioni di quote e operazioni straordinarie.',
    destinatari: "Chi avvia un'attività in forma societaria e società già operative",
    corpo: [
      "La scelta della forma giuridica è la prima decisione, e la più difficile da cambiare: società di persone o di capitali, socio unico o compagine allargata, conferimenti in denaro o in natura. Ognuna ha conseguenze diverse su responsabilità, imposizione e costi di gestione.",
      "Lo studio assiste nella costituzione, coordinandosi con il notaio, e nella redazione degli assetti che regolano la vita sociale: quote, poteri, organo amministrativo, patti tra i soci.",
      "Nelle operazioni successive — aumenti di capitale, cessioni di quote, trasformazioni, fusioni, conferimenti d'azienda — l'assistenza copre la valutazione preliminare, gli aspetti fiscali e la documentazione richiesta.",
    ],
    faq: [
      {
        domanda: 'Meglio una società di persone o una società di capitali?',
        risposta:
          "Dipende dal rischio dell'attività, dal numero dei soci e dalla prospettiva di crescita. La società di capitali limita la responsabilità ma comporta adempimenti e costi maggiori: la valutazione va fatta sui numeri e sulle intenzioni concrete.",
      },
      {
        domanda: 'Serve il notaio anche per cedere una quota di S.r.l.?',
        risposta:
          "L'atto di cessione richiede l'intervento del notaio o, in alternativa, la sottoscrizione digitale da parte di un professionista abilitato. Lo studio segue la parte fiscale e il deposito al Registro delle Imprese.",
      },
    ],
  },
  {
    slug: 'revisione-legale',
    titolo: 'Revisione legale e collegi sindacali',
    sintesi:
      'Incarichi di revisione legale dei conti e partecipazione a collegi sindacali e organi di controllo.',
    destinatari: 'Società tenute al controllo legale, enti, cooperative',
    corpo: [
      "Il Dott. Marinucci è iscritto al Registro dei Revisori Legali e può assumere incarichi di revisione legale dei conti, sia come revisore unico sia all'interno di collegi sindacali.",
      "L'attività comprende la verifica della regolare tenuta della contabilità, il controllo sulla corretta rilevazione dei fatti di gestione nelle scritture e le verifiche periodiche previste, fino alla relazione sul bilancio d'esercizio.",
      "Le società a responsabilità limitata sono tenute a nominare l'organo di controllo o il revisore al superamento dei limiti dimensionali previsti dal codice civile. La verifica dei presupposti è il primo passo, e va fatta per tempo: la nomina ha termini precisi.",
    ],
    faq: [
      {
        domanda: 'Quando una S.r.l. deve nominare il revisore?',
        risposta:
          "Al superamento dei limiti previsti dall'articolo 2477 del codice civile per due esercizi consecutivi, oltre ai casi di obbligo per legge o per statuto. La verifica va fatta sui dati degli ultimi bilanci approvati.",
      },
    ],
  },
  {
    slug: 'contenzioso-tributario',
    titolo: 'Contenzioso tributario',
    sintesi:
      'Assistenza in caso di controlli, avvisi di accertamento e cartelle, dal contraddittorio al ricorso.',
    destinatari: 'Imprese, professionisti e privati destinatari di atti impositivi',
    corpo: [
      "Ricevere un avviso di accertamento o una cartella non significa necessariamente doverli pagare così come sono, né significa doverli impugnare a ogni costo. Il primo passo è leggere l'atto e capire su cosa si fonda.",
      "Dove è possibile, si privilegiano gli strumenti che chiudono la questione prima del giudizio: contraddittorio con l'ufficio, autotutela, accertamento con adesione, definizioni agevolate quando previste. Sono strade più rapide e meno costose del ricorso.",
      'Quando il ricorso è la strada giusta, lo studio predispone gli atti e segue il procedimento davanti alle Corti di giustizia tributaria, valutando fin dall’inizio i tempi, i costi e il rischio della lite.',
    ],
    faq: [
      {
        domanda: 'Quanto tempo ho per impugnare un avviso di accertamento?',
        risposta:
          "In via ordinaria sessanta giorni dalla notifica, con sospensioni e proroghe che dipendono dal tipo di atto e dagli strumenti attivati. È un termine che decade: conviene far esaminare l'atto appena ricevuto.",
      },
      {
        domanda: 'Conviene sempre fare ricorso?',
        risposta:
          "No. Il ricorso ha costi e tempi propri, e va intrapreso quando le ragioni sono fondate e l'importo lo giustifica. In molti casi il contraddittorio o l'adesione portano a un risultato migliore in meno tempo.",
      },
    ],
  },
  {
    slug: 'crisi-di-impresa',
    titolo: "Crisi d'impresa e composizione negoziata",
    sintesi:
      'Analisi dello stato di difficoltà, adeguati assetti e strumenti previsti dal codice della crisi.',
    destinatari: 'Imprese in tensione finanziaria e imprese che vogliono prevenirla',
    corpo: [
      "Il codice della crisi chiede all'imprenditore di dotarsi di assetti organizzativi, amministrativi e contabili adeguati a rilevare tempestivamente la difficoltà. Per una piccola impresa non significa costruire una struttura complessa: significa avere qualche indicatore aggiornato e guardarlo con regolarità.",
      "Quando la tensione si manifesta, gli strumenti disponibili dipendono da quanto presto ci si muove. La composizione negoziata consente di trattare con i creditori con l'assistenza di un esperto indipendente, mantenendo la gestione dell'impresa.",
      "Lo studio affianca l'imprenditore nell'analisi della situazione, nella ricostruzione della posizione debitoria e nella scelta dello strumento praticabile. Il fattore che pesa di più è il tempo: le opzioni si riducono con il passare dei mesi.",
    ],
    faq: [
      {
        domanda: 'Cosa sono gli «adeguati assetti» per una piccola impresa?',
        risposta:
          "Un insieme proporzionato alla dimensione: contabilità aggiornata, monitoraggio dei flussi di cassa a breve, verifica periodica della sostenibilità dei debiti. Non serve una struttura complessa, serve regolarità.",
      },
      {
        domanda: "Quando conviene chiedere l'aiuto di un professionista?",
        risposta:
          "Prima che i debiti diventino scaduti da mesi. Gli strumenti di composizione della crisi funzionano quando c'è ancora margine di trattativa; a tensione conclamata le alternative si riducono.",
      },
    ],
  },
  {
    slug: 'perizie-e-valutazioni',
    titolo: "Perizie e valutazioni d'azienda",
    sintesi: 'Valutazioni di azienda e di quote, perizie di stima e consulenze tecniche.',
    destinatari: 'Soci, imprenditori, parti in procedimenti civili',
    corpo: [
      "Stabilire quanto vale un'azienda o una partecipazione serve in molte occasioni: la cessione, l'ingresso o l'uscita di un socio, una divisione ereditaria, una controversia. Il valore non è un numero unico e oggettivo: dipende dal metodo, dalle assunzioni e dallo scopo della valutazione, che vanno esplicitati.",
      "Lo studio redige valutazioni d'azienda e di quote, perizie di stima e relazioni tecniche, motivando i criteri adottati in modo che il documento regga il confronto con la controparte o con il giudice.",
    ],
    faq: [
      {
        domanda: 'Come si stabilisce il valore di una quota societaria?',
        risposta:
          "Con metodi diversi — patrimoniali, reddituali, finanziari, misti — scelti in funzione del tipo di azienda e dello scopo della perizia. Il criterio adottato va dichiarato e giustificato: è ciò che rende la valutazione difendibile.",
      },
    ],
  },
]

export function trovaServizio(slug: string): Servizio | undefined {
  return servizi.find((s) => s.slug === slug)
}

/** Le aree mostrate in home. Riordinare `servizi` cambia anche questa selezione. */
export const serviziInHome = servizi.slice(0, 6)
