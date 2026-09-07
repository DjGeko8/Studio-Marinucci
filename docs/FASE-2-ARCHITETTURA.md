# Fase 2 — Architettura e contenuti

Sito **Studio Marinucci** — Dott. Massimo Marinucci, dottore commercialista e revisore
legale, Termoli (CB).

Documento da approvare prima di passare alla fase 3 (design system).
Riferimenti obbligati: `DATI-MANCANTI.md` (segnaposto) e `BOZZE-TESTI.md` (copy).

---

## 1. Posizionamento — la decisione che governa tutto il resto

Marinucci è, per quanto risulta, un professionista che **opera individualmente**.
Sonato ha undici professionisti su due città; De Stefani ha due sedi, un team e una
produzione editoriale sul Sole 24 Ore. Riprodurre il loro impianto — team, sedi,
contatori di successi — produrrebbe un sito che promette una struttura inesistente,
smentita dalla prima telefonata.

**La promessa del sito è quindi l'opposto della scala:**

> Chi chiama parla con il titolare. Non con un collaboratore, non con un centralino.

Tradotto in quattro argomenti concreti, tutti verificabili:

| Argomento | Fonte di verifica |
|---|---|
| Interlocutore unico: si parla sempre con il professionista | struttura dello studio |
| Iscritto all'albo dei dottori commercialisti dal 2001 | ODCEC Larino, n. 81/A |
| Revisore legale | Registro Revisori — `«TBD:REVISORI»` |
| Radicamento nel basso Molise: nato e con studio a Termoli | anagrafica |

> **Nota sul "dal 2001".** Preferiamo la formula *"iscritto all'albo dal 2001"* a
> *"oltre vent'anni di esperienza"*. È lo stesso fatto, ma il primo è una data
> verificabile che non invecchia e non va aggiornata ogni anno; il secondo è
> un'affermazione da dimostrare. Su un sito soggetto a vincoli deontologici la
> differenza conta.

**Tono di voce:** piano, diretto, senza gergo. Frasi brevi. Nessun superlativo, nessun
"soluzioni su misura per il tuo business", nessun verbo al futuro promissorio. Il
lettore tipo non è un CFO: è un artigiano, un commerciante, un professionista o una
famiglia che deve capire in trenta secondi se questo è il posto giusto.

---

## 2. Sitemap definitiva

Perimetro confermato: **nucleo essenziale + prenotazione appuntamenti**.

```
/                          Home
/studio                    Il professionista: percorso, approccio, incarichi
/servizi                   Indice delle aree di attività
/servizi/[slug]            Una pagina per ogni area confermata
/scadenze                  Scadenzario fiscale, filtrabile
/news                      Approfondimenti
/news/[slug]               Articolo
/appuntamento              Prenotazione (in studio o in videochiamata)
/contatti                  Modulo, telefono, email, PEC, orari, fax
/dove-siamo                Mappa, come arrivare, parcheggio
/privacy                   Informativa privacy
/cookie-policy             Cookie policy
/note-legali               Dati obbligatori dell'esercente la professione
```

### Scelte da motivare

**`/settori` non esiste (per ora).** Il brief la dava come opzionale. Finché non arriva
`«TBD:SETTORI»` non sappiamo se ci siano settori realmente caratterizzanti; una pagina
"settori" generica sarebbe riempitivo. Se la risposta rivelerà due o tre settori forti
(es. nautica, indotto industriale, agricoltura), la aggiungiamo allora — o meglio, li
integriamo dentro le singole pagine servizio, dove sono più utili per la SEO.

**`/appuntamento` è una pagina a sé, non un'ancora dentro `/contatti`.** È il bersaglio
della CTA primaria presente in ogni schermata: deve avere un URL proprio, un `title`
proprio e spazio per spiegare cosa succede dopo la prenotazione (conferma, cosa portare,
in studio o in videochiamata). Incastrarla in fondo a `/contatti` la rende invisibile da
telefono.

**Nessuna pagina team.** Si crea solo se `«TBD:COLLAB»` conferma persone reali.

### Menu principale

```
Studio · Servizi · Scadenze · News · Contatti      [ Prenota un appuntamento ]
```

Cinque voci più una CTA. `/dove-siamo` e le pagine legali vivono nel footer;
`/appuntamento` è raggiunta dalla CTA.

### Barra superiore fissa

Telefono · Email · Orari — tutti cliccabili (`tel:`, `mailto:`). Da telefono partono
chiamata e messaggio con un tocco. È l'elemento che converte di più su un professionista
locale, e va tenuto anche su mobile (collassato in due icone + orario).

---

## 3. ⚠️ Aree di attività — PROPOSTA, NON PUBBLICABILE

**Nessuna di queste voci va online senza conferma esplicita** (`«TBD:AREE»`).
Un elenco di servizi non effettivamente prestati è una dichiarazione ingannevole.

Da un dottore commercialista abilitato alla revisione legale ci si attende tipicamente:

| # | Area | Slug | Da chiedere |
|---|---|---|---|
| 1 | Contabilità e bilancio | `contabilita-e-bilancio` | La svolge? È il grosso del lavoro? |
| 2 | Consulenza fiscale e tributaria alle imprese | `consulenza-fiscale-imprese` | |
| 3 | Professionisti, autonomi e regime forfettario | `professionisti-e-forfettari` | |
| 4 | Persone fisiche: dichiarazioni, successioni, immobili | `persone-fisiche` | Dipende da `«TBD:PRIVATI»` |
| 5 | Costituzione di società e operazioni societarie | `societa-e-operazioni` | |
| 6 | Revisione legale e collegi sindacali | `revisione-legale` | Ha incarichi in corso? |
| 7 | Contenzioso tributario | `contenzioso-tributario` | Lo segue o lo passa a un tributarista? |
| 8 | Crisi d'impresa e composizione negoziata | `crisi-di-impresa` | È gestore della crisi iscritto? |
| 9 | Perizie e valutazioni d'azienda | `perizie-e-valutazioni` | CTU? |

Domande di contorno, altrettanto importanti:

- **Quali sono le due o tre aree più frequenti?** Vanno per prime nell'indice e in home:
  l'ordine delle schede è una scelta di posizionamento, non estetica.
- **C'è qualcosa che preferisce NON ricevere?** (`«TBD»`) Se, per dire, non vuole
  contenzioso o non segue 730, quell'area va tolta — non attenuata. Un'area elencata
  genera richieste.

### Struttura di ogni pagina `/servizi/[slug]`

1. Titolo + una riga che dice a chi si rivolge
2. 2-3 paragrafi: cosa comprende concretamente, nessun elenco puntato-fiume
3. "Come si lavora insieme": 3 passi (primo contatto → analisi → attività continuativa)
4. Domande frequenti reali, 3-5 → alimentano lo structured data `FAQPage`
5. CTA doppia: chiama ora / prenota un appuntamento

Le pagine servizio sono i veri atterraggi SEO. Una pagina generica "Servizi" non
intercetta "apertura partita iva termoli"; una pagina dedicata sì.

---

## 4. Home — sequenza dei blocchi

| # | Blocco | Contenuto | Dipendenze |
|---|---|---|---|
| 1 | Hero | Foto di Termoli, nome studio, una riga su cosa fa e per chi, CTA chiama / prenota | `«TBD:FOTO_TERMOLI»` `«TBD:DENOM»` |
| 2 | Chi è | Due paragrafi + ritratto, link a `/studio` | `«TBD:FOTO_RITRATTO»` |
| 3 | Aree di attività | 6-8 schede, le più frequenti per prime | `«TBD:AREE»` |
| 4 | Perché questo studio | I 4 argomenti della §1 | `«TBD:REVISORI»` |
| 5 | Prossime scadenze | Le 3 più vicine + link a `/scadenze` | — |
| 6 | Ultimi approfondimenti | 3 articoli, o nascosto se `< 3` | — |
| 7 | Contatto | Modulo compatto, telefono, mappa, orari | `«TBD:ORARI»` `«TBD:SEDE»` |
| 8 | Footer | Tutti i dati obbligatori | tutta la §A di `DATI-MANCANTI` |

**Sull'hero, una correzione rispetto ai riferimenti.** Sonato usa un muro fotografico a
piena pagina che costringe a scorrere prima di capire di cosa si tratta. Noi teniamo la
fotografia di Termoli — è la mossa che distingue il sito da qualunque template di
categoria — ma la limitiamo a circa il 65-70% dell'altezza dello schermo, così che il
primo blocco successivo sia già intuibile senza scorrere. E nell'hero non va nulla che
non sia il messaggio: niente selettore lingua, niente badge.

---

## 5. Prenotazione appuntamenti — nodo tecnico aperto

Confermata in perimetro. Ma va deciso il motore (`«TBD:PRENOTA_BACKEND»`), perché la
scelta ha una conseguenza secca:

> **Un calendario non sincronizzato è peggio di nessun calendario.** Se il professionista
> conferma un appuntamento che ha già preso al telefono, il danno di fiducia è maggiore
> del beneficio della funzione.

Tre strade, in ordine di robustezza:

1. **Servizio esterno collegato al suo calendario reale** (Cal.com, Calendly o simili,
   incorporato dopo consenso cookie). La disponibilità è quella vera perché legge il
   calendario. Costo mensile basso, manutenzione quasi nulla. **È la strada che
   consiglio.**
2. **Richiesta di appuntamento, non prenotazione.** Il modulo raccoglie 2-3 preferenze di
   data/fascia; lo studio conferma per telefono o email. Zero sincronizzazione, zero
   rischio di doppia prenotazione, ma niente conferma immediata. Ottimo ripiego se non
   vuole legare il calendario.
3. **Calendario proprietario.** Sconsigliato: significa costruire e mantenere gestione
   slot, fusi, cancellazioni e notifiche per un beneficio identico al punto 1.

Da chiedere al professionista: **usa già un calendario digitale (Google, Outlook)?** Se
la risposta è no, l'opzione 2 è di fatto l'unica sensata.

---

## 6. Scadenzario fiscale

È la pagina che porta traffico ricorrente e fa tornare le persone: merita cura pari alla
home.

- Fonte: un file di contenuto tipizzato in `/content/scadenze/`, una voce per scadenza:
  data, titolo, descrizione breve, tipi di contribuente interessati, riferimento
  normativo, area di attività collegata.
- Filtro per **tipo di contribuente** (impresa · professionista/autonomo · forfettario ·
  privato · società di capitali), non per categoria astratta: l'utente sa cosa è, non sa
  in quale categoria fiscale ricade.
- Evidenza sulle **prossime 30 giorni**, resto dell'anno consultabile.
- Nota fissa in fondo: si tratta di informazione generale, le scadenze possono essere
  differite da provvedimenti successivi, per il proprio caso occorre verifica.
- **Aggiornabile da chi non è tecnico**: un file, un formato, istruzioni nel README.
  Se aggiornarlo richiede un intervento nostro, non verrà aggiornato.

---

## 7. News — struttura pronta, aspettative basse

Da concordare (`«TBD»`): il professionista è disposto a scrivere qualche articolo l'anno?

- Se **sì**: la sezione esiste dal principio, con tre articoli iniziali (bozze nostre,
  validate da lui). Meglio tre articoli utili all'anno che un blog abbandonato dopo due
  mesi.
- Se **no**: la struttura resta nel codice ma la voce di menu non compare finché non ci
  sono almeno tre articoli. Una sezione "News" con un solo post di dodici mesi fa
  comunica abbandono, ed è peggio dell'assenza.

Ogni articolo porta in calce, non opzionale:

> Il contenuto ha finalità informative generali e non costituisce consulenza riferita al
> caso concreto. Per la propria situazione è necessario un esame specifico.

---

## 8. Mappa SEO — intento di ricerca → pagina

NAP identico ovunque: sito, Google Business Profile, albo. Un solo formato di indirizzo
e di numero telefonico, deciso una volta.

| Query obiettivo | Pagina | Note |
|---|---|---|
| commercialista termoli | `/` | query principale |
| commercialista basso molise | `/` + `/dove-siamo` | dipende da `«TBD:AREA_GEO»` |
| apertura partita iva termoli | `/servizi/professionisti-e-forfettari` | alta intenzione |
| dichiarazione redditi termoli | `/servizi/persone-fisiche` | dipende da `«TBD:PRIVATI»` |
| successione termoli | `/servizi/persone-fisiche` | stagionale, poca concorrenza |
| revisore legale molise | `/servizi/revisione-legale` | differenziante |
| scadenze fiscali 2026 | `/scadenze` | traffico ricorrente |
| studio commercialista termoli | `/studio` | |

Dati strutturati previsti:

- `AccountingService` — indirizzo, coordinate, `openingHours`, telefono, `areaServed`
- `Person` — il professionista, con titolo e appartenenza all'ordine
- `FAQPage` — sulle pagine servizio che hanno domande frequenti reali
- `BreadcrumbList` — su tutte le pagine di secondo livello
- `Article` — sugli approfondimenti

**Nella checklist di consegna entra anche la creazione e ottimizzazione del Google
Business Profile.** Per uno studio locale pesa quanto il sito: è ciò che compare nella
mappa quando qualcuno cerca "commercialista Termoli" dal telefono.

---

## 9. Vincoli deontologici applicati a questa architettura

Conseguenze concrete delle regole sulla pubblicità informativa (art. 4 DPR 137/2012,
codice deontologico ODCEC), già incorporate nelle scelte sopra:

- **Nessun contatore** tipo "clienti seguiti" o "anni di esperienza" in evidenza: sono i
  numeri autocelebrativi che ho scartato dal riferimento De Stefani.
- **Nessuna testimonianza, recensione o caso di studio**, neppure anonimizzato se
  ricostruibile: vincolo di riservatezza prima ancora che deontologia.
- **Nessun calcolatore d'imposta o simulatore di risparmio**: produce risultati
  approssimativi su cui qualcuno prenderà decisioni.
- **Nessun chatbot** che risponda a domande fiscali.
- **Nessun confronto** con altri professionisti, esplicito o implicito.
- **Nessuna promessa di risultato**, in nessuna formulazione.
- **Nessun linguaggio d'urgenza**: niente conti alla rovescia, niente "affrettati".
- **Titolo, ordine e numero di iscrizione nel footer**, in modo chiaro e permanente.
- Si indicano **attività prevalenti e materie trattate**; non ci si presenta come
  "specialista" in senso qualificante senza un titolo riconosciuto.

Se una bozza — mia o fornita — sfiora una di queste righe, viene segnalata e non
pubblicata.

---

## 10. Cosa serve per chiudere questa fase

1. ✅ Sitemap approvata (o corretta)
2. ⬜ **`«TBD:AREE»` — l'elenco confermato delle aree di attività.** È il blocco vero:
   senza, non si scrivono le pagine servizio né si ordina la home
3. ⬜ Risposta su `/settori` e sulla pagina team, che dipendono da `«TBD:SETTORI»` e
   `«TBD:COLLAB»`
4. ⬜ Scelta del motore di prenotazione (§5)
5. ⬜ Sì/no sugli articoli (§7)
6. ⬜ Approvazione delle bozze in `BOZZE-TESTI.md`

Con la sitemap approvata si può comunque avviare la **fase 3 (design system)** in
parallelo: i token e i componenti non dipendono dall'elenco dei servizi.
