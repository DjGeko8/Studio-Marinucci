import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { COOKIE_SESSIONE, configurazioneConsole, sessioneValida } from '@/lib/admin/auth'
import { leggiDocumento, modalitaArchivio, scriviDocumenti } from '@/lib/admin/archivio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INDICE = 'content/dati/articoli.json'
const testo = (slug: string) => `content/news/${slug}.mdx`

async function autorizzato(): Promise<boolean> {
  const cfg = configurazioneConsole()
  if (!cfg) return false
  return sessioneValida((await cookies()).get(COOKIE_SESSIONE)?.value, cfg.segretoSessione)
}

type ArticoloCompleto = {
  slug: string
  titolo: string
  data: string
  sommario: string
  servizio?: string
  lettura: number
  corpo: string
}

const NOTA_INDICE =
  'Metadati degli approfondimenti. Il testo di ciascuno sta in content/news/<slug>.mdx. Modificabili dalla console in /admin, che scrive metadati e testo in un solo commit. Ogni articolo pubblicato impegna la responsabilità professionale di chi lo firma: va validato prima di andare online.'

function valida(corpo: unknown): ArticoloCompleto[] | { errore: string } {
  if (!Array.isArray(corpo)) return { errore: 'Dati non validi.' }

  const visti = new Set<string>()
  const articoli: ArticoloCompleto[] = []

  for (const [indice, grezzo] of corpo.entries()) {
    const n = indice + 1
    if (typeof grezzo !== 'object' || grezzo === null) {
      return { errore: `Articolo ${n}: dati non validi.` }
    }
    const a = grezzo as Record<string, unknown>

    const slug = typeof a.slug === 'string' ? a.slug.trim().toLowerCase() : ''
    if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
      return {
        errore: `Articolo ${n}: l’indirizzo può contenere solo lettere minuscole, numeri e trattini.`,
      }
    }
    if (visti.has(slug)) {
      return { errore: `Due articoli hanno lo stesso indirizzo «${slug}».` }
    }
    visti.add(slug)

    const titolo = typeof a.titolo === 'string' ? a.titolo.trim() : ''
    if (titolo.length < 5) return { errore: `Articolo ${n}: manca il titolo.` }
    if (titolo.length > 200) return { errore: `Articolo ${n}: titolo troppo lungo.` }

    const data = typeof a.data === 'string' ? a.data.trim() : ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
      return { errore: `Articolo ${n}: la data va scritta come 2026-12-16.` }
    }

    const sommario = typeof a.sommario === 'string' ? a.sommario.trim() : ''
    if (sommario.length < 20) return { errore: `Articolo ${n}: il sommario è troppo breve.` }
    if (sommario.length > 500) return { errore: `Articolo ${n}: il sommario è troppo lungo.` }

    const lettura = Number(a.lettura)
    if (!Number.isFinite(lettura) || lettura < 1 || lettura > 60) {
      return { errore: `Articolo ${n}: i minuti di lettura devono stare fra 1 e 60.` }
    }

    const corpoTesto = typeof a.corpo === 'string' ? a.corpo : ''
    if (corpoTesto.trim().length < 100) {
      return { errore: `Articolo ${n}: il testo è troppo breve per essere pubblicato.` }
    }

    const servizio = typeof a.servizio === 'string' ? a.servizio.trim() : ''

    articoli.push({
      slug,
      titolo,
      data,
      sommario,
      lettura: Math.round(lettura),
      corpo: corpoTesto,
      ...(servizio ? { servizio } : {}),
    })
  }

  return articoli
}

export async function GET() {
  if (!(await autorizzato())) {
    return NextResponse.json({ ok: false, errore: 'Accesso richiesto.' }, { status: 401 })
  }
  try {
    const indice = JSON.parse((await leggiDocumento(INDICE)).contenuto) as {
      articoli: Omit<ArticoloCompleto, 'corpo'>[]
    }
    const articoli = await Promise.all(
      indice.articoli.map(async (a) => ({
        ...a,
        corpo: (await leggiDocumento(testo(a.slug))).contenuto,
      })),
    )
    return NextResponse.json({ ok: true, articoli, modalita: modalitaArchivio() })
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

  let corpo: { articoli?: unknown }
  try {
    corpo = (await richiesta.json()) as typeof corpo
  } catch {
    return NextResponse.json({ ok: false, errore: 'Dati non leggibili.' }, { status: 400 })
  }

  const esito = valida(corpo.articoli)
  if ('errore' in esito) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 400 })
  }

  // La soglia è una scelta editoriale, non un capriccio: una sezione con un solo
  // articolo di un anno fa comunica abbandono. Meglio dirlo qui che scoprirlo online.
  if (esito.length > 0 && esito.length < 3) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          `Con ${esito.length} articol${esito.length === 1 ? 'o' : 'i'} la sezione resterebbe ` +
          'nascosta sul sito: ne servono almeno tre. Può salvarli lo stesso completando gli altri, ' +
          'oppure lasciarne zero per non avere affatto la sezione.',
      },
      { status: 400 },
    )
  }

  try {
    // Quali testi non servono più: gli articoli tolti dall'elenco.
    const precedenti = (
      JSON.parse((await leggiDocumento(INDICE)).contenuto) as { articoli: { slug: string }[] }
    ).articoli.map((a) => a.slug)
    const rimasti = new Set(esito.map((a) => a.slug))
    const daEliminare = precedenti.filter((slug) => !rimasti.has(slug))

    const indice = {
      _nota: NOTA_INDICE,
      articoli: [...esito]
        .sort((a, b) => b.data.localeCompare(a.data))
        .map(({ corpo: _corpo, ...meta }) => meta),
    }

    const scritto = await scriviDocumenti(
      [
        { percorso: INDICE, contenuto: JSON.stringify(indice, null, 2) + '\n' },
        ...esito.map((a) => ({
          percorso: testo(a.slug),
          contenuto: a.corpo.trimEnd() + '\n',
        })),
        ...daEliminare.map((slug) => ({ percorso: testo(slug), contenuto: null })),
      ],
      'Approfondimenti: aggiornati dalla console',
    )
    return NextResponse.json({ ok: true, ...scritto })
  } catch (errore) {
    return NextResponse.json(
      { ok: false, errore: errore instanceof Error ? errore.message : 'Salvataggio non riuscito.' },
      { status: 500 },
    )
  }
}
