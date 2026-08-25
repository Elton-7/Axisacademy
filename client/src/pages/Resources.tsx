import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, Loader, Search, Sparkles } from 'lucide-react'
import { Resource, ResourceCategory, RESOURCE_CATEGORIES } from '../types'
import { resourcesApi } from '../services/apiClient'

// Derived from the shared list rather than retyped: a filter chip for a
// category the database no longer accepts returns nothing, silently.
const CATEGORIES: Array<'all' | ResourceCategory> = ['all', ...RESOURCE_CATEGORIES]

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
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Resources</p>
              <p className="mt-3 text-3xl font-bold text-ink">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Topics</p>
              <p className="mt-3 text-3xl font-bold text-ink">{stats.categories}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Focus</p>
              <p className="mt-3 text-lg font-semibold text-ink">Guided Growth</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 rounded-2xl border border-line bg-surface-sunk p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by title, topic, or keyword..."
                className="w-full rounded-lg border border-line-strong bg-surface pl-12 pr-4 py-2.5 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Category</label>
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
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink-muted">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-ink-muted/30" />
              No resources match your current filters.
            </div>
          ) : (
            /**
             * A reading list, not a blog.
             *
             * This was a grid of article cards — cover panel, date, read time,
             * excerpt, tags, and a "Read article" button. That shape suits
             * writing Axis publishes itself. This collection is mostly other
             * people's scholarship, where the useful facts are the title and
             * who wrote it, and everything else is furniture around a link.
             *
             * Grouped by subject so the list stays navigable as it grows, which
             * Axis expects it to.
             */
            <div className="space-y-12">
              {Object.entries(
                filteredResources.reduce<Record<string, typeof filteredResources>>((groups, item) => {
                  ;(groups[item.category] ||= []).push(item)
                  return groups
                }, {})
              ).map(([category, items]) => (
                <section key={category}>
                  <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
                    {category}
                  </h2>
                  <ul className="divide-y divide-line border-y border-line">
                    {items.map((resource) => {
                      // A resource is only a link once someone has established
                      // that Axis may point at a copy. Until then the title is
                      // listed plainly — honest, where a dead link is not.
                      const href = resource.sourceUrl || resource.fileUrl
                      const external = Boolean(resource.sourceUrl)
                      return (
                        <li key={resource.id} className="py-5">
                          {href ? (
                            <a
                              href={href}
                              target={external ? '_blank' : undefined}
                              rel={external ? 'noopener noreferrer' : undefined}
                              className="group inline-flex items-start gap-2 text-lg font-semibold leading-snug text-ink transition-colors hover:text-gold-700"
                            >
                              <span className="underline decoration-gold/40 underline-offset-4 group-hover:decoration-gold">
                                {resource.title}
                              </span>
                              {external && (
                                <ExternalLink
                                  className="mt-1.5 h-4 w-4 shrink-0 text-ink-muted"
                                  aria-label="opens on the publisher's site"
                                />
                              )}
                            </a>
                          ) : (
                            <p className="text-lg font-semibold leading-snug text-ink">{resource.title}</p>
                          )}
                          <p className="mt-1 text-sm italic leading-relaxed text-ink-muted">{resource.author}</p>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
