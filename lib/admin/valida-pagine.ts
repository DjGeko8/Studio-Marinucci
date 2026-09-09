import { STRUTTURA } from '@/content/pagine'
import { problemaNelTesto } from '@/lib/testo-ricco'

/**
 * Il controllo che decide se un salvataggio della console puo' passare.
 *
 * Sta in un modulo a parte, senza dipendenze da Next, per una ragione precisa: cosi'
 * si puo' provare da solo. Un controllo che si puo' verificare solo passando dal
 * modulo web e da un accesso non viene quasi mai verificato davvero.
 */

export type Blocco = { tipo: 'paragrafo'; testo: string } | { tipo: 'elenco'; voci: string[] }
export type Sezione = {
  id: string
  occhiello?: string
  titolo?: string
  visibile?: boolean
  blocchi: Blocco[]
}
export type Pagina = {
  occhiello: string
  titolo: string
  sommario: string
  metaDescrizione: string
  sezioni: Sezione[]
}

const MASSIMO_TITOLO = 160
const MASSIMO_SOMMARIO = 400
const MASSIMO_PARAGRAFO = 4000

/**
 * Il controllo che decide se un salvataggio può passare.
 *
 * Ripete quello che fa già `content/pagine.ts` alla compilazione, e non è una
 * duplicazione inutile: un errore intercettato qui si spiega a chi ha appena premuto
 * «salva», mentre lo stesso errore scoperto in compilazione finisce nei registri di
 * Cloudflare, dove quella persona non arriverà mai — e nel frattempo il sito non si
 * aggiorna più, senza che sia chiaro perché.
 */
export type EsitoValidazione =
  | { ok: true; pagine: Record<string, Pagina> }
  | { ok: false; errore: string }

export function validaPagine(grezzo: unknown): EsitoValidazione {
  if (typeof grezzo !== 'object' || grezzo === null) return { ok: false, errore: 'Dati non validi.' }
  const ricevute = grezzo as Record<string, unknown>

  const pagine: Record<string, Pagina> = {}

  for (const [chiave, struttura] of Object.entries(STRUTTURA)) {
    const grezza = ricevute[chiave]
    if (typeof grezza !== 'object' || grezza === null) {
      return { ok: false, errore: `Manca la pagina «${struttura.nome}».` }
    }
    const p = grezza as Record<string, unknown>
    const dove = `«${struttura.nome}»`

    // Restituisce il testo ripulito, oppure il motivo per cui non va bene. Il tipo
    // unione costringe chi chiama a distinguere i due casi: un controllo dimenticato
    // non compila, invece di lasciar passare un testo mai verificato.
    const testoBreve = (
      valore: unknown,
      campo: string,
      massimo: number,
      minimo = 1,
    ): string | { ok: false; errore: string } => {
      const v = typeof valore === 'string' ? valore.trim() : ''
      if (v.length < minimo) return { ok: false, errore: `${dove}: ${campo} è vuoto.` }
      if (v.length > massimo) return { ok: false, errore: `${dove}: ${campo} supera i ${massimo} caratteri.` }
      const problema = problemaNelTesto(v)
      if (problema) return { ok: false, errore: `${dove}, ${campo}: ${problema}` }
      return v
    }

    const occhiello = testoBreve(p.occhiello, 'la soprariga', 80)
    if (typeof occhiello !== 'string') return occhiello
    const titolo = testoBreve(p.titolo, 'il titolo', MASSIMO_TITOLO, 3)
    if (typeof titolo !== 'string') return titolo
    const sommario = testoBreve(p.sommario, 'il sommario', MASSIMO_SOMMARIO, 20)
    if (typeof sommario !== 'string') return sommario
    const metaDescrizione = testoBreve(
      p.metaDescrizione,
      'la descrizione per i motori di ricerca',
      320,
      20,
    )
    if (typeof metaDescrizione !== 'string') return metaDescrizione

    if (!Array.isArray(p.sezioni)) return { ok: false, errore: `${dove}: le sezioni non sono un elenco.` }

    const viste = new Set<string>()
    const sezioni: Sezione[] = []

    for (const [indice, grezzaSezione] of p.sezioni.entries()) {
      const n = indice + 1
      if (typeof grezzaSezione !== 'object' || grezzaSezione === null) {
        return { ok: false, errore: `${dove}, sezione ${n}: dati non validi.` }
      }
      const s = grezzaSezione as Record<string, unknown>

      const id = typeof s.id === 'string' ? s.id.trim().toLowerCase() : ''
      if (!/^[a-z0-9-]{2,60}$/.test(id)) {
        return {
          ok: false,
          errore: `${dove}, sezione ${n}: il nome interno può contenere solo lettere minuscole, numeri e trattini.`,
        }
      }
      if (viste.has(id)) return { ok: false, errore: `${dove}: due sezioni con lo stesso nome interno «${id}».` }
      viste.add(id)

      const prevista = struttura.sezioni.find((v) => v.id === id)
      if (!prevista && !struttura.sezioniLibere) {
        return {
          ok: false,
          errore: `${dove}: la sezione «${id}» non è prevista dall'impaginazione di questa pagina, che non accetta sezioni aggiuntive.`,
        }
      }

      // Nascondere è concesso solo dove il disegno lo prevede: la sezione che porta
      // con sé gli estremi della polizza o i recapiti del titolare non può sparire,
      // e non deve dipendere dall'attenzione di chi usa il modulo.
      const nascosta = s.visibile === false
      if (nascosta && !prevista?.opzionale) {
        return {
          ok: false,
          errore: `${dove}: la sezione «${prevista?.nome ?? id}» non si può nascondere. Il testo si può riscrivere, ma la sezione deve restare.`,
        }
      }

      const sezione: Sezione = { id, blocchi: [] }

      if (typeof s.occhiello === 'string' && s.occhiello.trim()) {
        const esito = testoBreve(s.occhiello, `la soprariga della sezione ${n}`, 80)
        if (typeof esito !== 'string') return esito
        sezione.occhiello = esito
      }
      if (typeof s.titolo === 'string' && s.titolo.trim()) {
        const esito = testoBreve(s.titolo, `il titolo della sezione ${n}`, MASSIMO_TITOLO)
        if (typeof esito !== 'string') return esito
        sezione.titolo = esito
      }
      if (nascosta) sezione.visibile = false

      const grezzi = Array.isArray(s.blocchi) ? s.blocchi : []
      for (const [i, grezzoBlocco] of grezzi.entries()) {
        if (typeof grezzoBlocco !== 'object' || grezzoBlocco === null) continue
        const b = grezzoBlocco as Record<string, unknown>
        const doveBlocco = `${dove}, sezione ${n}, blocco ${i + 1}`

        if (b.tipo === 'elenco') {
          const grezzeVoci = Array.isArray(b.voci) ? b.voci : []
          const voci: string[] = []
          for (const voce of grezzeVoci) {
            const v = typeof voce === 'string' ? voce.trim() : ''
            if (!v) continue // una riga lasciata a metà si scarta, non è un errore
            if (v.length > MASSIMO_PARAGRAFO) {
              return { ok: false, errore: `${doveBlocco}: una voce dell'elenco è troppo lunga.` }
            }
            const problema = problemaNelTesto(v)
            if (problema) return { ok: false, errore: `${doveBlocco}: ${problema}` }
            voci.push(v)
          }
          if (voci.length > 0) sezione.blocchi.push({ tipo: 'elenco', voci })
          continue
        }

        const testo = typeof b.testo === 'string' ? b.testo.trim() : ''
        if (!testo) continue // paragrafo vuoto: si scarta in silenzio
        if (testo.length > MASSIMO_PARAGRAFO) {
          return { ok: false, errore: `${doveBlocco}: il paragrafo è troppo lungo.` }
        }
        const problema = problemaNelTesto(testo)
        if (problema) return { ok: false, errore: `${doveBlocco}: ${problema}` }
        sezione.blocchi.push({ tipo: 'paragrafo', testo })
      }

      sezioni.push(sezione)
    }

    for (const prevista of struttura.sezioni) {
      if (!viste.has(prevista.id)) {
        return {
          ok: false,
          errore: `${dove}: manca la sezione «${prevista.nome}». È prevista dall'impaginazione e non può essere tolta.`,
        }
      }
    }

    pagine[chiave] = { occhiello, titolo, sommario, metaDescrizione, sezioni }
  }

  return { ok: true, pagine }
}
