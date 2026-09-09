---
name: console-studio-marinucci
description: Console di amministrazione del sito Studio Marinucci (/admin) — autenticazione, variabili d'ambiente su Cloudflare Workers, archivio su GitHub. Usa questa skill ogni volta che si tocca il login o la console, che si aggiunge una sezione modificabile, che si configurano ADMIN_EMAIL / ADMIN_PASSWORD_HASH / ADMIN_SESSION_SECRET / GITHUB_TOKEN / GITHUB_REPO, o che compare uno di questi sintomi sul sito pubblicato — «La console non è ancora configurata», «Non è stato possibile contattare il server», errore 500 dal corpo vuoto, «no such file or directory /bundle/...», «Lettura da GitHub non riuscita (401)», variabili che spariscono dopo un rilascio, o una correzione che sembra non avere effetto. Contiene la diagnosi già fatta di nove trappole che hanno richiesto ore: leggerla prima di indagare da capo fa risparmiare tempo.
---

# Console di amministrazione — Studio Marinucci

Pannello a `/admin` da cui il professionista aggiorna scadenzario, aree di attività e
approfondimenti. Questa skill raccoglie l'impianto e — soprattutto — le trappole già
pagate: sono tutte silenziose, e ognuna produce un sintomo che sembra dire un'altra cosa.

**Se stai indagando su un sintomo, vai subito a
[`references/trappole.md`](references/trappole.md).** C'è una tabella
sintomo → causa → rimedio che copre quasi tutto quello che può andare storto.

## L'impianto in breve

**Niente database.** Al salvataggio la console scrive i file di contenuto tramite l'API
di GitHub e crea un commit; Cloudflare ricompila. Le modifiche compaiono in un minuto o
due invece che subito, e in cambio il sito resta interamente statico, non c'è nulla da
difendere in lettura, e ogni modifica resta nella cronologia — si vede chi ha cambiato
cosa e si torna indietro con un `git revert`.

| Pezzo | Dove |
|---|---|
| Autenticazione | `lib/admin/auth.ts` |
| Lettura e scrittura dei contenuti | `lib/admin/archivio.ts` |
| Protezione dei testi scritti in console | `lib/admin/mdx.ts` |
| Controllo dei salvataggi dei testi di pagina | `lib/admin/valida-pagine.ts` |
| Lingua dei testi modificabili (grassetto, link, campi) | `lib/testo-ricco.ts` |
| Cancello e contorno | `app/(console)/admin/layout.tsx` |
| Rotte di servizio | `app/api/admin/*/route.ts` |
| Interfaccia | `components/admin/*.tsx` |

**Il controllo dell'accesso sta nel layout, non nelle singole pagine.** Una sezione nuova
è protetta per il fatto di esistere sotto `/admin`, non perché qualcuno si è ricordato di
aggiungerci il controllo: è la differenza fra una protezione e un'abitudine.

**Due radici separate.** `app/layout.tsx` non esiste: le pagine stanno in `app/(sito)/` e
`app/(console)/`, ognuna col proprio layout. Serve perché la console non erediti barra dei
contatti, navigazione, footer con i dati d'albo e banner dei cookie — elementi rivolti a
chi visita il sito, non a chi ci lavora dentro. In Next.js è radice ogni layout che non ne
ha un altro sopra.

## Le variabili, e la regola che le governa

| Variabile | Serve a | Senza |
|---|---|---|
| `ADMIN_EMAIL` | identificare l'unico utente | la console non si apre |
| `ADMIN_PASSWORD_HASH` | `iterazioni:salt:impronta` | la console non si apre |
| `ADMIN_SESSION_SECRET` | firmare il cookie di sessione, ≥32 caratteri | la console non si apre |
| `GITHUB_TOKEN` | scrivere i contenuti | si entra ma non si legge né si salva |
| `GITHUB_REPO` | `proprietario/repository` | idem |

> **Impostale tutte come «Secret», mai come «Text».** Le variabili in chiaro dichiarate
> in `wrangler.jsonc` sostituiscono a ogni rilascio quelle del pannello: una aggiunta
> come Text sparisce al primo deploy successivo, in silenzio. Per questo `wrangler.jsonc`
> **non dichiara alcun blocco `vars`**, e non va rimesso — nemmeno con valori vuoti,
> nemmeno «solo per documentare i nomi». Due segnaposto vuoti sono bastati a cancellare
> `GITHUB_TOKEN` e avrebbero cancellato `MAIL_DESTINATARIO` il giorno del primo invio
> email, facendo smettere di recapitare il modulo di contatto senza dirlo a nessuno.

Generazione e caricamento:

```bash
npm run admin:password                    # chiede email e password
npm run admin:password -- --temporanee    # ne inventa di provvisorie
npm run admin:imposta                     # le carica su Cloudflare (dopo `npx wrangler login`)
npx wrangler secret list                  # verifica cosa risulta davvero sul Worker
```

`npm run admin:imposta` esiste perché i valori passino dal file al Worker **senza
attraversare gli appunti**: un'impronta di 104 caratteri si tronca con facilità, e un
troncamento si maschera da «password non corretta».

## Perché le iterazioni di PBKDF2 sono solo 8.000

I Worker del piano gratuito hanno **10 ms di CPU per richiesta**. Misurato: 210.000
iterazioni ne costano circa 97, e l'accesso restituiva 500 con il corpo vuoto — il Worker
veniva terminato a metà del calcolo. A 8.000 siamo intorno ai 3 ms.

Ottomila è molto sotto le raccomandazioni correnti, e vale la pena essere precisi su cosa
si perde. Le iterazioni rendono costoso il tentativo a forza bruta su un'impronta
**trapelata**, e contano soprattutto per le password scelte da una persona, che hanno poca
entropia. Su una password casuale di 24 caratteri il numero di iterazioni è quasi
irrilevante: lo spazio da esplorare resta fuori portata comunque.

Da qui la contropartita, che **non è facoltativa**: minimo 16 caratteri per le password
scelte a mano, 24 casuali per quelle generate. Se qualcuno abbassa quel minimo, il
compromesso non regge più.

Su un piano a pagamento il limite di CPU è configurabile fino a 5 minuti: si alzano
`ITERAZIONI_PREDEFINITE` e `ITERAZIONI_MASSIME` in `lib/admin/auth.ts`, si aggiunge
`"limits": { "cpu_ms": 200 }` in `wrangler.jsonc`, e si rigenera l'impronta.

**Regola che generalizza:** qualunque calcolo pesante in una rotta va misurato contro i
10 ms prima di darlo per buono. Il sintomo di uno sforamento non è un messaggio d'errore
leggibile, è un 500 muto.

## Le scelte di sicurezza, e perché

Se le tocchi, sappi cosa stai togliendo.

- **L'impronta della password non sta nel repository.** In `ADMIN_PASSWORD_HASH` va il
  risultato di `npm run admin:password`. Chi legge il codice sorgente non ricava nulla.
- **La sessione è un cookie firmato**, non un identificativo da cercare in un archivio: il
  sito non ha un database e non deve acquisirne uno per questo.
- **I confronti di firma sono a tempo costante.** Con `===` la durata dipende da quanti
  caratteri iniziali coincidono, e da quella differenza si ricostruisce una firma valida
  un carattere alla volta.
- **L'errore di accesso è sempre lo stesso** per email inesistente e password sbagliata:
  distinguerli direbbe a un estraneo quali indirizzi sono validi. La password viene
  verificata anche quando l'email non corrisponde, così il tempo di risposta non rivela
  nulla.
- **Senza le variabili la console si dichiara non configurata e non fa entrare nessuno.**
  Un pannello che si apre perché una variabile è vuota è il modo peggiore di sbagliare.
- **Il limite dei tentativi in `lib/rate-limit.ts` vale poco su Workers**: gli isolate
  sono effimeri e distribuiti, ognuno conta per conto proprio. Il limite vero va messo
  come regola di rate limiting del WAF su `/api/admin/` e `/api/contatti`.

## Cosa si lascia modificare, e cosa no

Scadenzario, aree di attivita', approfondimenti e i testi discorsivi delle pagine si
modificano dalla console. **I dati obbligatori no**, di proposito: partita IVA, PEC,
numero d'iscrizione all'albo, estremi della polizza (art. 5 DPR 137/2012), titolare del
trattamento (artt. 13-14 GDPR). Restano in `lib/site.ts`, stampati dalle pagine.

Il criterio, che vale anche per le sezioni future: **un campo di testo libero e' il posto
sbagliato per un'informazione che non puo' mancare.** Li' una riga si cancella per
distrazione e non se ne accorge nessuno finche' non lo fa notare chi ha motivo di
controllare. Da un modulo di configurazione si cancella solo di proposito, e il conteggio
dei segnaposto se ne accorge comunque.

Da qui discendono tre meccanismi in `content/pagine.ts`:

- **le sezioni previste** (`STRUTTURA[chiave].sezioni`) non si possono eliminare: sono
  quelle a cui la pagina affianca un blocco di dati. Toglierne una porterebbe via il
  blocco insieme al testo;
- **nascondere** e' concesso solo dove `opzionale: true` lo dichiara — oggi la sola
  sezione «Incarichi»;
- **aggiungere** e' concesso solo dove `sezioniLibere: true` (le pagine legali, che nel
  tempo crescono) e non dove l'impaginazione assegna a ogni sezione un posto accanto a
  una fotografia («Lo studio»).

Le `ancore` nelle pagine legano un blocco di dati alla sezione che lo introduce: il testo
si puo' riordinare e riscrivere, il blocco lo segue. Vedi
`components/SezioniPagina.tsx`.

**I campi automatici `{{...}}`** (`lib/testo-ricco.ts`) servono a citare un dato dentro
una frase senza copiarlo: scritto a mano, il giorno in cui cambia resta indietro in
silenzio. Sono anche il motivo per cui la lingua dei testi e' minuscola — grassetto,
collegamenti, campi e nient'altro: ogni costrutto in piu' sarebbe una superficie in piu'
da controllare, e il testo non diventa mai HTML ma elementi React.

## Aggiungere una sezione modificabile

Lo schema è sempre lo stesso, ed è già stato percorso tre volte (scadenzario, aree di
attività, approfondimenti).

1. **Porta i contenuti fuori dal TypeScript.** Un modulo `.ts` non si modifica da
   un'interfaccia web senza fragilità: i dati vanno in `content/dati/<nome>.json`, e il
   `.ts` conserva tipi, funzioni e una validazione che fa fallire la compilazione con un
   messaggio chiaro. Il JSON sarà scritto da chi non conosce il codice: **la build deve
   fare da cancello e chiudersi rumorosamente**, non lasciar passare una pagina rotta.
2. **Rotta `app/api/admin/<nome>/route.ts`** con `GET` e `PUT`, entrambi dietro
   `sessioneValida`. Valida di nuovo qui, prima di scrivere: un errore intercettato nella
   rotta si spiega a chi ha premuto «salva», un errore in compilazione finisce nei log di
   Cloudflare, lontanissimo da lui.
3. **Componente client** in `components/admin/`, con salvataggio esplicito. Niente
   salvataggio automatico: su un archivio che crea un commit a ogni scrittura produrrebbe
   decine di commit per una sessione di lavoro e renderebbe illeggibile la cronologia.
4. **Pagina** in `app/(console)/admin/<nome>/page.tsx` e voce in
   `components/admin/NavConsole.tsx`.

**Se la sezione scrive testo in un file `.mdx`**, fallo passare da `proteggiPerMdx` in
scrittura e `ripristinaDaMdx` in lettura. In MDX `{` apre un'espressione e `<` apre un
elemento: «un aumento < 5%» scritto in console fa fallire la compilazione, e da quel
momento il sito non si aggiorna più. Si protegge invece di rifiutare, perché a chi scrive
un testo professionale non si spiega che certi caratteri sono vietati per ragioni tecniche
che non lo riguardano.

**Per scrivere più file insieme** usa `scriviDocumenti`, che passa dall'API Git di GitHub
e crea un commit solo. Con due chiamate separate si otterrebbero due commit, due
ricompilazioni e — peggio — un istante in cui esiste il metadato di un contenuto il cui
testo non c'è ancora, e la compilazione fallisce.

## Prima di inviare una modifica

```bash
npm run verifica    # tipi + prove + dati mancanti + fotografie
```

`npm run prova-pagine` gira da solo, senza accesso e senza modulo web, perche' il
controllo dei salvataggi sta in un modulo a parte apposta. Un controllo che si puo'
verificare **solo** compilando un modulo e premendo «salva» non viene verificato quasi
mai — e quello che protegge sono dati che la legge impone di pubblicare.

Il controllo dei tipi è nell'elenco perché è ciò che ha fatto fallire due compilazioni di
fila. Se va in errore di memoria, **la cosa giusta è liberare memoria e rifarlo**, non
inviare sperando: chiudere i processi `node` orfani dei server di sviluppo libera in
genere 700 MB.

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -like '*studio-marinucci*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

## Il metodo che ha funzionato

Tre cause diverse si sono mascherate a vicenda per ore, ognuna producendo un messaggio che
sembrava indicarne un'altra. Quello che ha sbloccato la situazione non è stato indovinare
meglio, ma **rendere i messaggi diagnostici**: invece di «mancano le variabili», dire
quale manca e perché; invece di «non riuscita (401)», distinguere token, permessi e
repository.

Quando un sintomo è ambiguo, la mossa migliore è quasi sempre far parlare il programma —
`diagnosiConsole()` in `lib/admin/auth.ts` è l'esempio da imitare. Non mostra mai un
valore: solo se arriva, e per i valori lunghi quanti caratteri ha, che è precisamente il
dato che serve a scoprire un troncamento.
