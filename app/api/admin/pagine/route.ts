import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { COOKIE_SESSIONE, configurazioneConsole, sessioneValida } from '@/lib/admin/auth'
import { leggiDocumento, modalitaArchivio, scriviDocumento } from '@/lib/admin/archivio'
import { validaPagine, type Pagina } from '@/lib/admin/valida-pagine'
import { STRUTTURA } from '@/content/pagine'
import { CAMPI } from '@/lib/testo-ricco'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PERCORSO = 'content/dati/pagine.json'

const NOTA =
  "Testi discorsivi delle pagine, modificabili dalla console in /admin. I dati obbligatori (partita IVA, PEC, iscrizione all'albo, estremi della polizza, titolare del trattamento) NON stanno qui: sono generati da lib/site.ts e stampati dalle pagine, perche' la legge impone che ci siano e un testo libero e' il posto sbagliato per qualcosa che non puo' mancare. Nei testi si citano con i campi automatici indicati fra doppie graffe, elencati in lib/testo-ricco.ts."

async function autorizzato(): Promise<boolean> {
  const cfg = configurazioneConsole()
  if (!cfg) return false
  return sessioneValida((await cookies()).get(COOKIE_SESSIONE)?.value, cfg.segretoSessione)
}

export async function GET() {
  if (!(await autorizzato())) {
    return NextResponse.json({ ok: false, errore: 'Accesso richiesto.' }, { status: 401 })
  }
  try {
    const documento = await leggiDocumento(PERCORSO)
    const contenuto = JSON.parse(documento.contenuto) as { pagine: Record<string, Pagina> }
    return NextResponse.json({
      ok: true,
      pagine: contenuto.pagine,
      struttura: STRUTTURA,
      // I valori dei campi automatici arrivano dal server, non da una copia scritta
      // nella console: chi scrive vede esattamente ciò che finirà in pagina.
      campi: CAMPI,
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

  let corpo: { pagine?: unknown; versione?: unknown }
  try {
    corpo = (await richiesta.json()) as typeof corpo
  } catch {
    return NextResponse.json({ ok: false, errore: 'Dati non leggibili.' }, { status: 400 })
  }

  const esito = validaPagine(corpo.pagine)
  if (!esito.ok) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 400 })
  }

  try {
    const scritto = await scriviDocumento(
      PERCORSO,
      JSON.stringify({ _nota: NOTA, pagine: esito.pagine }, null, 2) + '\n',
      'Testi delle pagine: aggiornati dalla console',
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
