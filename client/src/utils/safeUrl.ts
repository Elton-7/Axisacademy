/**
 * Guards for URLs that come out of the CMS rather than out of this codebase.
 *
 * Partner websites and event registration links are typed into the admin panel
 * and rendered straight into href. Two things can go wrong with that, and both
 * were possible here.
 *
 * A `javascript:` URL in an href runs when a visitor clicks it. Planting one
 * needs an admin account, but an admin account being compromised should not
 * also mean stored script execution on a public page for every visitor after —
 * defence in depth is the whole point when the site serves families.
 *
 * And a link that merely *looks* internal can leave the site. `//evil.example`
 * is protocol-relative and `\\evil.example` exploits the backslash handling
 * described in GHSA-wrjc-x8rr-h8h6, which affects the router version in use and
 * has no patch on the 6.x line. Both would have been treated as internal paths
 * by a naive `startsWith('http')` test and handed to <Link>.
 *
 * So neither is trusted: a value has to prove it is an ordinary http(s) URL, or
 * an ordinary path on this site, or it is not rendered as a link at all.
 */

/** An absolute http(s) URL, or null if it is anything else. */
export const safeExternalUrl = (value?: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  try {
    const parsed = new URL(trimmed)
    // Only these two. Everything else — javascript:, data:, vbscript:, file: —
    // is refused rather than sanitised, because there is no legitimate reason
    // for a partner website or a registration link to use one.
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
}

/**
 * A path on this site, or null.
 *
 * Must start with exactly one forward slash. A second slash makes it
 * protocol-relative and a backslash is read as a slash by browsers, so both
 * would navigate off-site while looking like an internal route.
 */
export const safeInternalPath = (value?: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//') || trimmed.includes('\\')) return null
  return trimmed
}

/** Classifies a CMS link so a component can pick the right element. */
export const classifyLink = (value?: string | null) => {
  const internal = safeInternalPath(value)
  if (internal) return { kind: 'internal' as const, href: internal }
  const external = safeExternalUrl(value)
  if (external) return { kind: 'external' as const, href: external }
  return { kind: 'unsafe' as const, href: null }
}
