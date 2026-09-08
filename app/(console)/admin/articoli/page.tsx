import { ConsoleArticoli } from '@/components/admin/ConsoleArticoli'

export const dynamic = 'force-dynamic'

export default function ArticoliConsolePage() {
  return (
    <div className="py-12">
      <p className="eyebrow">Contenuti</p>
      <h1 className="mt-4 text-title-lg">Approfondimenti</h1>
      <p className="mt-4 max-w-prose text-body text-ink-soft">
        Gli articoli firmati dallo studio. Testo e informazioni si salvano insieme: non
        esiste un momento in cui un articolo risulta pubblicato ma senza contenuto.
      </p>

      <div className="mt-12">
        <ConsoleArticoli />
      </div>
    </div>
  )
}
