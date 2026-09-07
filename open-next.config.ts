import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/**
 * Configurazione dell'adattatore OpenNext per Cloudflare.
 *
 * Volutamente minima: il sito è interamente statico tranne la ricezione dei
 * moduli, quindi non serve alcuna cache incrementale (niente `revalidate`, niente
 * ISR) e di conseguenza non servono né KV né R2.
 *
 * Se un domani si introducesse una pagina rigenerata a intervalli, è qui che si
 * aggiungerebbe l'`incrementalCache` con il relativo binding.
 */
export default defineCloudflareConfig()
