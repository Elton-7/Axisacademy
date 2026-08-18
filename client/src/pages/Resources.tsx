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
        const list = await resourcesApi.getAll({ limit: 100 })
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

      <section className="bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-2xl border border-line bg-surface-sunk p-4 shadow-sm md:grid-cols-3">
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Resources</p>
              <p className="mt-3 text-3xl font-bold text-ink">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Topics</p>
              <p className="mt-3 text-3xl font-bold text-ink">{stats.categories}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Focus</p>
              <p className="mt-3 text-lg font-semibold text-ink">Guided Growth</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 rounded-2xl border border-line bg-surface-sunk p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-ink-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by title, topic, or keyword..."
                className="w-full rounded-lg border border-line-strong bg-surface pl-12 pr-4 py-2.5 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted/70">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-line'}`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
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
          ) : filteredResources.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink-muted/70">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-ink-muted/30" />
              No resources match your current filters.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource, index) => (
                <motion.article key={resource.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                  {/* Brief §19 rules out a stock-photo site, so an article
                      without its own cover gets a branded panel rather than a
                      generic photograph standing in for one. */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
                    {resource.coverImage ? (
                      <img src={resource.coverImage} alt={resource.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a1628_0%,#24334f_100%)] px-6 text-center">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500">
                          {resource.category}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-ink">{resource.category}</div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-ink-faint">
                      <span>{resource.author}</span>
                      <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {resource.readTime || '4 min read'}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-ink">{resource.title}</h3>
                      {resource.excerpt && <p className="mt-2 text-sm leading-relaxed text-ink-muted/70">{resource.excerpt}</p>}
                    </div>

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-muted/70">{tag}</span>
                        ))}
                      </div>
                    )}

                    <button className="inline-flex items-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold/90">
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
