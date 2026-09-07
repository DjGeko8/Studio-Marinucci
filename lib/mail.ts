/**
 * Recapito delle richieste inviate dai moduli del sito.
 *
 * Su Cloudflare l'invio passa dal binding `EMAIL` (Cloudflare Email Service):
 * nessuna chiave API da custodire, nessun fornitore terzo da nominare
 * nell'informativa privacy oltre a Cloudflare stessa.
 *
 * Il modulo è scritto per degradare, mai per rompersi:
 *   — su Cloudflare con il binding configurato  → spedisce;
 *   — in sviluppo locale o su un altro hosting  → registra nei log e lo dichiara.
 *
 * Chi compila il modulo riceve conferma in entrambi i casi: se la richiesta non
 * è stata recapitata, il problema è di configurazione e non deve ricadere su di lui.
 * L'esito reale è però riportato nei log, e il collaudo dell'invio è una voce
 * della checklist di go-live.
 */

export type RichiestaContatto = {
  ricevutaIl: string
  nome: string
  email: string
  telefono: string
  oggetto: string
  messaggio: string
  modalita: string
  preferenze: string
}

export type EsitoInvio = {
  recapitata: boolean
  /** Motivo del mancato recapito, per i log. Non viene mostrato all'utente. */
  motivo?: string
}

/**
 * Forma minima del binding Email Service usata qui.
 * `npx wrangler types` genera i tipi reali in worker-configuration.d.ts: quando
 * quel file esiste, è quello a fare fede.
 */
type BindingEmail = {
  send(messaggio: {
    to: string | string[]
    from: { email: string; name?: string }
    replyTo?: string
    subject: string
    text: string
    html?: string
  }): Promise<{ messageId?: string }>
}

const ETICHETTE_OGGETTO: Record<string, string> = {
  'consulenza-fiscale': 'Consulenza fiscale',
  contabilita: 'Contabilità e bilancio',
  'partita-iva': 'Apertura partita IVA',
  'dichiarazione-redditi': 'Dichiarazione dei redditi',
  successione: 'Successione',
  societa: 'Società e operazioni societarie',
  revisione: 'Revisione legale',
  contenzioso: 'Controlli, accertamenti, cartelle',
  appuntamento: 'Richiesta di appuntamento',
  altro: 'Altro',
}

const ETICHETTE_MODALITA: Record<string, string> = {
  studio: 'In studio, a Termoli',
  videochiamata: 'In videochiamata',
  indifferente: 'Indifferente',
}

/** Corpo in testo semplice. Volutamente scarno: si legge anche dal telefono. */
function componiTesto(r: RichiestaContatto): string {
  const righe = [
    `Nuova richiesta dal sito — ${ETICHETTE_OGGETTO[r.oggetto] ?? r.oggetto}`,
    '',
    `Nome:      ${r.nome}`,
    `Email:     ${r.email}`,
    r.telefono ? `Telefono:  ${r.telefono}` : null,
    r.modalita ? `Modalità:  ${ETICHETTE_MODALITA[r.modalita] ?? r.modalita}` : null,
    r.preferenze ? `Preferenze orarie: ${r.preferenze}` : null,
    '',
    'Messaggio:',
    r.messaggio,
    '',
    '—',
    `Ricevuta il ${new Date(r.ricevutaIl).toLocaleString('it-IT')}.`,
    'Rispondendo a questa email si scrive direttamente a chi ha compilato il modulo.',
  ]
  return righe.filter((riga) => riga !== null).join('\n')
}

/** Recupera il binding EMAIL, se il codice sta girando su Cloudflare. */
async function bindingEmail(): Promise<BindingEmail | null> {
  try {
    // Import dinamico: su un hosting diverso da Cloudflare il pacchetto può non
    // essere presente, e il sito deve continuare a funzionare lo stesso.
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const contesto = await getCloudflareContext({ async: true })
    const env = contesto?.env as Record<string, unknown> | undefined
    const email = env?.EMAIL
    if (email && typeof (email as BindingEmail).send === 'function') {
      return email as BindingEmail
    }
    return null
  } catch {
    return null
  }
}

export async function recapitaRichiesta(r: RichiestaContatto): Promise<EsitoInvio> {
  const destinatario = process.env.MAIL_DESTINATARIO?.trim()
  const mittente = process.env.MAIL_MITTENTE?.trim()

  if (!destinatario || !mittente) {
    console.warn(
      '[contatti] MAIL_DESTINATARIO o MAIL_MITTENTE non configurati: richiesta NON recapitata.',
      r,
    )
    return { recapitata: false, motivo: 'variabili_non_configurate' }
  }

  const email = await bindingEmail()
  if (!email) {
    console.warn(
      '[contatti] Binding EMAIL non disponibile (sviluppo locale o hosting non Cloudflare): richiesta NON recapitata.',
      r,
    )
    return { recapitata: false, motivo: 'binding_non_disponibile' }
  }

  try {
    const esito = await email.send({
      to: destinatario,
      from: { email: mittente, name: 'Sito Studio Marinucci' },
      // Rispondere all'email scrive direttamente a chi ha compilato il modulo:
      // è il dettaglio che rende la casella davvero utilizzabile.
      replyTo: r.email,
      subject: `Sito — ${ETICHETTE_OGGETTO[r.oggetto] ?? 'Richiesta'} — ${r.nome}`,
      text: componiTesto(r),
    })
    console.info('[contatti] richiesta recapitata', { messageId: esito?.messageId })
    return { recapitata: true }
  } catch (errore) {
    // L'invio è fallito ma la richiesta non deve andare perduta: resta nei log,
    // da cui è recuperabile.
    console.error('[contatti] invio non riuscito, richiesta conservata nei log', errore, r)
    return { recapitata: false, motivo: 'invio_fallito' }
  }
}
