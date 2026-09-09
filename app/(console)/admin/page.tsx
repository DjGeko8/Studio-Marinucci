import Link from 'next/link'

import { modalitaArchivio } from '@/lib/admin/archivio'

export const dynamic = 'force-dynamic'

const SEZIONI = [
  {
    href: '/admin/scadenze',
    titolo: 'Scadenzario fiscale',
    testo:
      'Le date da pubblicare sul sito, con il tipo di contribuente che riguardano. È la pagina che porta più visite ricorrenti: tenerla aggiornata è la cosa a più alto rendimento di tutto il sito.',
  },
  {
    href: '/admin/servizi',
    titolo: 'Aree di attività',
    testo:
      'Di cosa si occupa lo studio. Un’area elencata genera richieste: vanno indicate solo le attività effettivamente prestate. L’ordine conta — le prime sei compaiono in home.',
  },
  {
    href: '/admin/articoli',
    titolo: 'Approfondimenti',
    testo:
      'Gli articoli firmati dallo studio. Meglio tre utili all’anno che una sezione ferma da un anno: sotto i tre articoli si nasconde da sola.',
  },
  {
    href: '/admin/pagine',
    titolo: 'Testi delle pagine',
    testo:
      'La prosa di «Lo studio», privacy, cookie policy e note legali. I dati obbligatori restano fuori: il sito li stampa da sé, così non possono mancare per distrazione.',
  },
]

export default function RiepilogoPage() {
  const modalita = modalitaArchivio()

  return (
    <div className="py-12">
      <p className="eyebrow">Riepilogo</p>
      <h1 className="mt-4 text-title-lg">Cosa si può aggiornare</h1>
      <p className="mt-4 max-w-prose text-body text-ink-soft">
        Ogni salvataggio viene registrato nella cronologia del sito e avvia la
        ricompilazione: le pagine si aggiornano dopo un minuto o due. Nulla viene
        pubblicato prima che si prema «Salva».
      </p>

      <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
        {SEZIONI.map((s) => (
          <Link key={s.href} href={s.href} className="group no-underline">
            <div className="h-px w-full bg-line transition-colors group-hover:bg-petrolio-600" />
            <h2 className="mt-5 font-serif text-title-sm text-ink transition-colors group-hover:text-petrolio-700">
              {s.titolo}
            </h2>
            <p className="mt-3 text-body-sm text-ink-soft">{s.testo}</p>
            <p aria-hidden="true" className="mt-4 text-body-sm text-petrolio-700">
              Apri →
            </p>
          </Link>
        ))}
      </div>

      {modalita === 'locale' ? (
        <p className="mt-14 max-w-prose border-l-2 border-line-strong bg-stone px-5 py-4 text-body-sm text-ink-soft">
          <strong className="text-ink">Modalità locale.</strong> Mancano{' '}
          <code>GITHUB_TOKEN</code> e <code>GITHUB_REPO</code>, quindi le modifiche
          restano sui file di questo computer e non raggiungono il sito pubblicato. È il
          comportamento giusto in sviluppo; in produzione vanno impostate come Secret nel
          Worker.
        </p>
      ) : null}

      <div className="mt-14 max-w-prose space-y-3 border-l-2 border-brass-soft bg-paper-warm px-5 py-4 text-body-sm text-ink-soft">
        <p className="text-ink">Prima di pubblicare qualunque testo</p>
        <p>
          Questo è il sito di un iscritto a un ordine professionale. La comunicazione è
          consentita ma <strong>informativa</strong>: niente promesse di risultato, niente
          confronti con altri professionisti, nessun numero non dimostrabile, nessun caso
          di cliente riconoscibile.
        </p>
        <p>
          Nel dubbio, si pubblica il fatto verificabile e si lascia stare l&apos;aggettivo.
        </p>
      </div>
    </div>
  )
}
