import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Loader, Search, Video, Sparkles } from 'lucide-react'
import { GalleryItem, GalleryCategory, GalleryType } from '../types'
import { galleryApi } from '../services/apiClient'

const TYPES: Array<'all' | GalleryType> = ['all', 'Photo', 'Video']
const CATEGORIES: Array<'all' | GalleryCategory> = ['all', 'Event', 'Programme', 'Activity', 'General']

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'all' | GalleryType>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | GalleryCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await galleryApi.getAll({ limit: 200 })
        const galleryItems = Array.isArray(response) ? response : response.data || []
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

      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery by title or keyword..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 py-2.5 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-navy/70">Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedType === type ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-slate-200'}`}
                    >
                      {type === 'all' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-navy/70">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-gold text-navy' : 'bg-white text-navy hover:bg-slate-200'}`}
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

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader className="h-8 w-8 animate-spin text-gold" /></div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-navy/70">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-navy/30" />
              {items.length === 0 ? (
                <>
                  <p className="font-semibold text-navy">Our gallery is being prepared.</p>
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
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item, index) => (
                <motion.article key={item.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <img src={item.thumbnail || item.url} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy">
                      {item.type === 'Video' ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                      {item.type}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-navy">{item.category}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-navy">{item.title}</h3>
                      {item.description && <p className="mt-2 text-sm leading-relaxed text-navy/70">{item.description}</p>}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-navy/70">{tag}</span>
                        ))}
                      </div>
                    )}

                    <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy/90">
                      {item.type === 'Video' ? 'Watch video' : 'View image'}
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
