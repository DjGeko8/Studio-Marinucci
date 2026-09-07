import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Il file esiste davvero in `public/`?
 *
 * Serve a non mostrare mai un'immagine rotta. Una voce può restare registrata in
 * `content/immagini.ts` mentre il file non c'è: è successo con la foto del castello,
 * esclusa dal versionamento perché non licenziata. In quel caso il sito deve tornare
 * al segnaposto grafico, non lasciare l'icona di immagine spezzata.
 *
 * Il controllo avviene in fase di compilazione: le pagine che usano fotografie sono
 * tutte statiche, quindi il risultato viene fissato nell'HTML generato e a runtime
 * non si legge alcun disco. Se per qualche ragione il codice girasse in un ambiente
 * senza filesystem, si assume che il file ci sia — a quel punto la pagina è già
 * stata generata e questa funzione non ha più voce in capitolo.
 */
export function filePubblicoEsiste(percorso: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', percorso.replace(/^\//, '')))
  } catch {
    return true
  }
}
