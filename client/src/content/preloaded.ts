import type { Resource } from '../types'

/**
 * An article handed to the renderer at build time.
 *
 * Article pages fetch their own data in an effect, and effects do not run
 * during renderToString — so every prerendered article was an empty shell with
 * no title, no description, no structured data and no text. For a section whose
 * whole purpose is being found on Google, that is the difference between
 * working and not.
 *
 * The prerender script fetches each article and seeds it here before rendering,
 * then writes the same object into the page as window.__PRELOADED_ARTICLE__.
 * The browser reads it back on hydration, so the markup React builds on the
 * client matches the markup that was served — no mismatch, no re-render, and
 * no second request for something the page already has.
 */
declare global {
  interface Window {
    __PRELOADED_ARTICLE__?: Resource
  }
}

let seeded: Resource | undefined

export const seedArticle = (article?: Resource) => {
  seeded = article
}

/** The preloaded article, if it is the one this page is for. */
export const preloadedArticle = (slug?: string): Resource | undefined => {
  const candidate =
    seeded ?? (typeof window !== 'undefined' ? window.__PRELOADED_ARTICLE__ : undefined)
  return candidate && candidate.slug === slug ? candidate : undefined
}
