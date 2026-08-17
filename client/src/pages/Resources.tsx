import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock3, Loader, Search, Sparkles } from 'lucide-react'
import { Resource, ResourceCategory } from '../types'
import { resourcesApi } from '../services/apiClient'

const CATEGORIES: Array<'all' | ResourceCategory> = ['all', 'Learning Tips', 'Parent Guide', 'Programme Spotlight', 'Assessment', 'Academic Support', 'General']

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | ResourceCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        const response = await resourcesApi.getAll({ limit: 100 })
        const list = Array.isArray(response) ? response : response.data || []
        setResources(list)
      } catch (err) {
        console.error('Failed to load resources:', err)
        setError('Failed to load resources. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  useEffect(() => {
    let filtered = resources

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.excerpt?.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.tags?.join(' ').toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0))
    setFilteredResources(filtered)
  }, [resources, selectedCategory, searchQuery])

  const stats = useMemo(() => ({
    total: resources.length,
    categories: new Set(resources.map((resource) => resource.category)).size,
  }), [resources])

  return (
    <>
      <section className="bg-gradient-to-br from-navy via-navy to-navy/90 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Resources & Insights</h1>
            </div>
            <p className="text-lg text-white/80">
              Practical guidance, parent-friendly tips, and learning ideas to help each learner grow with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:grid-cols-3">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resources</p>
              <p className="mt-3 text-3xl font-bold text-navy">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Topics</p>
              <p className="mt-3 text-3xl font-bold text-navy">{stats.categories}</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus</p>
              <p className="mt-3 text-lg font-semibold text-navy">Guided Growth</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by title, topic, or keyword..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 py-2.5 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-navy/70">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-slate-200'}`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
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
          ) : filteredResources.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-navy/70">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-navy/30" />
              No resources match your current filters.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource, index) => (
                <motion.article key={resource.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                    <img src={resource.coverImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80'} alt={resource.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy">{resource.category}</div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span>{resource.author}</span>
                      <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {resource.readTime || '4 min read'}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-navy">{resource.title}</h3>
                      {resource.excerpt && <p className="mt-2 text-sm leading-relaxed text-navy/70">{resource.excerpt}</p>}
                    </div>

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-navy/70">{tag}</span>
                        ))}
                      </div>
                    )}

                    <button className="inline-flex items-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold/90">
                      Read article
                    </button>
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
