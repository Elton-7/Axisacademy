import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Loader, Search, Video, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { GalleryItem, GalleryCategory, GalleryType } from '../types'
import { galleryApi } from '../services/apiClient'

const TYPES: Array<'all' | GalleryType> = ['all', 'Photo', 'Video']
const CATEGORIES: Array<'all' | GalleryCategory> = ['all', 'Event', 'Programme', 'Activity', 'General']

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Escape closes, arrows move between items. Bound only while the overlay is
  // open, so the page's own keyboard behaviour is untouched the rest of the
  // time, and the background is locked because a page scrolling behind an open
  // overlay loses the reader their place.
  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowRight') setActiveIndex((i) => (i === null ? i : (i + 1) % filteredItems.length))
      if (event.key === 'ArrowLeft') setActiveIndex((i) => (i === null ? i : (i - 1 + filteredItems.length) % filteredItems.length))
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])
  const [selectedType, setSelectedType] = useState<'all' | GalleryType>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | GalleryCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const galleryItems = await galleryApi.getAll({ limit: 200 })
        setItems(galleryItems)
      } catch (err) {
        console.error('Failed to load gallery:', err)
        setError('Failed to load gallery. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [])

  useEffect(() => {
    let filtered = items

    if (selectedType !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedType)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.join(' ').toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    setFilteredItems(filtered)
  }, [items, selectedType, selectedCategory, searchQuery])

  return (
    <>
      <section className="bg-gradient-to-br from-navy via-navy to-navy/90 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Gallery & Media</h1>
            </div>
            <p className="text-lg text-white/80">
              Browse moments from our classes, events, programmes, and learner journeys. We share authentic learning experiences while protecting privacy and consent.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 rounded-2xl border border-line bg-surface-sunk p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery by title or keyword..."
                className="w-full rounded-lg border border-line-strong bg-surface pl-12 pr-4 py-2.5 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedType === type ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-line'}`}
                    >
                      {type === 'all' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-gold text-navy-surface' : 'bg-surface text-ink hover:bg-line'}`}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-sunk py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader className="h-8 w-8 animate-spin text-gold" /></div>
          ) : error ? (
            <div className="rounded-2xl border border-line-critical bg-tint-critical p-6 text-center text-critical">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink-muted">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-ink-muted/30" />
              {items.length === 0 ? (
                <>
                  <p className="font-semibold text-ink">Our gallery is being prepared.</p>
                  <p className="mx-auto mt-2 max-w-md text-sm">
                    We publish only genuine photographs and videos of Axis learners, educators and
                    activities — and only where the appropriate consent has been given. Real media is
                    being collected now.
                  </p>
                </>
              ) : (
                'No media matches your current filters.'
              )}
            </div>
          ) : (
            /**
             * A masonry of columns, not a grid of boxes.
             *
             * The previous layout forced every item into aspect-video and
             * cropped to fill, which cut the portrait photographs straight
             * through the faces — a third of these are 3:4 or 2:3. CSS columns
             * let each photograph keep its own shape, so nothing is cropped and
             * the varied heights read as an edit rather than a contact sheet.
             */
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
              {filteredItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
                  className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-xl"
                  aria-label={`Open ${item.title}`}
                >
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />

                  {/* The caption sits over the foot of the image and lifts into
                      view on hover, so the grid reads as photographs first. On a
                      touch screen there is no hover, so it is always visible
                      below the fold of the tile. */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-transparent p-4 pt-10">
                    <p className="text-sm font-semibold leading-snug text-white">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 text-xs leading-relaxed text-white/70 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  {item.type === 'Video' && (
                    <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-900/80 backdrop-blur-sm">
                      <Video className="h-4 w-4 text-gold-500" aria-hidden="true" />
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/*
        * Opening a photograph should not send a parent to a bare image file on
        * a blank tab, which is where the previous "View image" link led — and
        * back is then the only way home. This keeps them on the page, moves
        * between items with the arrow keys, and closes on Escape.
        */}
      <AnimatePresence>
        {activeIndex !== null && filteredItems[activeIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/95 p-4 backdrop-blur-sm sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={filteredItems[activeIndex].title}
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i === null ? i : (i - 1 + filteredItems.length) % filteredItems.length)) }}
                  className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i === null ? i : (i + 1) % filteredItems.length)) }}
                  className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <figure
              className="max-h-full w-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredItems[activeIndex].type === 'Video' ? (
                <video
                  src={filteredItems[activeIndex].url}
                  poster={filteredItems[activeIndex].thumbnail || undefined}
                  controls
                  autoPlay
                  className="mx-auto max-h-[70vh] w-auto rounded-xl"
                />
              ) : (
                <img
                  src={filteredItems[activeIndex].url}
                  alt={filteredItems[activeIndex].title}
                  className="mx-auto max-h-[70vh] w-auto rounded-xl object-contain"
                />
              )}
              <figcaption className="mx-auto mt-4 max-w-2xl text-center">
                <p className="text-base font-semibold text-white">{filteredItems[activeIndex].title}</p>
                {filteredItems[activeIndex].description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{filteredItems[activeIndex].description}</p>
                )}
                <p className="mt-3 text-xs text-white/40">
                  {activeIndex + 1} of {filteredItems.length}
                </p>
              </figcaption>
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
