import type { GalleryItem, Resource } from '../types'

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
let seeded: Resource | undefined

export const seedArticle = (article?: Resource) => {
  seeded = article
}

/**
 * Read out of a JSON block rather than a global set by an inline script.
 *
 * The script form was refused by the Content-Security-Policy: its content
 * differs per article, so it cannot be hashed at build time, and permitting it
 * would have meant allowing every inline script on the site. A JSON block is
 * data — never executed — so the policy allows it and there is nothing here for
 * an injected payload to run.
 */
const fromDocument = (): Resource | undefined => {
  if (typeof document === 'undefined') return undefined
  const node = document.getElementById('preloaded-article')
  if (!node?.textContent) return undefined
  try {
    return JSON.parse(node.textContent) as Resource
  } catch {
    // Malformed data is simply ignored; the page fetches as it would anyway.
    return undefined
  }
}

/** The preloaded article, if it is the one this page is for. */
export const preloadedArticle = (slug?: string): Resource | undefined => {
  const candidate = seeded ?? fromDocument()
  return candidate && candidate.slug === slug ? candidate : undefined
}

/**
 * The gallery, handed to the renderer the same way an article is.
 *
 * Same reasoning, same mechanism: the page fetches in an effect, effects do not
 * run during renderToString, so the served HTML held none of the captions. The
 * items are seeded before rendering and written into the page as a JSON block —
 * data, never executed, so the Content-Security-Policy allows it — and read
 * back on hydration so the client builds the same markup it was served.
 */
let seededGallery: GalleryItem[] | undefined

export const seedGallery = (items?: GalleryItem[]) => {
  seededGallery = items
}

export const preloadedGallery = (): GalleryItem[] | undefined => {
  if (seededGallery) return seededGallery
  if (typeof document === 'undefined') return undefined
  const node = document.getElementById('preloaded-gallery')
  if (!node?.textContent) return undefined
  try {
    const items = JSON.parse(node.textContent) as GalleryItem[]
    return Array.isArray(items) && items.length ? items : undefined
  } catch {
    // Malformed data is ignored; the page fetches exactly as it did before.
    return undefined
  }
}
