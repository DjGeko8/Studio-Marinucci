import { ConsolePagine } from '@/components/admin/ConsolePagine'

export const dynamic = 'force-dynamic'

export default function PagineConsolePage() {
  return (
    <div className="py-12">
      <p className="eyebrow">Contenuti</p>
      <h1 className="mt-4 text-title-lg">Testi delle pagine</h1>
      <p className="mt-4 max-w-prose text-body text-ink-soft">
        La prosa di «Lo studio», dell&apos;informativa privacy, della cookie policy e
        delle note legali. I dati che la legge impone di pubblicare — partita IVA, PEC,
        iscrizione all&apos;albo, estremi della polizza — non si modificano da qui: il sito
        li stampa da sé, sempre uguali in ogni pagina, e si aggiornano in un punto solo.
      </p>

      <div className="mt-12">
        <ConsolePagine />
      </div>
    </div>
  )
}
