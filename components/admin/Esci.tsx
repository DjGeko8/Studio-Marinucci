'use client'

import { useState } from 'react'

export function Esci() {
  const [inCorso, setInCorso] = useState(false)

  return (
    <button
      type="button"
      disabled={inCorso}
      onClick={async () => {
        setInCorso(true)
        await fetch('/api/admin/sessione', { method: 'DELETE' })
        window.location.href = '/admin'
      }}
      className="rounded border border-petrolio-300/60 px-4 py-2 text-petrolio-100 transition-colors hover:bg-petrolio-800 disabled:opacity-60"
    >
      {inCorso ? 'Uscita…' : 'Esci'}
    </button>
  )
}
