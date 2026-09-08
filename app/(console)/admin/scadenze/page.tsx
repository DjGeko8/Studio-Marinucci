import { ConsoleScadenze } from '@/components/admin/ConsoleScadenze'

export const dynamic = 'force-dynamic'

export default function ScadenzeConsolePage() {
  return (
    <div className="py-12">
      <p className="eyebrow">Contenuti</p>
      <h1 className="mt-4 text-title-lg">Scadenzario fiscale</h1>
      <p className="mt-4 max-w-prose text-body text-ink-soft">
        Le date pubblicate sul sito. L&apos;ordine non conta: vengono riordinate da sole
        al salvataggio.
      </p>

      <div className="mt-12">
        <ConsoleScadenze />
      </div>
    </div>
  )
}
