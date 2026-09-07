import Link from 'next/link'

import { Container, Tbd } from '@/components/ui'
import {
  contatti,
  datiObbligatori,
  navFooter,
  navPrincipale,
  orari,
  professionista,
  sede,
  site,
} from '@/lib/site'

/**
 * Footer.
 *
 * Contiene i dati obbligatori dell'esercente la professione: titolo, ordine di
 * appartenenza, numero di iscrizione, partita IVA, PEC ed estremi della polizza RC
 * professionale (art. 5 DPR 137/2012). Devono comparire in modo chiaro e permanente
 * su ogni pagina: non alleggerire questa sezione.
 *
 * Il codice fiscale è volutamente assente: non serve ad alcuna funzione del sito.
 */
export function Footer() {
  const anno = new Date().getFullYear()

  return (
    <footer className="bg-petrolio-900 bg-paperGrain text-petrolio-100">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-12 md:gap-8">
          {/* Identità e dati obbligatori */}
          <div className="md:col-span-5">
            <p className="font-serif text-title-sm text-paper">{site.name}</p>
            <p className="mt-1 text-body-sm text-petrolio-200">
              {professionista.nomeCompleto}
            </p>

            <div className="mt-6 space-y-1.5 text-body-sm">
              <p>{professionista.titolo}</p>
              <p>
                Iscritto all&apos;{professionista.ordine}, n. {professionista.numeroIscrizione}
              </p>
              <p>
                Revisore Legale n. <Tbd>{professionista.numeroRevisori}</Tbd>
              </p>
            </div>

            <div className="mt-6 space-y-1.5 text-body-sm text-petrolio-200">
              <p>
                P. IVA <Tbd>{datiObbligatori.partitaIva}</Tbd>
              </p>
              <p>
                PEC <Tbd>{contatti.pec}</Tbd>
              </p>
              <p>
                Polizza RC professionale: <Tbd>{datiObbligatori.polizzaRc}</Tbd>
              </p>
            </div>
          </div>

          {/* Recapiti */}
          <div className="md:col-span-4">
            <p className="eyebrow text-petrolio-300">Studio</p>
            <address className="mt-4 space-y-1.5 text-body-sm not-italic">
              <p>{sede.via}</p>
              <p>
                {sede.cap} {sede.citta} ({sede.provincia})
              </p>
              <p className="pt-3">
                <a
                  href={contatti.telefonoHref}
                  className="text-paper no-underline transition-colors hover:text-brass-soft"
                >
                  {contatti.telefono}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${contatti.email}`}
                  className="text-paper no-underline transition-colors hover:text-brass-soft"
                >
                  <Tbd>{contatti.email}</Tbd>
                </a>
              </p>
            </address>

            <div className="mt-6 space-y-1 text-body-sm text-petrolio-200">
              {orari.righe.map((riga) => (
                <p key={riga.giorni}>
                  {riga.giorni}: <Tbd>{riga.orario}</Tbd>
                </p>
              ))}
              <p className="pt-2">{orari.nota}</p>
            </div>
          </div>

          {/* Navigazione */}
          <div className="md:col-span-3">
            <p className="eyebrow text-petrolio-300">Sezioni</p>
            <ul className="mt-4 space-y-2.5 text-body-sm">
              {navPrincipale.map((voce) => (
                <li key={voce.href}>
                  <Link
                    href={voce.href}
                    className="no-underline transition-colors hover:text-paper"
                  >
                    {voce.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="eyebrow mt-8 text-petrolio-300">Informazioni</p>
            <ul className="mt-4 space-y-2.5 text-body-sm">
              {navFooter.map((voce) => (
                <li key={voce.href}>
                  <Link
                    href={voce.href}
                    className="no-underline transition-colors hover:text-paper"
                  >
                    {voce.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-petrolio-700/60 py-6">
          <p className="text-body-sm text-petrolio-300">
            © {anno} {site.name}. Tutti i diritti riservati.
          </p>
        </div>
      </Container>
    </footer>
  )
}
