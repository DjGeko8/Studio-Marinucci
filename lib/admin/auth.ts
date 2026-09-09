/**
 * Autenticazione della console.
 *
 * Un solo utente: il professionista. Niente registrazione, niente recupero
 * password via email, niente ruoli — tutte cose che aggiungerebbero superficie
 * d'attacco a un pannello usato da una persona sola.
 *
 * SCELTE, E PERCHÉ
 *
 * — La password non sta mai nel repository. In `ADMIN_PASSWORD_HASH` va il
 *   risultato di `npm run admin:password`, cioè `iterazioni:salt:hash` in esadecimale.
 *   Chi legge il codice sorgente non ricava la password.
 *
 * — La derivazione usa PBKDF2-SHA256 con 210.000 iterazioni: rende il tentativo a
 *   forza bruta costoso anche se un giorno l'hash trapelasse.
 *
 * — La sessione è un cookie firmato, non un identificativo da cercare in un
 *   archivio: il sito non ha un database e non deve acquisirne uno per questo.
 *   Il cookie contiene la scadenza e una firma HMAC; se qualcuno lo modifica, la
 *   firma non torna.
 *
 * — I confronti di firma sono a tempo costante. Con `===` la durata del confronto
 *   dipende da quanti caratteri iniziali coincidono, e da quella differenza si può
 *   ricostruire una firma valida un carattere alla volta.
 *
 * — L'errore di accesso è sempre lo stesso, sia che l'email non esista sia che la
 *   password sia sbagliata: dire «email inesistente» confermerebbe a un estraneo
 *   quali indirizzi sono validi.
 */

/**
 * ITERAZIONI DI PBKDF2 — un compromesso imposto dalla piattaforma, non una svista.
 *
 * I Worker del piano gratuito hanno 10 ms di CPU per richiesta. Misurato: 210.000
 * iterazioni costano circa 97 ms, e infatti l'accesso restituiva 500 con il corpo
 * vuoto — il Worker veniva terminato a metà. A 8.000 iterazioni siamo intorno ai
 * 3 ms, che lascia margine per il resto della richiesta.
 *
 * Ottomila è molto sotto le raccomandazioni correnti, che per PBKDF2-SHA256 parlano
 * di centinaia di migliaia. Vale la pena essere precisi su cosa si perde: le
 * iterazioni servono a rendere costoso il tentativo a forza bruta su un'impronta
 * TRAPELATA, e contano soprattutto per le password scelte da una persona, che hanno
 * poca entropia. Su una password casuale di 24 caratteri il numero di iterazioni è
 * quasi irrilevante: lo spazio da esplorare resta fuori portata comunque.
 *
 * Da qui la contropartita, che non è facoltativa: **la password dev'essere lunga e
 * casuale**. `npm run admin:password` ne genera una di 24 caratteri, e il minimo
 * accettato per quelle scelte a mano è salito a 16.
 *
 * Su un piano Workers a pagamento il limite di CPU è configurabile fino a 5 minuti
 * (`limits.cpu_ms` in wrangler.jsonc): lì si può tornare a 210.000 e alzare di nuovo
 * l'asticella. Vedi il README.
 */
const ITERAZIONI_PREDEFINITE = 8_000

/**
 * Oltre questa soglia si rifiuta di verificare.
 *
 * Un'impronta creata prima di questo cambiamento chiede 210.000 iterazioni, e
 * tentare di verificarla farebbe morire il Worker con un 500 dal corpo vuoto —
 * illeggibile per chi sta solo provando a entrare. Meglio dire chiaramente che va
 * rigenerata.
 */
const ITERAZIONI_MASSIME = 20_000
const DURATA_SESSIONE_MS = 12 * 60 * 60 * 1000 // 12 ore
export const COOKIE_SESSIONE = 'sm_console'

const codificatore = new TextEncoder()

function esadecimale(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function daEsadecimale(testo: string): Uint8Array {
  const byte = new Uint8Array(testo.length / 2)
  for (let i = 0; i < byte.length; i++) {
    byte[i] = Number.parseInt(testo.slice(i * 2, i * 2 + 2), 16)
  }
  return byte
}

/** Confronto a tempo costante: la durata non dipende da dove cade la differenza. */
function ugualiATempoCostante(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let differenza = 0
  for (let i = 0; i < a.length; i++) {
    differenza |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return differenza === 0
}

async function derivaPassword(
  password: string,
  salt: Uint8Array,
  iterazioni: number,
): Promise<string> {
  const chiave = await crypto.subtle.importKey(
    'raw',
    codificatore.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bit = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: iterazioni, hash: 'SHA-256' },
    chiave,
    256,
  )
  return esadecimale(bit)
}

/** Produce la stringa da mettere in ADMIN_PASSWORD_HASH. Usata da scripts/. */
export async function creaHashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derivaPassword(password, salt, ITERAZIONI_PREDEFINITE)
  return `${ITERAZIONI_PREDEFINITE}:${esadecimale(salt.buffer as ArrayBuffer)}:${hash}`
}

export async function passwordCorretta(password: string, memorizzato: string): Promise<boolean> {
  const parti = memorizzato.split(':')
  if (parti.length !== 3) return false
  const [iterazioniTesto, saltTesto, hashAtteso] = parti as [string, string, string]
  const iterazioni = Number.parseInt(iterazioniTesto, 10)
  if (!Number.isFinite(iterazioni) || iterazioni < 1000) return false
  // Non si prova nemmeno: eccederebbe la CPU e il Worker morirebbe a metà.
  if (iterazioni > ITERAZIONI_MASSIME) return false

  const hash = await derivaPassword(password, daEsadecimale(saltTesto), iterazioni)
  return ugualiATempoCostante(hash, hashAtteso)
}

// ── Sessione ────────────────────────────────────────────────────────────────

async function firma(messaggio: string, segreto: string): Promise<string> {
  const chiave = await crypto.subtle.importKey(
    'raw',
    codificatore.encode(segreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return esadecimale(await crypto.subtle.sign('HMAC', chiave, codificatore.encode(messaggio)))
}

export async function creaSessione(segreto: string): Promise<{ valore: string; scadeIl: Date }> {
  const scadenza = Date.now() + DURATA_SESSIONE_MS
  const corpo = String(scadenza)
  return {
    valore: `${corpo}.${await firma(corpo, segreto)}`,
    scadeIl: new Date(scadenza),
  }
}

export async function sessioneValida(
  cookie: string | undefined,
  segreto: string,
): Promise<boolean> {
  if (!cookie) return false
  const punto = cookie.lastIndexOf('.')
  if (punto <= 0) return false

  const corpo = cookie.slice(0, punto)
  const firmaRicevuta = cookie.slice(punto + 1)

  if (!ugualiATempoCostante(firmaRicevuta, await firma(corpo, segreto))) return false

  const scadenza = Number.parseInt(corpo, 10)
  return Number.isFinite(scadenza) && scadenza > Date.now()
}

// ── Configurazione ──────────────────────────────────────────────────────────

export type ConfigurazioneConsole = {
  email: string
  hashPassword: string
  segretoSessione: string
}

/**
 * Legge la configurazione dalle variabili d'ambiente.
 * Restituisce `null` se manca qualcosa: in quel caso la console si dichiara non
 * configurata invece di accettare accessi. Un pannello che si apre perché una
 * variabile è vuota è il modo peggiore di sbagliare.
 */
/**
 * L'impronta ha la forma «iterazioni:salt:derivata», con salt di 16 byte e derivata
 * di 32, entrambi in esadecimale: 32 e 64 caratteri.
 *
 * Controllare anche le lunghezze, non solo che i pezzi siano tre, serve a un caso
 * preciso: un valore incollato a metà conserva i due punti e passerebbe un controllo
 * di sola forma, per poi fallire il confronto. L'utente vedrebbe «password non
 * corretta» e cambierebbe password all'infinito, senza sapere che il problema è
 * altrove.
 */
function formaImprontaValida(impronta: string): boolean {
  const parti = impronta.split(':')
  if (parti.length !== 3) return false
  const [iterazioni, salt, derivata] = parti as [string, string, string]
  if (!/^\d+$/.test(iterazioni)) return false
  const numero = Number.parseInt(iterazioni, 10)
  if (numero < 1000 || numero > ITERAZIONI_MASSIME) return false
  return /^[0-9a-f]{32}$/i.test(salt) && /^[0-9a-f]{64}$/i.test(derivata)
}

export function configurazioneConsole(): ConfigurazioneConsole | null {
  const email = process.env.ADMIN_EMAIL?.trim()
  const hashPassword = process.env.ADMIN_PASSWORD_HASH?.trim()
  const segretoSessione = process.env.ADMIN_SESSION_SECRET?.trim()

  if (!email || !hashPassword || !segretoSessione) return null
  if (segretoSessione.length < 32) return null
  if (!formaImprontaValida(hashPassword)) return null

  return { email, hashPassword, segretoSessione }
}

/**
 * Cosa manca, esattamente.
 *
 * Un messaggio unico per tre cause diverse manda a cercare nel posto sbagliato:
 * «mancano le variabili» detto a chi le ha appena impostate tutte fa pensare a un
 * problema di Cloudflare, quando magari il segreto di sessione è solo troppo corto.
 *
 * Qui si dice quale variabile non arriva e perché. Non si mostra mai un valore:
 * solo se è presente, e per il segreto quanti caratteri ha — che serve a capire se
 * è stato incollato per intero.
 */
export function diagnosiConsole(): string[] {
  const problemi: string[] = []

  const email = process.env.ADMIN_EMAIL?.trim()
  if (!email) problemi.push('ADMIN_EMAIL non arriva al server (assente o vuota).')
  else if (!email.includes('@')) problemi.push('ADMIN_EMAIL non sembra un indirizzo email.')

  const hash = process.env.ADMIN_PASSWORD_HASH?.trim()
  if (!hash) {
    problemi.push('ADMIN_PASSWORD_HASH non arriva al server (assente o vuota).')
  } else if (!formaImprontaValida(hash)) {
    const parti = hash.split(':')
    const iterazioni = Number.parseInt(parti[0] ?? '', 10)
    if (parti.length !== 3) {
      problemi.push(
        'ADMIN_PASSWORD_HASH non ha la forma attesa «iterazioni:salt:impronta». ' +
          'Va incollato il valore prodotto da `npm run admin:password`, non la password.',
      )
    } else if (Number.isFinite(iterazioni) && iterazioni > ITERAZIONI_MASSIME) {
      problemi.push(
        `ADMIN_PASSWORD_HASH chiede ${iterazioni.toLocaleString('it-IT')} iterazioni: ` +
          `troppe per i 10 ms di CPU di un Worker sul piano gratuito, che verrebbe ` +
          `interrotto a metà. È un'impronta creata prima del limite: la rigeneri con ` +
          '`npm run admin:password` e la reimposti.',
      )
    } else {
      const salt = parti[1] ?? ''
      const derivata = parti[2] ?? ''
      const lunghezzeGiuste = salt.length === 32 && derivata.length === 64
      problemi.push(
        lunghezzeGiuste
          ? 'ADMIN_PASSWORD_HASH ha la lunghezza giusta ma contiene caratteri estranei: ' +
            'sono ammessi solo cifre e lettere da a a f. Probabilmente si è infilato uno ' +
            'spazio o un a capo incollandolo.'
          : `ADMIN_PASSWORD_HASH è incompleto: salt ${salt.length}/32, ` +
            `impronta ${derivata.length}/64, in tutto ${hash.length} caratteri invece di 104. ` +
            'È stato incollato solo in parte — e sarebbe apparso come «password non corretta».',
      )
    }
  }

  const segreto = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!segreto) {
    problemi.push('ADMIN_SESSION_SECRET non arriva al server (assente o vuota).')
  } else if (segreto.length < 32) {
    problemi.push(
      `ADMIN_SESSION_SECRET è di ${segreto.length} caratteri: ne servono almeno 32. ` +
        'Probabilmente è stato incollato solo in parte.',
    )
  }

  return problemi
}
