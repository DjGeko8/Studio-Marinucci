import { ConsoleServizi } from '@/components/admin/ConsoleServizi'

export const dynamic = 'force-dynamic'

export default function ServiziConsolePage() {
  return (
    <div className="py-12">
      <p className="eyebrow">Contenuti</p>
      <h1 className="mt-4 text-title-lg">Aree di attività</h1>
      <p className="mt-4 max-w-prose text-body text-ink-soft">
        Di cosa si occupa lo studio. L&apos;ordine non è estetico: le prime sei aree
        compaiono in home, quindi spostarne una in cima è una scelta di posizionamento.
      </p>

      <div className="mt-12">
        <ConsoleServizi />
      </div>
    </div>
  )
}
