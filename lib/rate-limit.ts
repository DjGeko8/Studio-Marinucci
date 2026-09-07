/**
 * Limite di frequenza in memoria — difesa di ripiego, non la principale.
 *
 * ⚠️ SU CLOUDFLARE WORKERS QUESTO CONTATORE VALE POCO.
 * Le istanze sono effimere e distribuite fra i data center: ognuna conta per conto
 * proprio, quindi il limite reale è molto più alto di quello dichiarato qui. Non è
 * un difetto da correggere nel codice — è il posto sbagliato dove metterlo.
 *
 * Il limite vero va configurato come **regola di rate limiting del WAF** sul
 * percorso `/api/contatti`, dove blocca prima ancora di raggiungere questo codice.
 * Istruzioni nel README, sezione «Pubblicare su Cloudflare».
 *
 * Questo contatore resta comunque utile: copre lo sviluppo locale e fa da seconda
 * barriera se la regola di bordo venisse disattivata per errore.
 */

type Finestra = { conteggio: number; scadenza: number }

const finestre = new Map<string, Finestra>()

/** Rimuove le finestre scadute: evita che la mappa cresca indefinitamente. */
function potatura(ora: number): void {
  for (const [chiave, finestra] of finestre) {
    if (finestra.scadenza <= ora) finestre.delete(chiave)
  }
}

export function consentito(
  chiave: string,
  limite = 5,
  durataMs = 60 * 60 * 1000,
): { ok: boolean; rimanenti: number } {
  const ora = Date.now()
  if (finestre.size > 500) potatura(ora)

  const finestra = finestre.get(chiave)
  if (!finestra || finestra.scadenza <= ora) {
    finestre.set(chiave, { conteggio: 1, scadenza: ora + durataMs })
    return { ok: true, rimanenti: limite - 1 }
  }

  if (finestra.conteggio >= limite) return { ok: false, rimanenti: 0 }

  finestra.conteggio += 1
  return { ok: true, rimanenti: limite - finestra.conteggio }
}

/** Identificativo del chiamante, dedotto dagli header del proxy. */
export function identificaChiamante(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const primo = forwarded.split(',')[0]?.trim()
    if (primo) return primo
  }
  return headers.get('x-real-ip') ?? 'sconosciuto'
}
