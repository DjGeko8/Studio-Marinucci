import { ImagePlaceholder, cx } from '@/components/ui'
import { fotografia, type SlotFoto } from '@/content/immagini'

/**
 * Fotografia del sito.
 *
 * Se il file esiste lo mostra; altrimenti mostra il segnaposto grafico. Il sito
 * non si rompe mai per un'immagine mancante, e non serve toccare le pagine man
 * mano che le fotografie arrivano: basta registrarle in `content/immagini.ts`.
 *
 * Perché un `<img>` e non `next/image`: le fotografie sono meno di dieci e le
 * dimensioni sono già decise a monte da `scripts/prepara-immagine.py`, che
 * produce @1x e @2x. Un `srcset` statico ottiene lo stesso risultato senza
 * dipendere da un servizio di ottimizzazione a tempo di esecuzione — che su
 * Cloudflare Workers andrebbe configurato a parte, e a pagamento oltre una certa
 * soglia. Per un sito di queste dimensioni non vale la complicazione.
 */
export function Foto({
  slot,
  etichetta,
  nota,
  ratio = 'landscape',
  tone = 'light',
  className,
  riempi = false,
  priorita = false,
}: {
  slot: SlotFoto
  /** Testo del segnaposto, quando la fotografia non c'è ancora. */
  etichetta: string
  nota?: string
  ratio?: 'landscape' | 'portrait' | 'square' | 'wide' | 'none'
  tone?: 'light' | 'dark'
  className?: string
  /** Riempie il contenitore (per l'apertura a piena pagina). */
  riempi?: boolean
  /** Immagine visibile all'apertura: viene caricata subito, non in differita. */
  priorita?: boolean
}) {
  const foto = fotografia(slot)

  // Nessuna voce nel registro: lo spazio non ha ancora una fotografia.
  //
  // Qui NON si controlla che il file esista davvero. C'era un controllo del genere
  // e ha causato esattamente il problema che doveva prevenire: con `output:
  // 'standalone'` la generazione delle pagine gira da una posizione diversa, il
  // controllo rispondeva «il file non c'è» e il segnaposto finiva stampato
  // nell'HTML pubblicato — in silenzio, con i file regolarmente al loro posto.
  //
  // Che un'immagine registrata esista è ora verificato da
  // `scripts/verifica-file-immagini.mjs`, che gira prima di ogni compilazione e la
  // fa fallire con un messaggio chiaro. Un controllo che si accorge del problema e
  // lo nasconde è peggio di uno che si ferma.
  if (!foto) {
    return (
      <ImagePlaceholder
        label={etichetta}
        nota={nota}
        ratio={ratio}
        tone={tone}
        className={className}
      />
    )
  }

  const ratios = {
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
    wide: 'aspect-[16/9]',
    none: '',
  } as const

  return (
    <img
      src={foto.src}
      srcSet={`${foto.src} 1x, ${foto.src2x} 2x`}
      width={foto.larghezza}
      height={foto.altezza}
      alt={foto.alt}
      loading={priorita ? 'eager' : 'lazy'}
      fetchPriority={priorita ? 'high' : 'auto'}
      decoding="async"
      className={cx(
        'bg-stone object-cover',
        riempi ? 'h-full w-full' : `w-full rounded ${ratios[ratio]}`,
        className,
      )}
    />
  )
}
