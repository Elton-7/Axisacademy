/**
 * Every way to reach Axis, in one place.
 *
 * These details were previously hardcoded in eight components across three
 * different domains, which is how the site ended up publishing one address
 * while its canonical URLs pointed at another. Changing a number or an address
 * should be one edit here, not a search across the codebase.
 *
 * The canonical domain is axislearning.co.ke.
 */

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.axislearning.co.ke').replace(/\/$/, '')

export const contact = {
  /** Shown to people. */
  phoneDisplay: '0737 003 007',
  /** For tel: links — no spaces, or some dialers mis-parse it. */
  phoneDial: '0737003007',
  /** International form, required by wa.me. */
  phoneInternational: '254737003007',
  email: 'info@axislearning.co.ke',
  addressLine: 'Nairobi, Kenya',
  headOffice: 'Chandaria Innovation Centre — Kenyatta University',
  hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
} as const

export const telHref = `tel:${contact.phoneDial}`
export const mailtoHref = `mailto:${contact.email}`

/** Consultations are booked over WhatsApp, so the message is pre-filled. */
export function whatsappHref(message = 'Hello Axis Learning, I would like to ask about a programme for my learner.') {
  return `https://wa.me/${contact.phoneInternational}?text=${encodeURIComponent(message)}`
}

export function consultationMailto(subject = 'Consultation request') {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`
}

/**
 * Placeholders until Axis supplies the real accounts (brief §33). They point at
 * the platforms' home pages rather than at a wrong profile, so nothing links to
 * an account that is not ours.
 */
export const socialLinks = {
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
  youtube: 'https://www.youtube.com/',
  linkedin: 'https://www.linkedin.com/',
  tiktok: 'https://www.tiktok.com/',
} as const
