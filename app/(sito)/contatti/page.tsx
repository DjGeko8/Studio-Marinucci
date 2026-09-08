import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '@/components/ContactForm'
import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Container, DatoRiga, Section, SectionHeading, Tbd } from '@/components/ui'
import { contatti, orari, sede } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contatti',
  description:
    'Contatti dello studio del Dott. Massimo Marinucci a Termoli: telefono, email, PEC e orari di apertura.',
  alternates: { canonical: '/contatti' },
}

const briciole = [{ href: '/contatti', label: 'Contatti' }]

export default function ContattiPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Parlarne"
        titolo="Contatti"
        sommario="Per una prima valutazione della sua situazione può chiamare lo studio, scrivere o compilare il modulo."
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Recapiti */}
            <div className="lg:col-span-5">
              <h2 className="text-title-md">Recapiti</h2>

              <dl className="mt-8">
                <DatoRiga label="Telefono">
                  <a href={contatti.telefonoHref} className="link">
                    {contatti.telefono}
                  </a>
                </DatoRiga>
                <DatoRiga label="Email">
                  <Tbd>{contatti.email}</Tbd>
                </DatoRiga>
                <DatoRiga label="PEC">
                  <Tbd>{contatti.pec}</Tbd>
                </DatoRiga>
                {/* Il fax compare solo qui, e solo se ancora attivo («TBD:FAX»). */}
                {contatti.faxAttivo ? (
                  <DatoRiga label="Fax">{contatti.fax}</DatoRiga>
                ) : null}
                <DatoRiga label="Studio">
                  {sede.via}
                  <br />
                  {sede.cap} {sede.citta} ({sede.provincia})
                  <br />
                  <Link href="/dove-siamo" className="link mt-2 inline-block">
                    Come arrivare
                  </Link>
                </DatoRiga>
              </dl>

              <h2 className="mt-14 text-title-md">Orari</h2>
              <dl className="mt-8">
                {orari.righe.map((riga) => (
                  <DatoRiga key={riga.giorni} label={riga.giorni}>
                    <Tbd>{riga.orario}</Tbd>
                  </DatoRiga>
                ))}
              </dl>
              <p className="mt-5 max-w-prose text-body-sm text-ink-soft">
                {orari.nota} Per fissare un incontro è possibile usare il modulo di{' '}
                <Link href="/appuntamento" className="link">
                  richiesta appuntamento
                </Link>
                , indicando due o tre preferenze di giorno e fascia oraria.
              </p>
            </div>

            {/* Modulo */}
            <div className="lg:col-span-7">
              <SectionHeading
                as="h2"
                title="Scriva allo studio"
                intro="Si risponde entro un giorno lavorativo."
              />
              {/* ⚠️ «TBD» — «entro un giorno lavorativo» è un impegno concreto:
                  va tolto se il professionista non se la sente di garantirlo. */}
              <div className="mt-10">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
