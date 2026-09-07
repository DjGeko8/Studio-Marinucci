# Sito dello Studio Marinucci

Sito del Dott. Massimo Marinucci, dottore commercialista e revisore legale a Termoli.

Questo documento è scritto per **chi deve aggiornare il sito, non per chi lo ha
costruito**. Le tre cose che cambiano spesso — scadenze, articoli, testi — si modificano
senza toccare il codice, e sono spiegate qui sotto passo per passo.

---

## ⛔ Prima di pubblicare: leggere questo

Il sito **non è pubblicabile allo stato attuale**. Mancano dati che solo il
professionista può fornire, e alcuni sono obbligatori per legge.

L'elenco completo è in [`docs/DATI-MANCANTI.md`](docs/DATI-MANCANTI.md). In sintesi
mancano: **partita IVA, PEC, numero di iscrizione al Registro dei Revisori Legali,
estremi della polizza RC professionale, orari di apertura** e la conferma della sede.

Ovunque un dato manchi, il sito mostra un segnaposto evidenziato in giallo del tipo
`«TBD:PIVA»`. Per verificare che non ne sia rimasto nessuno:

```bash
npm run verifica-segnaposto
```

Finché quel comando trova qualcosa, il sito non va online.

> ⚠️ **Conflitto sull'indirizzo, ancora aperto.** Il sito pubblica Via Madonna delle
> Grazie 25, ma l'albo ODCEC registra quell'indirizzo come *residenza* e indica come
> domicilio professionale Via Venezia 76. Va chiarito quale sia la sede reale e, se è la
> prima, aggiornata la posizione presso l'ordine. L'indirizzo compare in un solo punto
> del codice: `lib/site.ts`.

---

## Avviare il sito sul proprio computer

Serve [Node.js](https://nodejs.org) versione 20 o successiva.

La prima volta, e ogni volta che cambia l'elenco delle dipendenze:

```bash
npm install
```

Per vedere il sito mentre si lavora, all'indirizzo `http://localhost:8320`:

```bash
npm run dev
```

Per generare la versione da pubblicare:

```bash
npm run build
```

---

## Aggiornare lo scadenzario fiscale

**File da modificare:** `content/scadenze.ts`

È la pagina che porta più visite ricorrenti: tenerla aggiornata è la cosa a più alto
rendimento di tutto il sito.

Ogni scadenza è un blocco fatto così:

```ts
{
  data: '2026-12-16',
  titolo: 'Saldo IMU',
  descrizione: "Versamento della seconda rata dell'imposta municipale propria.",
  destinatari: ['privato', 'impresa', 'societa'],
  servizio: 'persone-fisiche',
},
```

- **`data`** va scritta come `anno-mese-giorno`, sempre con due cifre per mese e giorno.
  L'ordine in cui si scrivono le scadenze non conta: vengono ordinate da sole.
- **`destinatari`** decide in quali filtri la scadenza compare. I valori ammessi sono
  elencati in cima allo stesso file: `impresa`, `professionista`, `forfettario`,
  `societa`, `privato`, `sostituto`.
- **`servizio`** è facoltativo e collega la scadenza a un'area di attività. Deve
  corrispondere a uno slug presente in `content/servizi.ts`.

A inizio anno si cambia `annoScadenzario` e si sostituisce l'elenco con le date
dell'anno nuovo.

> Nel testo delle scadenze va **solo l'informazione**, mai una valutazione o un
> consiglio: lo scadenzario è informazione, non consulenza.

---

## Aggiungere un articolo

Servono **due passaggi**.

**1. Scrivere il testo.** Creare un file in `content/news/` chiamato come l'indirizzo che
si vuole ottenere, con estensione `.mdx`. Per esempio
`content/news/nuova-detrazione-2027.mdx` diventa la pagina
`/news/nuova-detrazione-2027`.

Dentro si scrive normalmente. Servono solo tre convenzioni:

```markdown
Un paragrafo si scrive così, con una riga vuota prima e dopo.

## Un titolo di sezione

Per il **grassetto** si usano due asterischi, per un [collegamento](https://esempio.it)
si scrive il testo tra parentesi quadre e l'indirizzo tra parentesi tonde.

- un elenco
- si fa con i trattini
```

Non serve ripetere la nota informativa in fondo: viene aggiunta automaticamente a ogni
articolo.

**2. Registrarlo.** Aprire `content/news/index.ts` e aggiungere una voce in cima
all'elenco:

```ts
{
  slug: 'nuova-detrazione-2027',
  titolo: 'Il titolo che comparirà in pagina',
  data: '2027-01-20',
  sommario: 'Due o tre righe che compaiono nell’elenco e nei risultati di ricerca.',
  servizio: 'persone-fisiche',
  lettura: 5,
},
```

Lo `slug` deve essere identico al nome del file, senza `.mdx`.

> **Sulla frequenza.** Meglio tre articoli utili all'anno che un blog abbandonato dopo
> due mesi: una sezione ferma da un anno comunica abbandono. Se gli articoli scendono
> sotto tre, la sezione si nasconde da sola.

---

## Correggere un testo delle pagine

| Cosa | Dove |
|---|---|
| Nome, indirizzo, telefono, email, PEC, orari, partita IVA | `lib/site.ts` |
| Aree di attività: titoli, descrizioni, domande frequenti | `content/servizi.ts` |
| Testi della home | `app/page.tsx` |
| Testo della pagina «Lo studio» | `app/studio/page.tsx` |
| Informativa privacy | `app/privacy/page.tsx` |
| Cookie policy | `app/cookie-policy/page.tsx` |
| Note legali | `app/note-legali/page.tsx` |

Nei file `.tsx` il testo da modificare è quello leggibile in italiano fra i tag. Se una
parola contiene un apostrofo va scritta come `l&apos;anno` anziché `l'anno`.

---

## Aggiungere o togliere un'area di attività

**File:** `content/servizi.ts`

⚠️ **Un'area elencata genera richieste.** Vanno indicate solo le attività effettivamente
prestate: un servizio non prestato ma pubblicizzato è una dichiarazione ingannevole.
Per togliere un'area si cancella il suo blocco — non si attenua la descrizione.

L'**ordine** dell'elenco è una scelta di posizionamento, non estetica: le prime sei aree
sono quelle che compaiono in home. Mettere per prime le due o tre più frequenti.

---

## Le fotografie

L'elenco degli spazi fotografici, con proporzioni, risoluzioni minime e note di ripresa,
è in [`content/media-manifest.json`](content/media-manifest.json). Uno spazio senza
immagine mostra un segnaposto grafico: il sito non si rompe mai per una fotografia
mancante, e le pagine non vanno toccate man mano che le foto arrivano.

### Inserire una fotografia

Due passaggi.

**1. Prepararla.** Lo strumento ritaglia al rapporto giusto, ridimensiona e genera le due
densità (@1x per schermi normali, @2x per quelli ad alta risoluzione):

```bash
python scripts/prepara-immagine.py foto-originale.jpg ritratto-verticale --definitiva
```

Gli slot disponibili sono gli `id` del manifesto. `--fuoco alto|centro|basso` decide
quale parte tenere quando l'immagine va tagliata in altezza — per un ritratto di solito
`alto`, così non si taglia la testa.

**2. Registrarla.** Aggiungere la voce in [`content/immagini.ts`](content/immagini.ts),
copiando la struttura di quelle già presenti. Il testo alternativo si scrive lì: descrive
l'immagine a chi non la vede, e non va lasciato generico.

### Fotografie provvisorie

Omettendo `--definitiva`, l'immagine viene marchiata con una fascia impressa
**«PROVVISORIA — NON PUBBLICABILE»** e salvata con il suffisso `-PROVVISORIA`.

Serve a valutare l'impaginazione con una foto vera invece che con un rettangolo grigio,
senza il rischio che quella foto finisca online. Le immagini di prova hanno l'abitudine
di sopravvivere fino alla pubblicazione proprio perché a schermo «sembra tutto finito»:
un avviso impresso nei pixel non si dimentica come si dimentica una riga in un file.

```bash
npm run verifica-immagini
```

esce con errore finché ne resta una in uso. `npm run verifica` esegue insieme questo
controllo e quello sui dati mancanti.

> ⚠️ **Lo strumento non toglie mai il watermark di una banca immagini.** Un ritaglio che
> lo facesse sparire produrrebbe una copia pulita di materiale non licenziato. Quando una
> provvisoria proviene da un'anteprima a pagamento, il watermark originale resta dov'è e
> il nostro se ne aggiunge sopra.

Le immagini definitive vanno in `public/immagini/` con il nome indicato nel manifesto.

**Tre divieti che non ammettono eccezioni:**

1. **Nessun ritratto generato o pesantemente ritoccato con l'intelligenza artificiale.**
   Rappresentare una persona reale con un'immagine sintetica su un sito che deve
   trasmettere affidabilità è autolesionistico, oltre che scorretto.
2. **Nessuna fotografia di ambienti inesistenti.** Mostrare uffici che non ci sono è
   pubblicità ingannevole.
3. **Nessuna fotografia presa dal web senza diritti.** Le immagini di Termoli si
   commissionano o si acquistano con licenza.

Nelle foto dello studio non devono essere leggibili documenti né nomi di clienti su
faldoni o schermi.

---

## Regole sui contenuti — perché certe cose non ci sono

Il sito di un iscritto a un ordine professionale è soggetto a limiti precisi sulla
comunicazione informativa (art. 4 DPR 137/2012, codice deontologico ODCEC). Da qui alcune
assenze volute, che **non vanno colmate**:

- niente contatori di clienti, pratiche o «anni di esperienza» in evidenza;
- niente recensioni, testimonianze o casi di studio, nemmeno anonimizzati se
  ricostruibili;
- niente confronti, espliciti o impliciti, con altri professionisti;
- niente promesse di risultato in qualunque formulazione;
- niente calcolatori d'imposta o simulatori di risparmio fiscale;
- niente chatbot che rispondano a domande fiscali;
- niente linguaggio d'urgenza, conti alla rovescia o sconti;
- non ci si presenta come «specialista» senza un titolo riconosciuto: si indicano
  l'attività prevalente e le materie trattate.

Titolo, ordine di appartenenza e numero di iscrizione compaiono nel footer di ogni
pagina: non alleggerire quella sezione.

---

## Pubblicare su Cloudflare

Il sito è configurato per **Cloudflare Workers tramite OpenNext**, che è la strada
raccomandata da Cloudflare per Next.js. Tutta la configurazione sta in due file:
`wrangler.jsonc` e `open-next.config.ts`.

> Perché non l'esportazione statica, che sembrerebbe più semplice: romperebbe due cose.
> La ricezione dei moduli, che è una funzione server, e gli **header di sicurezza**
> definiti in `next.config.mjs`, che senza un server non vengono applicati e andrebbero
> riscritti in un secondo file destinato a divergere dal primo.

### Comandi

```bash
npm run build        # compila il sito E il pacchetto per Workers
npm run cf:preview   # lo esegue in locale nel runtime vero di Cloudflare
npm run cf:deploy    # pubblica
npm run cf:tipi      # rigenera i tipi dei binding dopo aver toccato wrangler.jsonc
```

`npm run build` fa entrambe le cose: `next build` produce il sito, e subito dopo npm
esegue da solo lo script `postbuild`, che ne ricava il pacchetto per Cloudflare.

> **Perche' e' fatto cosi'.** La pubblicazione automatica di Cloudflare esegue
> `npm run build` per convenzione. Se il pacchetto per Workers si producesse con un
> comando separato, bisognerebbe ricordarsi di configurarlo nel pannello — e alla prima
> dimenticanza il deploy fallirebbe con «Could not find compiled Open Next config».
> Legandolo a `postbuild`, il repository funziona con le impostazioni predefinite di
> qualunque sistema di pubblicazione.

`npm run dev` resta il modo normale di lavorare tutti i giorni. `cf:preview`
serve prima di pubblicare, perché il runtime di Cloudflare non è Node.js e qualcosa può
comportarsi diversamente.

> ⚠️ **Su Windows OpenNext avverte di non essere pienamente compatibile.** La compilazione
> funziona, ma per le pubblicazioni vere conviene usare WSL o una macchina Linux — vale a
> maggior ragione se un domani la pubblicazione passerà da un servizio automatico.

### Primo avvio, nell'ordine

1. **Registra il dominio** e porta la zona su Cloudflare. Verifica se `.it` è tra le
   estensioni del registrar Cloudflare; in caso contrario registralo altrove e punta i
   nameserver a Cloudflare — funziona identico.
2. **Abilita l'invio email** sul dominio, una volta sola:
   ```bash
   npx wrangler email sending enable IL-TUO-DOMINIO.it
   ```
3. **Compila `MAIL_DESTINATARIO`** in `wrangler.jsonc` con la casella dello studio, e
   controlla che `MAIL_MITTENTE` usi il dominio appena abilitato.
4. **Pubblica**: `npm run cf:deploy`. Il sito risponde subito su `*.workers.dev`.
5. **Collega il dominio**: togli il commento a `routes` in `wrangler.jsonc` e ripubblica.
6. **Aggiungi la regola antispam di bordo** (vedi sotto).
7. **Prova il modulo con un invio vero** e verifica che l'email arrivi davvero.

### La regola di rate limiting va messa a mano

Nel pannello Cloudflare, in **Security → WAF → Rate limiting rules**, crea una regola sul
percorso `/api/contatti`: qualcosa come 5 richieste all'ora per indirizzo IP.

Non è un dettaglio rimandabile. Il contatore in `lib/rate-limit.ts` **su Workers vale
poco**: le istanze sono effimere e distribuite fra i data center, quindi ognuna conta per
conto proprio e il limite effettivo è molto più alto di quello dichiarato. Non è un difetto
del codice — è che quel controllo, su questa architettura, appartiene al bordo della rete.
Il contatore resta come seconda barriera e per lo sviluppo locale.

## Attivare il modulo di contatto

Il modulo funziona ed è protetto dallo spam, ma **finché la casella dello studio non è
configurata non recapita nulla**: le richieste restano nei log del server e chi scrive
riceve comunque conferma a schermo — il disservizio è nostro, non suo.

Su Cloudflare l'invio usa **Cloudflare Email Service** tramite il binding `EMAIL`: nessuna
chiave API da custodire e nessun fornitore terzo da nominare nell'informativa oltre a
Cloudflare stessa. Serve solo che il dominio sia abilitato (punto 2 qui sopra) e che
`MAIL_DESTINATARIO` sia compilato.

Le email arrivano con il **rispondi-a** impostato sull'indirizzo di chi ha scritto: si
risponde direttamente dalla casella, senza copiare indirizzi a mano.

Se un domani il sito si spostasse altrove, la logica di invio è isolata in `lib/mail.ts`
e degrada da sola: senza il binding registra nei log invece di rompersi.

---

## Prenotazione appuntamenti

La pagina `/appuntamento` raccoglie **una richiesta**, non prenota automaticamente un
orario: l'utente indica due o tre preferenze e lo studio conferma.

È una scelta voluta. Un calendario automatico non allineato con l'agenda reale conferma
orari già occupati, e una doppia prenotazione costa più fiducia di quanta ne guadagni la
comodità.

Se in futuro il professionista collegherà la propria agenda a un servizio di
prenotazione, quel servizio è di terze parti: andrà caricato **solo dopo il consenso ai
contenuti esterni**, come già avviene per la mappa, e il suo dominio andrà aggiunto alla
`Content-Security-Policy` in `next.config.mjs`.

---

## Cosa fare prima di andare online

- [ ] Tutti i dati di [`docs/DATI-MANCANTI.md`](docs/DATI-MANCANTI.md) §A raccolti
- [ ] `npm run verifica` (segnaposto + immagini) non trova più nulla
- [ ] Sede confermata e, se necessario, domicilio professionale aggiornato all'ordine
- [ ] Elenco delle aree di attività confermato dal professionista
- [ ] Tutti i testi validati dal professionista
- [ ] Email su dominio proprio attiva, al posto di quella `@virgilio.it`
- [ ] Fotografie reali al posto dei segnaposto
- [ ] `npm run verifica-immagini` non trova più provvisorie in uso
- [ ] File `-PROVVISORIA` cancellati da `public/immagini/`
- [ ] Coordinate della sede rilevate e inserite in `lib/site.ts` (attivano la mappa)
- [ ] Informativa privacy verificata da chi assiste lo studio sulla protezione dei dati
- [ ] Modulo di contatto collegato a una casella reale e **provato con un invio vero**
- [ ] Dominio registrato, HTTPS attivo, `site.url` aggiornato in `lib/site.ts`
- [ ] Invio email abilitato sul dominio (`wrangler email sending enable`)
- [ ] `MAIL_DESTINATARIO` compilato in `wrangler.jsonc`
- [ ] Regola di rate limiting del WAF attiva su `/api/contatti`
- [ ] Cloudflare inserita fra i responsabili del trattamento in `/privacy`, con DPA firmato
- [ ] **Google Business Profile creato e ottimizzato**, con nome, indirizzo e telefono
      identici a quelli del sito. Per uno studio locale pesa quanto il sito stesso
- [ ] Sitemap inviata a Google Search Console

---

## Dettagli tecnici

Next.js 16 (App Router) con TypeScript e Tailwind CSS. Il sito è **statico**: tutte le
pagine sono generate in fase di compilazione, tranne la ricezione dei moduli.

- **Nessuna richiesta a terzi.** I caratteri tipografici sono nel repository
  (`app/fonts/`), non scaricati da Google. L'unico contenuto esterno è la mappa, caricata
  solo dopo consenso.
- **Design token centralizzati** in `tailwind.config.ts`. Non scrivere colori o misure
  direttamente nei componenti: si aggiunge un token e gli si dà un nome.
- **Header di sicurezza** e Content-Security-Policy in `next.config.mjs`. Non allargare
  la CSP «per provare».
- **La compilazione usa webpack** (`next build --webpack`) anziché Turbopack, che su
  macchine con poca memoria libera si interrompe. Su un server con più memoria si può
  usare `npm run build:turbopack`, che è più veloce.
- I caratteri provengono dai pacchetti `@fontsource` (licenza SIL Open Font License).
  Per aggiornarli si ricopiano i file `.woff2` da `node_modules/@fontsource/` in
  `app/fonts/`.

### Struttura delle cartelle

```
app/           le pagine del sito
components/    gli elementi riutilizzabili (intestazione, footer, moduli)
content/       i testi che cambiano: servizi, scadenze, articoli
docs/          documenti di progetto e dati mancanti
lib/           dati dello studio e funzioni di servizio
public/        immagini e file scaricabili
```

### Documenti di progetto

- [`docs/FASE-2-ARCHITETTURA.md`](docs/FASE-2-ARCHITETTURA.md) — struttura del sito e
  scelte editoriali, con le ragioni dietro ciascuna
- [`docs/BOZZE-TESTI.md`](docs/BOZZE-TESTI.md) — testi proposti, da validare
- [`docs/DATI-MANCANTI.md`](docs/DATI-MANCANTI.md) — registro dei segnaposto

### Pagina interna

`/showcase` mostra colori, caratteri e componenti del sito. Non fa parte del sito
pubblico ed è esclusa dai motori di ricerca. Può restare: è innocua.
