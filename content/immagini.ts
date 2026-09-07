/**
 * REGISTRO DELLE FOTOGRAFIE
 *
 * Collega gli spazi descritti in `media-manifest.json` ai file effettivamente
 * presenti in `public/immagini/`. Uno spazio senza voce qui mostra il segnaposto
 * grafico: il sito non si rompe mai per un'immagine mancante.
 *
 * COME SI AGGIUNGE UNA FOTOGRAFIA (istruzioni estese nel README):
 *   1. python scripts/prepara-immagine.py <file> <slot> [--definitiva]
 *   2. si aggiunge o si aggiorna la voce qui sotto.
 *
 * ⚠️ `provvisoria: true` significa che l'immagine NON è pubblicabile: è una prova
 * per valutare l'impaginazione, e porta impresso un avviso ben visibile.
 * `npm run verifica-immagini` blocca la pubblicazione finché ne resta una.
 */

export type SlotFoto =
  | 'hero-termoli'
  | 'ritratto-verticale'
  | 'ritratto-orizzontale'
  | 'studio-ingresso'
  | 'studio-sala-attesa'
  | 'studio-tavolo-riunioni'

export type Fotografia = {
  /** Percorso @1x sotto /public. */
  src: string
  /** Percorso @2x, per gli schermi ad alta densità. */
  src2x: string
  larghezza: number
  altezza: number
  alt: string
  /** true = immagine di prova, marchiata e non pubblicabile. */
  provvisoria: boolean
  /** Da compilare per l'immagine definitiva: autore e licenza. */
  credito?: string
}

export const immagini: Partial<Record<SlotFoto, Fotografia>> = {
  'hero-termoli': {
    src: '/immagini/hero-termoli-PROVVISORIA.jpg',
    src2x: '/immagini/hero-termoli-PROVVISORIA@2x.jpg',
    larghezza: 1600,
    altezza: 900,
    alt: 'Il borgo antico di Termoli e il Castello Svevo visti dall’alto, sul mare',
    provvisoria: true,
    // ⚠️ Anteprima Adobe Stock non licenziata (rif. 496192825), con il watermark
    // dell'autore ancora impresso. Serve solo a valutare l'impaginazione.
    // Va sostituita da una fotografia commissionata o regolarmente acquistata.
    credito: 'Anteprima Adobe Stock 496192825 — NON LICENZIATA',
  },

  'ritratto-verticale': {
    src: '/immagini/ritratto-verticale-PROVVISORIA.jpg',
    src2x: '/immagini/ritratto-verticale-PROVVISORIA@2x.jpg',
    larghezza: 640,
    altezza: 853,
    alt: 'Ritratto del Dott. Massimo Marinucci nel suo studio',
    provvisoria: true,
    // ⚠️ La persona ritratta NON è il Dott. Marinucci: immagine sintetica usata
    // solo per valutare l'impaginazione. Sostituire con un ritratto reale.
    credito: 'Immagine sintetica — la persona ritratta non è il professionista',
  },

  'ritratto-orizzontale': {
    src: '/immagini/ritratto-orizzontale-PROVVISORIA.jpg',
    src2x: '/immagini/ritratto-orizzontale-PROVVISORIA@2x.jpg',
    larghezza: 900,
    altezza: 675,
    alt: 'Il Dott. Massimo Marinucci alla scrivania del suo studio a Termoli',
    provvisoria: true,
    credito: 'Immagine sintetica — la persona ritratta non è il professionista',
  },

  'studio-ingresso': {
    src: '/immagini/studio-ingresso-PROVVISORIA.jpg',
    src2x: '/immagini/studio-ingresso-PROVVISORIA@2x.jpg',
    larghezza: 900,
    altezza: 675,
    alt: 'Il portone d’ingresso dello studio',
    provvisoria: true,
    // ⚠️ Non è Termoli né la sede reale. Questo spazio serve a far riconoscere la
    // porta a chi arriva a piedi: una porta sbagliata è peggio di nessuna foto.
    credito: 'Immagine sintetica — non è l’ingresso reale dello studio',
  },

  'studio-tavolo-riunioni': {
    src: '/immagini/studio-tavolo-riunioni-PROVVISORIA.jpg',
    src2x: '/immagini/studio-tavolo-riunioni-PROVVISORIA@2x.jpg',
    larghezza: 900,
    altezza: 675,
    alt: 'La sala riunioni dello studio',
    provvisoria: true,
    // ⚠️ Ritrae uno studio strutturato, con più stanze e più postazioni: promette
    // esattamente la dimensione che il sito ha deciso di NON promettere.
    // Vedi docs/FASE-2-ARCHITETTURA.md §1.
    credito: 'Immagine sintetica — contraddice il posizionamento a professionista singolo',
  },
}

export function fotografia(slot: SlotFoto): Fotografia | undefined {
  return immagini[slot]
}

/** Elenco delle provvisorie ancora in uso: alimenta il controllo di go-live. */
export function provvisorieInUso(): SlotFoto[] {
  return (Object.keys(immagini) as SlotFoto[]).filter((slot) => immagini[slot]?.provvisoria)
}
