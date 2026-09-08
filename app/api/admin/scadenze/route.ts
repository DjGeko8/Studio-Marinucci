import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { COOKIE_SESSIONE, configurazioneConsole, sessioneValida } from '@/lib/admin/auth'
import { leggiDocumento, modalitaArchivio, scriviDocumento } from '@/lib/admin/archivio'
import { DESTINATARI } from '@/content/scadenze'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PERCORSO = 'content/dati/scadenze.json'

async function autorizzato(): Promise<boolean> {
  const cfg = configurazioneConsole()
  if (!cfg) return false
  const cookie = (await cookies()).get(COOKIE_SESSIONE)?.value
  return sessioneValida(cookie, cfg.segretoSessione)
}

/**
 * Validazione di quello che arriva dalla console.
 *
 * Non è una formalità: questo JSON viene letto dalla compilazione del sito. Una
 * voce malformata che passasse di qui farebbe fallire la build, e da quel momento
 * il sito non si aggiornerebbe più — con l'errore visibile solo nei log di
 * Cloudflare, lontano da chi ha premuto «salva». Meglio rifiutare qui, dove si può
 * dire esattamente cosa non va.
 */
function valida(corpo: unknown): { anno: number; voci: unknown[] } | { errore: string } {
  if (typeof corpo !== 'object' || corpo === null) return { errore: 'Dati non validi.' }
  const c = corpo as Record<string, unknown>

  const anno = Number(c.anno)
  if (!Number.isInteger(anno) || anno < 2000 || anno > 2100) {
    return { errore: 'L’anno dello scadenzario non è valido.' }
  }
  if (!Array.isArray(c.voci)) return { errore: 'Manca l’elenco delle scadenze.' }

  const ammessi = Object.keys(DESTINATARI)
  const voci: unknown[] = []

  for (const [indice, grezza] of c.voci.entries()) {
    const n = indice + 1
    if (typeof grezza !== 'object' || grezza === null) {
      return { errore: `Scadenza ${n}: dati non validi.` }
    }
    const v = grezza as Record<string, unknown>

    const data = typeof v.data === 'string' ? v.data.trim() : ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return { errore: `Scadenza ${n}: la data va scritta come 2026-12-16.` }
    }
    if (Number.isNaN(Date.parse(data))) {
      return { errore: `Scadenza ${n}: la data ${data} non esiste.` }
    }

    const titolo = typeof v.titolo === 'string' ? v.titolo.trim() : ''
    if (titolo.length < 3) return { errore: `Scadenza ${n}: manca il titolo.` }
    if (titolo.length > 160) return { errore: `Scadenza ${n}: titolo troppo lungo.` }

    const descrizione = typeof v.descrizione === 'string' ? v.descrizione.trim() : ''
    if (descrizione.length < 10) return { errore: `Scadenza ${n}: manca la descrizione.` }
    if (descrizione.length > 800) return { errore: `Scadenza ${n}: descrizione troppo lunga.` }

    const destinatari = Array.isArray(v.destinatari)
      ? v.destinatari.filter((d): d is string => typeof d === 'string' && ammessi.includes(d))
      : []
    if (destinatari.length === 0) {
      return { errore: `Scadenza ${n}: indichi almeno un tipo di contribuente.` }
    }

    const servizio = typeof v.servizio === 'string' ? v.servizio.trim() : ''

    voci.push({
      data,
      titolo,
      descrizione,
      destinatari,
      ...(servizio ? { servizio } : {}),
    })
  }

  return { anno, voci }
}

export async function GET() {
  if (!(await autorizzato())) {
    return NextResponse.json({ ok: false, errore: 'Accesso richiesto.' }, { status: 401 })
  }
  try {
    const documento = await leggiDocumento(PERCORSO)
    return NextResponse.json({
      ok: true,
      dati: JSON.parse(documento.contenuto),
      versione: documento.versione,
      modalita: modalitaArchivio(),
    })
  } catch (errore) {
    return NextResponse.json(
      { ok: false, errore: errore instanceof Error ? errore.message : 'Lettura non riuscita.' },
      { status: 500 },
    )
  }
}

export async function PUT(richiesta: Request) {
  if (!(await autorizzato())) {
    return NextResponse.json({ ok: false, errore: 'Accesso richiesto.' }, { status: 401 })
  }

  let corpo: { dati?: unknown; versione?: unknown }
  try {
    corpo = (await richiesta.json()) as typeof corpo
  } catch {
    return NextResponse.json({ ok: false, errore: 'Dati non leggibili.' }, { status: 400 })
  }

  const esito = valida(corpo.dati)
  if ('errore' in esito) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 400 })
  }

  // La nota in testa al file si conserva: spiega a chi apre il file a mano da dove
  // arrivano questi dati e quali regole seguono.
  const documento = {
    _nota:
      "Dati dello scadenzario. Modificabili dalla console in /admin, oppure a mano. Le funzioni e i tipi stanno in content/scadenze.ts, che legge questo file: qui dentro va SOLO l'informazione, mai una valutazione o un consiglio.",
    anno: esito.anno,
    voci: [...esito.voci].sort((a, b) =>
      String((a as { data: string }).data).localeCompare(String((b as { data: string }).data)),
    ),
  }

  try {
    const scritto = await scriviDocumento(
      PERCORSO,
      JSON.stringify(documento, null, 2) + '\n',
      `Scadenzario ${esito.anno}: aggiornato dalla console`,
      typeof corpo.versione === 'string' ? corpo.versione : null,
    )
    return NextResponse.json({ ok: true, ...scritto })
  } catch (errore) {
    return NextResponse.json(
      { ok: false, errore: errore instanceof Error ? errore.message : 'Salvataggio non riuscito.' },
      { status: 500 },
    )
  }
}
