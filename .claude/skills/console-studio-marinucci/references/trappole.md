# Le trappole, e come riconoscerle

Sette problemi incontrati davvero mettendo in funzione la console. Hanno in comune una
cosa: **falliscono in silenzio o con un messaggio che indica il posto sbagliato.**

## Tabella rapida

| Sintomo | Causa | Rimedio |
|---|---|---|
| «La console non è ancora configurata» | manca una delle tre `ADMIN_*` | la pagina elenca quale — [§1](#1) |
| Configurata prima, non configurata dopo un rilascio | variabile salvata come «Text» | rimetterla come **Secret** — [§2](#2) |
| «Non è stato possibile contattare il server» / 500 dal corpo vuoto | superati i 10 ms di CPU | [§3](#3) |
| «no such file or directory `/bundle/...`» | manca `GITHUB_TOKEN`; un Worker non ha disco | [§4](#4) |
| «Lettura da GitHub non riuscita (401 / 403 / 404)» | token, permessi, repository — tre cose diverse | [§5](#5) |
| Una correzione sembra non avere effetto | «Retry» ricompila il commit vecchio | [§6](#6) |
| Rettangoli grigi al posto delle foto sul sito pubblicato | sondaggio del filesystem in un componente | [§7](#7) |
| Segreti dentro il pacchetto pubblicato | `.env.local` presente alla compilazione | [§8](#8) |

---

<a id="1"></a>
## 1. Diagnosi per singola variabile

`configurazioneConsole()` restituisce `null` se manca *anche solo una* delle tre, e per
mesi il messaggio è stato lo stesso in tutti i casi. A chi le ha appena impostate tutte,
«mancano le variabili» fa pensare a un problema di Cloudflare mentre magari il segreto di
sessione è solo stato incollato a metà.

`diagnosiConsole()` distingue: assente, email senza `@`, impronta con la forma sbagliata,
impronta incompleta (dice `salt 32/32, impronta 30/64`), segreto troppo corto (dice quanti
caratteri ha).

**La lacuna che si è rivelata più costosa:** controllare che l'impronta avesse *tre pezzi
separati da due punti* non basta. Un valore incollato a metà conserva i due punti, passa il
controllo e fallisce solo al confronto finale — apparendo come «password non corretta».
Chi lo subisce cambia password all'infinito senza sapere che il problema è altrove. Vanno
controllate anche le lunghezze: salt 32, impronta 64, esadecimali.

<a id="2"></a>
## 2. Variable contro Secret

**Il più insidioso di tutti**, perché il sistema funziona e poi smette senza che nessuno
abbia toccato nulla.

Le variabili in chiaro dichiarate in `wrangler.jsonc` sostituiscono a **ogni rilascio**
l'intero elenco delle variabili in chiaro del Worker. Una variabile aggiunta dal pannello
come «Text» e non presente nel file sparisce al primo deploy.

`wrangler.jsonc` dichiarava `MAIL_DESTINATARIO: ""` e `MAIL_MITTENTE: ""` — due segnaposto
vuoti, messi per documentare i nomi. Tanto è bastato.

**Come si riconosce:** qualcosa funzionava, c'è stato un rilascio, ha smesso. Se alcune
variabili sopravvivono e altre no, le prime erano Secret e le seconde Variable.

**Rimedio:** tutte come **Secret**, e nessun blocco `vars` in `wrangler.jsonc` — nemmeno
vuoto, nemmeno «solo per documentare».

<a id="3"></a>
## 3. Dieci millisecondi di CPU

I Worker del piano gratuito hanno 10 ms di CPU per richiesta. Sforarli non produce un
errore leggibile: produce **500 con il corpo vuoto**, che nel browser diventa «Non è stato
possibile contattare il server» perché la risposta non è JSON.

Misurato su questa base di codice:

| Iterazioni PBKDF2 | Tempo |
|---|---|
| 8.000 | ~3 ms |
| 10.000 | ~4 ms |
| 25.000 | ~10 ms |
| 210.000 | ~97 ms |

**Come si riconosce:** 500 senza `content-type` e senza corpo, in poche centinaia di
millisecondi. Un errore applicativo restituisce JSON; questo no.

**Rimedio:** misurare, non stimare. E mettere un tetto a ciò che si accetta di calcolare
(`ITERAZIONI_MASSIME`): un'impronta creata con troppe iterazioni viene rifiutata prima, con
un messaggio, invece di far morire il Worker.

<a id="4"></a>
## 4. Un Worker non ha un disco

`lib/admin/archivio.ts` ripiega sul filesystem quando GitHub non è configurato. In
sviluppo funziona; sul sito pubblicato `process.cwd()` vale `/bundle` e ogni lettura
fallisce con «no such file or directory».

L'errore arrivava all'utente così com'era — un percorso incomprensibile che non diceva la
cosa importante: **manca `GITHUB_TOKEN`**.

**Rimedio:** lettura e scrittura intercettano l'errore e spiegano che il ripiego sui file
locali vale soltanto in sviluppo. Gli avvisi nella console non devono dire «modalità
locale» in tono rassicurante: su un sito pubblicato quel modo non può funzionare.

<a id="5"></a>
## 5. I tre codici di GitHub

Confonderli manda a cercare nel posto sbagliato.

| Codice | Significa | Da controllare |
|---|---|---|
| **401** | il token non è valido | scaduto, revocato, o incollato incompleto |
| **403** | token valido, permessi insufficienti | serve «Contents: Read and write»; se è fine-grained, che il repository sia fra quelli selezionati |
| **404** | repository non trovato | `GITHUB_REPO` nella forma `proprietario/repository`; **su un repository privato GitHub risponde 404 invece di 403**, per non rivelare che esiste |

Quell'ultima riga è la meno intuitiva: un 404 può essere un problema di permessi
travestito da errore di battitura.

<a id="6"></a>
## 6. «Retry» ricompila il commit vecchio

Premere «Retry» su una build fallita ricompila **lo stesso commit**, non l'ultimo. La
correzione appena inviata sembra non avere effetto, e l'errore si ripete identico — stessa
riga, stessa colonna.

**Come si riconosce:** l'errore cita una riga dove, nel codice attuale, c'è qualcos'altro.
Verificalo:

```bash
git rev-parse --short HEAD
git rev-parse --short origin/main
git show origin/main:<file> | sed -n '<riga>p'
```

**Rimedio:** un nuovo push, oppure «Create deployment» / «Deploy latest commit».

<a id="7"></a>
## 7. Non sondare il filesystem dentro un componente

`components/Foto.tsx` verificava con `existsSync` che il file esistesse in `public/` e, non
trovandolo, ripiegava sul segnaposto grafico. Sembrava prudente ed era stato provato.

Poi è arrivato `output: 'standalone'` per OpenNext, e in quella modalità la generazione
delle pagine non parte dalla posizione che il controllo assumeva: sulla macchina di
compilazione di Cloudflare rispondeva «il file non c'è». **Il sito è andato online con i
rettangoli grigi al posto delle fotografie, con i file regolarmente al loro posto e senza
che nulla lo segnalasse.**

**Come si riconosce:** `x-nextjs-prerender: 1` sulla risposta (l'HTML è cotto in fase di
build) mentre i file richiesti rispondono 200.

**Rimedio, e la regola che ne discende:** il controllo è stato spostato in
`scripts/verifica-file-immagini.mjs`, che gira come `prebuild` e **ferma la compilazione**
elencando i file mancanti. Un controllo che si accorge del problema e lo nasconde è peggio
di uno che si ferma.

<a id="8"></a>
## 8. `.env.local` finisce nel pacchetto

L'adattatore OpenNext copia le variabili d'ambiente presenti alla compilazione dentro
`.open-next/cloudflare/next-env.mjs`. Chi compila in locale e poi lancia `cf:deploy`
pubblica la propria password dentro il codice del Worker, leggibile da chiunque ne ottenga
una copia.

I Secret del pannello continuano a funzionare — l'adattatore applica prima quelli della
piattaforma e usa i valori compilati solo per riempire i buchi — quindi **il sito non dà
segno di nulla**.

**Rimedio:** `npm run cf:deploy` passa da `scripts/verifica-segreti.mjs`, che legge il file
generato e si rifiuta di pubblicare se le variabili sensibili non sono vuote. Non stampa
mai i valori, solo la loro lunghezza.

---

## Il filo comune

Sette problemi, un'unica morale: **ognuno falliva in modo silenzioso o fuorviante.**

Il tempo non se n'è andato a scrivere le correzioni — quelle sono poche righe ciascuna. Se
n'è andato a capire *quale* dei sette stesse parlando, perché i sintomi si somigliavano e
si mascheravano a vicenda.

Quello che ha sbloccato la situazione è stato, ogni volta, **rendere il programma esplicito
su ciò che sa**: quale variabile manca e perché, quale dei tre codici GitHub è arrivato,
quanti caratteri ha un valore che sembrava giusto. Prima di indagare più a fondo su un
sintomo ambiguo, conviene chiedersi se il programma non possa semplicemente dirlo.
