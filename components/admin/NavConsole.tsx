'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cx } from '@/components/ui'

const SEZIONI = [
  { href: '/admin', label: 'Riepilogo' },
  { href: '/admin/scadenze', label: 'Scadenzario' },
  { href: '/admin/servizi', label: 'Aree di attività' },
  { href: '/admin/articoli', label: 'Approfondimenti' },
]

export function NavConsole() {
  const percorso = usePathname()

  return (
    <nav aria-label="Sezioni della console" className="flex flex-wrap gap-6 pb-1">
      {SEZIONI.map((s) => {
        const attiva = percorso === s.href
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={attiva ? 'page' : undefined}
            className={cx(
              'border-b-2 pb-3 text-body-sm no-underline transition-colors',
              attiva
                ? 'border-brass text-paper'
                : 'border-transparent text-petrolio-200 hover:border-petrolio-600 hover:text-paper',
            )}
          >
            {s.label}
          </Link>
        )
      })}
    </nav>
  )
}
