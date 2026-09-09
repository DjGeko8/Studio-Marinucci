/**
 * Prova del controllo che governa i salvataggi della console sui testi delle pagine.
 *
 * Si esegue con `npm run prova-pagine`. Non serve un accesso e non serve il modulo web:
 * il controllo vive in `lib/admin/valida-pagine.ts` proprio perché si possa verificare
 * da solo. Un controllo che si può provare soltanto compilando un modulo e premendo
 * «salva» non viene provato quasi mai, e quello che protegge — qui, dei dati che la
 * legge impone di pubblicare — è troppo importante per affidarlo a una prova manuale.
 */

import { readFileSync } from 'node:fs'

import { validaPagine } from '../lib/admin/valida-pagine'
import { analizza, problemaNelTesto, soloTesto } from '../lib/testo-ricco'

type Pagine = Record<string, unknown>

const attuali = JSON.parse(readFileSync('content/dati/pagine.json', 'utf8')) as {
  pagine: Pagine
}

/** Copia profonda dei testi veri: ogni prova parte dallo stato pubblicato. */
const copia = (): Pagine => JSON.parse(JSON.stringify(attuali.pagine)) as Pagine

let passate = 0
const fallite: string[] = []

function prova(nome: string, esegui: () => string | null) {
  let problema: string | null
  try {
    problema = esegui()
  } catch (errore) {
    problema = `eccezione: ${errore instanceof Error ? errore.message : String(errore)}`
  }
  if (problema === null) {
    passate += 1
    console.log(`  ok   ${nome}`)
  } else {
    fallite.push(`${nome} — ${problema}`)
    console.log(`  NO   ${nome}\n         ${problema}`)
  }
}

/** L'esito atteso: accettato. */
function accetta(pagine: Pagine): string | null {
  const esito = validaPagine(pagine)
  return esito.ok ? null : `rifiutato: ${esito.errore}`
}

/** L'esito atteso: rifiutato, e il messaggio deve contenere `atteso`. */
function rifiuta(pagine: Pagine, atteso: string): string | null {
  const esito = validaPagine(pagine)
  if (esito.ok) return 'accettato, ma doveva essere rifiutato'
  return esito.errore.includes(atteso)
    ? null
    : `rifiutato con il messaggio sbagliato: «${esito.errore}»`
}

function sezioniDi(pagine: Pagine, chiave: string): Record<string, unknown>[] {
  return (pagine[chiave] as { sezioni: Record<string, unknown>[] }).sezioni
}

console.log('\nControllo dei salvataggi (lib/admin/valida-pagine.ts)\n')

prova('i testi pubblicati oggi passano il controllo', () => accetta(copia()))

prova('un paragrafo riscritto passa', () => {
  const p = copia()
  const sezioni = sezioniDi(p, 'privacy')
  const s = sezioni.find((v) => v.id === 'sicurezza')!
  s.blocchi = [{ tipo: 'paragrafo', testo: 'Il sito è servito su connessione cifrata.' }]
  return accetta(p)
})

prova('una sezione nuova si può aggiungere a una pagina legale', () => {
  const p = copia()
  sezioniDi(p, 'privacy').push({
    id: 'videosorveglianza',
    titolo: 'Videosorveglianza',
    blocchi: [{ tipo: 'paragrafo', testo: "Lo studio non è dotato di impianti di ripresa." }],
  })
  return accetta(p)
})

prova('una sezione nuova NON si può aggiungere a «Lo studio»', () => {
  const p = copia()
  sezioniDi(p, 'studio').push({
    id: 'premi',
    titolo: 'Riconoscimenti',
    blocchi: [{ tipo: 'paragrafo', testo: 'Un paragrafo qualsiasi di prova.' }],
  })
  return rifiuta(p, 'non accetta sezioni aggiuntive')
})

prova('togliere la sezione della polizza viene rifiutato', () => {
  const p = copia()
  const pagina = p['note-legali'] as { sezioni: Record<string, unknown>[] }
  pagina.sezioni = pagina.sezioni.filter((s) => s.id !== 'assicurazione')
  return rifiuta(p, 'Assicurazione')
})

prova('togliere il titolare del trattamento viene rifiutato', () => {
  const p = copia()
  const pagina = p.privacy as { sezioni: Record<string, unknown>[] }
  pagina.sezioni = pagina.sezioni.filter((s) => s.id !== 'titolare')
  return rifiuta(p, 'Titolare del trattamento')
})

prova('nascondere una sezione obbligatoria viene rifiutato', () => {
  const p = copia()
  sezioniDi(p, 'note-legali').find((s) => s.id === 'esercente')!.visibile = false
  return rifiuta(p, 'non si può nascondere')
})

prova('nascondere «Incarichi» è concesso: è dichiarata opzionale', () => {
  const p = copia()
  sezioniDi(p, 'studio').find((s) => s.id === 'incarichi')!.visibile = false
  return accetta(p)
})

prova('un campo automatico inesistente viene rifiutato', () => {
  const p = copia()
  sezioniDi(p, 'privacy').find((s) => s.id === 'sicurezza')!.blocchi = [
    { tipo: 'paragrafo', testo: 'Scritto da {{nomeInventato}}, che non esiste.' },
  ]
  return rifiuta(p, 'non è un campo automatico')
})

prova('un collegamento con schema pericoloso viene rifiutato', () => {
  const p = copia()
  sezioniDi(p, 'privacy').find((s) => s.id === 'sicurezza')!.blocchi = [
    { tipo: 'paragrafo', testo: 'Si veda [qui](javascript:alert(1)) per i dettagli.' },
  ]
  return rifiuta(p, 'non è valido')
})

prova('un titolo di pagina vuoto viene rifiutato', () => {
  const p = copia()
  ;(p.privacy as { titolo: string }).titolo = ''
  return rifiuta(p, 'il titolo è vuoto')
})

prova('un paragrafo lasciato vuoto si scarta senza errore', () => {
  const p = copia()
  const s = sezioniDi(p, 'privacy').find((v) => v.id === 'sicurezza')!
  s.blocchi = [
    { tipo: 'paragrafo', testo: '   ' },
    { tipo: 'paragrafo', testo: 'Questo invece resta, ed è abbastanza lungo.' },
  ]
  const esito = validaPagine(p)
  if (!esito.ok) return `rifiutato: ${esito.errore}`
  const rimasti = esito.pagine.privacy!.sezioni.find((v) => v.id === 'sicurezza')!.blocchi
  return rimasti.length === 1 ? null : `blocchi rimasti: ${rimasti.length}, atteso 1`
})

prova('parentesi graffe e maggiore/minore restano testo, non rompono nulla', () => {
  const p = copia()
  sezioniDi(p, 'privacy').find((s) => s.id === 'sicurezza')!.blocchi = [
    { tipo: 'paragrafo', testo: 'Una variazione < 5% e un {segno} qualunque restano tali.' },
  ]
  return accetta(p)
})

console.log('\nLettura dei testi (lib/testo-ricco.ts)\n')

prova('il grassetto diventa un frammento «forte»', () => {
  const f = analizza('testo **in rilievo** e basta')
  return f.some((x) => x.tipo === 'forte') ? null : `frammenti: ${JSON.stringify(f)}`
})

prova('un campo automatico viene sostituito con il valore', () => {
  const f = analizza('lo studio di {{nomeCompleto}}')
  const campo = f.find((x) => x.tipo === 'campo')
  return campo && 'valore' in campo && campo.valore.includes('Marinucci')
    ? null
    : `frammenti: ${JSON.stringify(f)}`
})

prova('un collegamento interno resta interno', () => {
  const f = analizza('vedi la [privacy](/privacy)')
  const link = f.find((x) => x.tipo === 'link')
  return link && 'href' in link && link.href === '/privacy' ? null : 'collegamento non letto'
})

prova('un collegamento con schema pericoloso non diventa mai un link', () => {
  const f = analizza('[clicca](javascript:alert(1))')
  return f.some((x) => x.tipo === 'link') ? 'è diventato un collegamento' : null
})

prova('«TBD» resta in evidenza', () => {
  const f = analizza('la PEC è «TBD:PEC» e va completata')
  return f.some((x) => x.tipo === 'tbd') ? null : 'segnaposto non riconosciuto'
})

prova('un campo il cui valore manca porta con sé il segnaposto', () => {
  const f = analizza('scriveteci a {{pec}}')
  const campo = f.find((x) => x.tipo === 'campo')
  return campo && 'valore' in campo && campo.valore.startsWith('«TBD:')
    ? null
    : 'il segnaposto non arriva in pagina'
})

prova('il testo semplice perde la marcatura ma non il contenuto', () => {
  const semplice = soloTesto('**Studio** di {{nome}} — vedi [qui](/studio)')
  return semplice === 'Studio di Massimo Marinucci — vedi qui'
    ? null
    : `ottenuto: «${semplice}»`
})

prova('un testo senza problemi non ne segnala', () => {
  return problemaNelTesto('Testo normale con {{citta}} e [un link](/servizi).') === null
    ? null
    : 'segnalato un problema inesistente'
})

console.log(
  `\n${passate} prove superate, ${fallite.length} fallite\n` +
    (fallite.length ? fallite.map((f) => `  ⛔ ${f}`).join('\n') + '\n' : ''),
)

process.exit(fallite.length === 0 ? 0 : 1)
