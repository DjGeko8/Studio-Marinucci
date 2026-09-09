import Link from 'next/link'
import type { ReactNode } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   Componenti base del design system.
   Nessun valore cromatico o tipografico qui dentro: solo classi dai token.
   ────────────────────────────────────────────────────────────────────────── */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function Container({
  children,
  className,
  width = 'default',
}: {
  children: ReactNode
  className?: string
  width?: 'default' | 'narrow'
}) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-5 sm:px-8',
        width === 'narrow' ? 'max-w-3xl' : 'max-w-container',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Section({
  children,
  className,
  tone = 'paper',
  size = 'default',
  id,
}: {
  children: ReactNode
  className?: string
  tone?: 'paper' | 'warm' | 'stone' | 'dark'
  size?: 'default' | 'large' | 'compact'
  id?: string
}) {
  const tones = {
    paper: 'bg-paper text-ink',
    warm: 'bg-paper-warm text-ink',
    stone: 'bg-stone text-ink',
    dark: 'bg-petrolio-800 bg-paperGrain text-paper',
  } as const
  const sizes = {
    compact: 'py-12 sm:py-16',
    default: 'py-section',
    large: 'py-section-lg',
  } as const

  return (
    <section id={id} className={cx(tones[tone], sizes[size], className)}>
      {children}
    </section>
  )
}

/** Sopratitolo in maiuscoletto spaziato. Su fondo scuro passare tone="dark". */
export function Eyebrow({
  children,
  tone = 'light',
  as: As = 'p',
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  as?: 'p' | 'span' | 'div'
}) {
  return (
    <As className={cx('eyebrow', tone === 'dark' && 'text-petrolio-200')}>{children}</As>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = 'light',
  align = 'left',
  as: As = 'h2',
}: {
  eyebrow?: string
  /** Titolo e introduzione accettano elementi: possono contenere campi automatici. */
  title: ReactNode
  intro?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <div className={cx('max-w-prose', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <As
        className={cx(
          'text-title-lg sm:text-title-xl',
          eyebrow ? 'mt-4' : '',
          tone === 'dark' && 'text-paper',
        )}
      >
        {title}
      </As>
      {intro ? (
        <p
          className={cx(
            'mt-5 text-body-lg',
            tone === 'dark' ? 'text-petrolio-100' : 'text-ink-soft',
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  )
}

type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'onDark'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded px-6 py-3.5 text-body-sm font-medium ' +
  'transition-colors duration-DEFAULT no-underline'

const buttonTones: Record<ButtonTone, string> = {
  primary: 'bg-petrolio-700 text-paper hover:bg-petrolio-800',
  secondary:
    'border border-line-strong bg-transparent text-ink hover:border-petrolio-600 hover:text-petrolio-800',
  ghost: 'text-petrolio-700 hover:text-petrolio-900 underline underline-offset-4 px-0 py-1',
  onDark: 'border border-petrolio-300/60 text-paper hover:bg-petrolio-700',
}

export function ButtonLink({
  href,
  children,
  tone = 'primary',
  className,
  external,
}: {
  href: string
  children: ReactNode
  tone?: ButtonTone
  className?: string
  external?: boolean
}) {
  const cls = cx(buttonBase, buttonTones[tone], className)
  if (external || href.startsWith('tel:') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}

/** Scheda con filetto superiore: separa senza riquadri né ombre. */
export function Card({
  href,
  eyebrow,
  title,
  children,
  meta,
}: {
  href?: string
  eyebrow?: string
  title: string
  children?: ReactNode
  meta?: string
}) {
  const inner = (
    <>
      <div className="h-px w-full bg-line transition-colors duration-DEFAULT group-hover:bg-petrolio-600" />
      <div className="flex flex-1 flex-col pt-5">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h3
          className={cx(
            'text-title-xs sm:text-title-sm',
            eyebrow ? 'mt-3' : '',
            href && 'transition-colors duration-DEFAULT group-hover:text-petrolio-700',
          )}
        >
          {title}
        </h3>
        {children ? <div className="mt-3 text-body-sm text-ink-soft">{children}</div> : null}
        {meta ? <p className="mt-4 text-body-sm text-ink-muted">{meta}</p> : null}
        {href ? (
          <p className="mt-5 text-body-sm text-petrolio-700" aria-hidden="true">
            Approfondisci →
          </p>
        ) : null}
      </div>
    </>
  )

  if (!href) {
    return <div className="flex h-full flex-col">{inner}</div>
  }
  return (
    <Link href={href} className="group flex h-full flex-col no-underline">
      {inner}
    </Link>
  )
}

/**
 * Segnaposto per immagini non ancora disponibili.
 * Deliberatamente evidente: non deve mai passare inosservato in produzione,
 * e non è mai un'immagine generata al posto di una fotografia reale.
 */
export function ImagePlaceholder({
  label,
  nota,
  ratio = 'landscape',
  tone = 'light',
  className,
}: {
  label: string
  nota?: string
  ratio?: 'landscape' | 'portrait' | 'square' | 'wide' | 'none'
  tone?: 'light' | 'dark'
  className?: string
}) {
  const ratios = {
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
    wide: 'aspect-[16/9]',
    /** Per i casi in cui è il contenitore a dettare l'altezza (hero a piena pagina). */
    none: '',
  } as const

  return (
    <div
      role="img"
      aria-label={`Segnaposto immagine: ${label}`}
      className={cx(
        ratios[ratio],
        'flex flex-col items-center justify-center gap-2 rounded bg-paperGrain p-6 text-center',
        tone === 'dark'
          ? 'bg-petrolio-900 text-petrolio-200'
          : 'bg-stone text-ink-muted ring-1 ring-inset ring-line',
        className,
      )}
    >
      <span className="eyebrow">Fotografia da produrre</span>
      <span className="max-w-xs text-body-sm">{label}</span>
      {nota ? <span className="max-w-xs text-body-sm opacity-70">{nota}</span> : null}
    </div>
  )
}

/** Corpo di testo lungo: articoli, pagine legali, descrizioni. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'max-w-prose text-body text-ink-soft',
        '[&_h2]:mt-12 [&_h2]:text-title-md [&_h2]:text-ink',
        '[&_h3]:mt-9 [&_h3]:text-title-sm [&_h3]:text-ink',
        '[&_p]:mt-5',
        '[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6',
        '[&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6',
        '[&_li]:pl-1',
        '[&_a]:text-petrolio-700 [&_a]:underline [&_a]:underline-offset-4',
        '[&_strong]:font-semibold [&_strong]:text-ink',
        '[&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-brass-soft',
        '[&_blockquote]:pl-5 [&_blockquote]:text-ink-muted',
        '[&_hr]:my-10 [&_hr]:border-line',
        '[&_table]:mt-6 [&_table]:w-full [&_table]:text-body-sm',
        '[&_th]:border-b [&_th]:border-line-strong [&_th]:py-2 [&_th]:text-left [&_th]:text-ink',
        '[&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:align-top',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Riquadro per le note informative obbligatorie
 * (disclaimer articoli, avvertenza scadenzario).
 */
export function Avvertenza({ children }: { children: ReactNode }) {
  return (
    <aside className="mt-12 border-l-2 border-brass-soft bg-paper-warm px-5 py-4 text-body-sm text-ink-soft">
      {children}
    </aside>
  )
}

/** Coppia etichetta/valore usata in contatti, note legali, footer. */
export function DatoRiga({
  label,
  children,
  tone = 'light',
}: {
  label: string
  children: ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:gap-6 sm:py-2.5">
      <dt
        className={cx(
          'shrink-0 text-body-sm sm:w-56',
          tone === 'dark' ? 'text-petrolio-200' : 'text-ink-muted',
        )}
      >
        {label}
      </dt>
      <dd className={cx('text-body-sm', tone === 'dark' ? 'text-paper' : 'text-ink')}>
        {children}
      </dd>
    </div>
  )
}

/**
 * Evidenzia a schermo i dati non ancora forniti.
 * In sviluppo si vede; in produzione non deve esistere alcuna occorrenza.
 */
export function Tbd({ children }: { children: ReactNode }) {
  const testo = String(children)
  if (!testo.startsWith('«TBD:')) return <>{children}</>
  return (
    <mark
      className="rounded-sm bg-brass-pale px-1.5 py-0.5 font-mono text-[0.8em] text-ink"
      title="Dato mancante — vedi docs/DATI-MANCANTI.md"
    >
      {testo}
    </mark>
  )
}
