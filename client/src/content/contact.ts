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
 * The accounts Axis actually has, and only those.
 *
 * This replaces placeholders that pointed at facebook.com and instagram.com
 * themselves. A row of icons leading to the platforms' own home pages looks
 * like a finished site until someone clicks one, and then looks broken — worse
 * than showing nothing.
 *
 * YouTube and LinkedIn are deliberately absent rather than left pointing
 * nowhere. Add them here when Axis has them and the footer picks them up.
 *
 * The Facebook address is the canonical page, not the /share/ link it was given
 * as: a share URL carries a one-off tracking token and can stop resolving.
 * Verified by following it — it lands on facebook.com/AxislearningKenya.
 */
export const socialLinks = [
  { platform: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/AxislearningKenya' },
  { platform: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/axislearningkenya' },
  { platform: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@axislearning' },
] as const

export type SocialLink = (typeof socialLinks)[number]
