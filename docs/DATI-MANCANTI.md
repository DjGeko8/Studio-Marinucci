# Dati mancanti e segnaposto — checklist di go-live

Ultimo aggiornamento: 2026-09-04

Questo file è l'**unico registro** dei dati non confermati. Ogni segnaposto nel codice e nei
contenuti rimanda a una voce di questa tabella tramite il suo ID.
Regola: **nessuna pubblicazione finché tutte le voci in "Blocco go-live" sono chiuse.**

Convenzione del segnaposto nei file di contenuto: `«TBD:ID»` — es. `«TBD:PIVA»`.
I segnaposto sono **visibili a schermo**, evidenziati in giallo: non possono passare
inosservati.

Per contarli in qualunque momento:

```bash
npm run verifica-segnaposto
```

Il comando esce con errore finché ne resta anche uno solo. **Stato al 2026-09-04: 23
occorrenze, 14 identificativi distinti.**

---

## A. Blocco go-live — senza questi non si pubblica

| ID | Dato | Perché è obbligatorio | Stato |
|---|---|---|---|
| `PIVA` | Partita IVA dello studio | Identificazione fiscale, footer e note legali | ⛔ mancante |
| `PEC` | Indirizzo PEC | Recapito legale, note legali | ⛔ mancante |
| `REVISORI` | N. iscrizione Registro dei Revisori Legali | Il titolo di revisore legale si può menzionare solo con l'estremo verificabile | ⛔ mancante |
| `POLIZZA` | Polizza RC professionale: compagnia + massimale | Art. 5 DPR 137/2012: estremi da rendere noti al cliente | ⛔ mancante |
| `ORARI` | Orari di apertura + se si riceve solo su appuntamento | Barra contatti, `/dove-siamo`, schema.org `openingHours`, Google Business Profile | ⛔ mancante |
| `SEDE` | Conferma della sede operativa | Vedi nota critica sotto | ⚠️ **conflitto aperto** |

### ⚠️ Nota critica su `SEDE`

- Albo ODCEC Larino → **domicilio professionale: Via Venezia 76**
- Albo ODCEC Larino → **residenza: Via Madonna delle Grazie 25**
- Scelta operativa data al progetto → **Via Madonna delle Grazie 25**

Il sito userà Via Madonna delle Grazie 25. Ma questo significa che **il domicilio
professionale all'albo non riflette la sede reale**. Da porre al professionista come
domanda secca:

1. I clienti si ricevono davvero in Via Madonna delle Grazie 25?
2. Se sì, intende aggiornare il domicilio professionale presso l'ODCEC?
3. Se no, si torna a Via Venezia 76 e va corretto ovunque.

Finché la risposta non arriva, l'indirizzo compare in **un solo punto del codice**
(`content/studio.json`) così che il cambio costi una riga.

---

## B. Necessari prima di scrivere i contenuti definitivi

| ID | Dato | Impatto se manca |
|---|---|---|
| `AREE` | Elenco confermato delle aree di attività effettivamente svolte | Un'area non prestata = dichiarazione ingannevole. Vedi `FASE-2-ARCHITETTURA.md` §3 |
| `DENOM` | Denominazione ufficiale dello studio | Titoli, logo, schema.org `legalName`, footer |
| `DOMINIO` | Dominio da registrare o già registrato | Canonical, sitemap, email professionale, GBP |
| `EMAIL` | Email su dominio proprio (sostituzione di `@virgilio.it`) | Contatti, footer, modulo, schema.org |
| `INCARICHI` | Collegi sindacali, CTU, curatele, gestore crisi, docenze, pubblicazioni | Sezione "profilo" di `/studio`: è il contenuto che differenzia davvero |
| `SETTORI` | Settori di clientela prevalenti | Caratterizzazione dei testi; senza, i testi restano generici |
| `AREA_GEO` | Area servita (Termoli / basso Molise / anche Abruzzo-Puglia) | schema.org `areaServed`, SEO locale |
| `PRIVATI` | Se segue anche clienti privati (730, successioni, immobili) | Determina se esiste l'area "persone fisiche" |
| `COLLAB` | Esistenza di collaboratori o dipendenti | Determina se esiste una pagina team. **Se non esistono, non si crea** |
| `FAX` | Se il fax 0875 910243 è ancora attivo | Se sì → solo `/contatti`. Se no → si omette |

### B-bis. Emersi durante la stesura delle pagine legali

| ID | Dato | Dove serve |
|---|---|---|
| `DPO` | Se è stato nominato un responsabile della protezione dei dati | `/privacy`. Se non nominato, **la voce va rimossa**, non lasciata vuota |
| `CONSERVAZIONE` | Per quanti mesi si conservano le richieste che non diventano incarichi | `/privacy`. Va scelto un termine e rispettato |
| `HOSTING` | Fornitori nominati responsabili del trattamento (hosting, posta) e se trattano dati solo nello SEE | `/privacy`. Dipende da `HOSTING` in §E |

---

## C. Da confermare — dati già in nostro possesso ma non verificati dal titolare

Provengono dalla scheda pubblica dell'albo, non dal professionista. **Vanno confermati
uno per uno prima del go-live**, anche se sembrano innocui.

| Dato | Valore assunto |
|---|---|
| Nome | Dott. Massimo Marinucci |
| Titolo | Dottore Commercialista |
| Ordine | ODCEC di Larino |
| N. iscrizione albo | 81/A |
| Data iscrizione | 5 febbraio 2001 |
| Revisore legale | Sì |
| Telefono | 0875 85519 |

**Non pubblicato deliberatamente:** codice fiscale. È presente nella scheda pubblica
dell'albo ma non serve ad alcuna funzione del sito e amplifica inutilmente l'esposizione
di un dato personale.

---

## D. Produzione contenuti — dipendenze esterne

| ID | Voce | Nota |
|---|---|---|
| `FOTO_RITRATTO` | Ritratto professionale (2-3 pose, 1 orizzontale + 1 verticale) | **Mai generato o pesantemente ritoccato con AI** |
| `FOTO_STUDIO` | Ingresso/insegna, sala d'attesa, tavolo riunioni, dettagli | **Mai generate**: mostrare uffici inesistenti è pubblicità ingannevole |
| `FOTO_TERMOLI` | Hero: borgo antico, Castello Svevo, trabucchi, porto | Servizio fotografico o acquisto con licenza. **Mai prelevate dal web senza diritti** |
| `VIDEO_PRES` | Video di presentazione 60-90s | Facoltativo ma ad alto impatto su un servizio fiduciario |
| `LOGO` | Logo / immagine coordinata esistente o da creare | Se assente, la tipografia del nome fa da marchio (soluzione sobria e legittima) |

---

## E. Decisioni tecniche aperte

| ID | Voce | Stato |
|---|---|---|
| `HOSTING` | Vercel / provider italiano / altro | ⬜ da decidere |
| `DNS_MAIL` | Chi gestisce dominio e caselle | ⬜ da decidere |
| `CMS` | Se il professionista vuole modificare i testi da solo | ⬜ da decidere |
| `PRENOTA_BACKEND` | Motore della prenotazione appuntamenti (confermata in perimetro) | ⬜ da decidere — vedi `FASE-2-ARCHITETTURA.md` §5 |
| `BUDGET` | Budget e scadenza | ⬜ da decidere |

---

## F. ⚠️ Il dominio: collisione di nome accertata

Verificato il 2026-09-04.

**`studiomarinucci.it` NON è disponibile.** È registrato e attivo, con un sito già
online, e appartiene a un altro studio: quello di **Sonia Marinucci**, che si occupa di
finanza agevolata, europrogettazione, progettazione e formazione. Nameserver Netsons,
casella `info@studiomarinucci.it` già in uso.

Anche **`studiomarinucci.com`** risulta registrato e reindirizza a un sito attivo.

### Perché è un problema serio, non solo un fastidio

Non si tratta soltanto di trovare un altro indirizzo. Il cognome è lo stesso e i settori
sono **adiacenti**: consulenza alle imprese da una parte, finanza agevolata dall'altra.
Un cliente che cerca «Studio Marinucci» può facilmente finire sull'uno credendo di aver
trovato l'altro.

Ne discende una raccomandazione: **il dominio dovrebbe distinguere, non assomigliare**.
Un indirizzo che includa il nome proprio o la città allontana la confusione invece di
alimentarla. Va anche verificato se l'altro studio abbia registrato il proprio nome come
marchio, prima di adottare una denominazione molto simile.

Questo incide anche su `«TBD:DENOM»`: se la denominazione ufficiale scelta fosse
«Studio Marinucci» senza altre qualificazioni, il sito nascerebbe già in competizione
per il proprio nome con un soggetto che quel nome lo occupa online da prima.

### Alternative risultate libere alla verifica DNS

Nessun nameserver e nessun record SOA al 2026-09-04. **Da confermare presso un
registrar**: l'assenza di DNS è un indizio forte, non una prova di disponibilità.

- `massimomarinucci.it`
- `studiomassimomarinucci.it`
- `marinuccicommercialista.it`
- `commercialistamarinucci.it`
- `studiomarinuccitermoli.it`
- `marinuccistudio.it`
- `dottmarinucci.it`

### Stato nel codice

In attesa della scelta, `site.url` usa `https://dominio-da-registrare.invalid`. Il
dominio `.invalid` è riservato dalla RFC 2606 e non può risolvere ad alcun sito: se
finisse per errore in produzione non manderebbe visitatori sul sito di terzi. Anche
`wrangler.jsonc` è stato ripulito da ogni riferimento a `studiomarinucci.it`.

---

## Decisioni già prese (non riaprire senza motivo)

- ✅ Sede sul sito: **Via Madonna delle Grazie 25** (con conflitto d'albo aperto, vedi §A)
- ✅ Si procede con segnaposto tracciati; go-live bloccato dalla sezione A
- ✅ Perimetro: **nucleo essenziale + prenotazione appuntamenti**
  - ❌ fuori perimetro: area clienti riservata, newsletter, versione inglese
- ✅ Testi: bozze redatte da noi, **validazione finale del professionista obbligatoria**
