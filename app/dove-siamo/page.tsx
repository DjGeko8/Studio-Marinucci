import type { Metadata } from 'next'

import { Foto } from '@/components/Foto'
import { JsonLdBreadcrumb } from '@/components/JsonLd'
import { MapEmbed } from '@/components/MapEmbed'
import { PageHero } from '@/components/PageHero'
import { ButtonLink, Container, DatoRiga, Section, Tbd } from '@/components/ui'
import { contatti, orari, sede } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Dove siamo',
  description:
    'Dove si trova lo studio a Termoli: indirizzo, mappa, come arrivare e parcheggio.',
  alternates: { canonical: '/dove-siamo' },
}

const briciole = [{ href: '/dove-siamo', label: 'Dove siamo' }]

export default function DoveSiamoPage() {
  return (
    <>
      <JsonLdBreadcrumb briciole={briciole} />

      <PageHero
        briciole={briciole}
        eyebrow="Come arrivare"
        titolo="Dove siamo"
        sommario={`Lo studio si trova a ${sede.citta}, in ${sede.via}.`}
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="text-title-md">Indirizzo</h2>
              <address className="mt-6 text-body not-italic text-ink">
                {sede.via}
                <br />
                {sede.cap} {sede.citta} ({sede.provincia})
              </address>

              <dl className="mt-10">
                <DatoRiga label="Telefono">
                  <a href={contatti.telefonoHref} className="link">
                    {contatti.telefono}
                  </a>
                </DatoRiga>
                {orari.righe.map((riga) => (
                  <DatoRiga key={riga.giorni} label={riga.giorni}>
                    <Tbd>{riga.orario}</Tbd>
                  </DatoRiga>
                ))}
              </dl>

              <h2 className="mt-14 text-title-md">Come arrivare</h2>
              <div className="mt-6 max-w-prose space-y-4 text-body-sm text-ink-soft">
                {/* ⚠️ «TBD» — indicazioni da scrivere solo dopo aver confermato la sede
                    e verificato di persona i riferimenti. Descrivere un percorso
                    sbagliato è peggio che non descriverlo. */}
                <p>
                  <Tbd>«TBD:SEDE»</Tbd> — le indicazioni stradali, i riferimenti visibili
                  all&apos;arrivo e le informazioni sul parcheggio saranno scritte dopo la
                  conferma della sede operativa e una verifica sul posto.
                </p>
                <p>
                  In un centro come {sede.citta} l&apos;informazione sul parcheggio è
                  banale ma sorprendentemente utile: vale la pena indicare dove si sosta
                  davvero, non dove si potrebbe.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <ButtonLink href="/appuntamento">Prenota un appuntamento</ButtonLink>
                <ButtonLink href={contatti.telefonoHref} tone="secondary">
                  Chiama · {contatti.telefono}
                </ButtonLink>
              </div>
            </div>

            <div className="lg:col-span-7">
              {/* L'ingresso ha una funzione pratica prima che estetica: chi arriva a
                  piedi riconosce il portone senza cercare il numero civico. */}
              <Foto
                slot="studio-ingresso"
                ratio="landscape"
                className="mb-8"
                etichetta="Ingresso dello studio"
                nota="Inquadrato come lo vede chi arriva a piedi, con l'insegna leggibile."
              />
              <MapEmbed />
              <p className="mt-4 text-body-sm text-ink-muted">
                La mappa è caricata solo dopo il consenso ai contenuti esterni. La scelta
                si può cambiare in ogni momento dalla cookie policy.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
