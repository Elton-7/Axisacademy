import type { Event, GalleryItem, Resource } from '../types'

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

const fromDocument = (id: string): unknown => {
  if (typeof document === 'undefined') return undefined
  const node = document.getElementById(id)
  if (!node?.textContent) return undefined
  try {
    return JSON.parse(node.textContent)
  } catch {
    return undefined
  }
}

/** The preloaded article, if it is the one this page is for. */
export const preloadedArticle = (slug?: string): Resource | undefined => {
  const candidate = seeded ?? fromDocument('preloaded-article')
  return candidate && typeof candidate === 'object' && 'slug' in candidate && candidate.slug === slug
    ? candidate as Resource
    : undefined
}

let seededGallery: GalleryItem[] | undefined

export const seedGallery = (items?: GalleryItem[]) => {
  seededGallery = items
}

export const preloadedGallery = (): GalleryItem[] | undefined => {
  if (seededGallery) return seededGallery
  const candidate = fromDocument('preloaded-gallery')
  return Array.isArray(candidate) && candidate.length ? candidate as GalleryItem[] : undefined
}

let seededResources: Resource[] | undefined

export const seedResources = (items?: Resource[]) => {
  seededResources = items
}

export const preloadedResources = (): Resource[] | undefined => {
  if (seededResources) return seededResources
  const candidate = fromDocument('preloaded-resources')
  return Array.isArray(candidate) && candidate.length ? candidate as Resource[] : undefined
}

let seededEvents: Event[] | undefined

export const seedEvents = (items?: Event[]) => {
  seededEvents = items
}

export const preloadedEvents = (): Event[] | undefined => {
  if (seededEvents) return seededEvents
  const candidate = fromDocument('preloaded-events')
  return Array.isArray(candidate) && candidate.length ? candidate as Event[] : undefined
}
