/**
 * Brief §35 — visitor, traffic-source and conversion measurement.
 *
 * Nothing loads and no identifiers are set unless VITE_GA_MEASUREMENT_ID is
 * configured, so the site ships with no third-party tracking by default. That is
 * deliberate: Axis works with children's data, and whether to run analytics —
 * and whether a consent banner is required under the Data Protection Act 2019 —
 * is the organisation's decision to make, not a default to inherit.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

type GtagArgs = [command: string, ...rest: unknown[]]

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: GtagArgs) => void
  }
}

export const analyticsEnabled = Boolean(MEASUREMENT_ID)

let initialised = false

export function initAnalytics() {
  if (!MEASUREMENT_ID || initialised || typeof window === 'undefined') return
  initialised = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  // gtag.js identifies its own calls by checking for a genuine `arguments`
  // object, so this must not push a rest-parameter array — GA would discard
  // every command, including the config call.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments)
  }

  window.gtag('js', new Date())
  // Page views are sent manually so that client-side route changes are counted.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true })
}

export function trackPageView(path: string, title?: string) {
  if (!MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  })
}

/**
 * The conversions the brief actually cares about (§35): enquiries and
 * consultation bookings, not raw pageviews.
 */
export type ConversionEvent =
  | 'enquiry_submitted'
  | 'consultation_requested'
  | 'whatsapp_opened'
  | 'phone_clicked'
  | 'newsletter_subscribed'

export function trackConversion(event: ConversionEvent, params?: Record<string, unknown>) {
  if (!MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', event, params ?? {})
}
