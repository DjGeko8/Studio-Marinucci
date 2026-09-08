import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { COOKIE_SESSIONE, configurazioneConsole, sessioneValida } from '@/lib/admin/auth'
import { leggiDocumento, modalitaArchivio, scriviDocumento } from '@/lib/admin/archivio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PERCORSO = 'content/dati/servizi.json'

const NOTA =
  "Aree di attività dello studio. Modificabili dalla console in /admin. ATTENZIONE: un'area elencata genera richieste. Vanno indicate solo le attività effettivamente prestate — un servizio non prestato ma pubblicizzato è una dichiarazione ingannevole. L'ordine conta: le prime sei compaiono in home."

async function autorizzato(): Promise<boolean> {
  const cfg = configurazioneConsole()
  if (!cfg) return false
  return sessioneValida((await cookies()).get(COOKIE_SESSIONE)?.value, cfg.segretoSessione)
}

type Servizio = {
  slug: string
  titolo: string
  sintesi: string
  destinatari: string
  corpo: string[]
  faq: { domanda: string; risposta: string }[]
}

function valida(corpo: unknown): Servizio[] | { errore: string } {
  if (!Array.isArray(corpo)) return { errore: 'Dati non validi.' }
  if (corpo.length === 0) {
    return {
      errore:
        'Senza almeno un’area di attività la pagina «Servizi» resterebbe vuota e la home perderebbe il blocco principale.',
    }
  }

  const visti = new Set<string>()
  const servizi: Servizio[] = []

  for (const [indice, grezzo] of corpo.entries()) {
    const n = indice + 1
    if (typeof grezzo !== 'object' || grezzo === null) {
      return { errore: `Area ${n}: dati non validi.` }
    }
    const s = grezzo as Record<string, unknown>

    const slug = typeof s.slug === 'string' ? s.slug.trim().toLowerCase() : ''
    if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
      return {
        errore: `Area ${n}: l’indirizzo può contenere solo lettere minuscole, numeri e trattini.`,
      }
    }
    if (visti.has(slug)) return { errore: `Due aree hanno lo stesso indirizzo «${slug}».` }
    visti.add(slug)

    const titolo = typeof s.titolo === 'string' ? s.titolo.trim() : ''
    if (titolo.length < 3) return { errore: `Area ${n}: manca il titolo.` }
    if (titolo.length > 120) return { errore: `Area ${n}: titolo troppo lungo.` }

    const sintesi = typeof s.sintesi === 'string' ? s.sintesi.trim() : ''
    if (sintesi.length < 20) return { errore: `Area ${n}: la sintesi è troppo breve.` }
    if (sintesi.length > 400) return { errore: `Area ${n}: la sintesi è troppo lunga.` }

    const destinatari = typeof s.destinatari === 'string' ? s.destinatari.trim() : ''
    if (destinatari.length < 5) return { errore: `Area ${n}: indichi a chi si rivolge.` }

    const corpoGrezzo = Array.isArray(s.corpo) ? s.corpo : []
    const paragrafi = corpoGrezzo
      .filter((p): p is string => typeof p === 'string')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    if (paragrafi.length === 0) {
      return { errore: `Area ${n}: serve almeno un paragrafo di descrizione.` }
    }
    const corto = paragrafi.find((p) => p.length < 20)
    if (corto) return { errore: `Area ${n}: un paragrafo è troppo breve per essere utile.` }

    const faqGrezze = Array.isArray(s.faq) ? s.faq : []
    const faq: Servizio['faq'] = []
    for (const [i, f] of faqGrezze.entries()) {
      if (typeof f !== 'object' || f === null) continue
      const d = f as Record<string, unknown>
      const domanda = typeof d.domanda === 'string' ? d.domanda.trim() : ''
      const risposta = typeof d.risposta === 'string' ? d.risposta.trim() : ''
      // Una domanda senza risposta si scarta in silenzio: è una riga lasciata a metà,
      // non un errore da segnalare. Una risposta senza domanda invece è un refuso.
      if (!domanda && !risposta) continue
      if (!domanda) return { errore: `Area ${n}, domanda frequente ${i + 1}: manca la domanda.` }
      if (risposta.length < 20) {
        return { errore: `Area ${n}, domanda frequente ${i + 1}: la risposta è troppo breve.` }
      }
      faq.push({ domanda, risposta })
    }

    servizi.push({ slug, titolo, sintesi, destinatari, corpo: paragrafi, faq })
  }

  return servizi
}

export async function GET() {
  if (!(await autorizzato())) {
    return NextResponse.json({ ok: false, errore: 'Accesso richiesto.' }, { status: 401 })
  }
  try {
    const documento = await leggiDocumento(PERCORSO)
    return NextResponse.json({
      ok: true,
      servizi: (JSON.parse(documento.contenuto) as { servizi: Servizio[] }).servizi,
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

  let corpo: { servizi?: unknown; versione?: unknown }
  try {
    corpo = (await richiesta.json()) as typeof corpo
  } catch {
    return NextResponse.json({ ok: false, errore: 'Dati non leggibili.' }, { status: 400 })
  }

  const esito = valida(corpo.servizi)
  if ('errore' in esito) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 400 })
  }

  try {
    // L'ordine è deciso da chi scrive, non riordinato da noi: è posizionamento.
    const scritto = await scriviDocumento(
      PERCORSO,
      JSON.stringify({ _nota: NOTA, servizi: esito }, null, 2) + '\n',
      'Aree di attività: aggiornate dalla console',
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
