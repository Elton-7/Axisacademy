import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Loader, Search, Sparkles } from 'lucide-react'
import { Partner, PartnerCategory } from '../types'
import { safeExternalUrl } from '../utils/safeUrl'
import { partnersApi } from '../services/apiClient'

const CATEGORIES: Array<'all' | PartnerCategory> = ['all', 'Corporate', 'Educational Institution', 'Tech Partner', 'Content Provider', 'Community Partner']

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | PartnerCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true)
        const list = await partnersApi.getAll({ limit: 100 })
        setPartners(list)
      } catch (err) {
        console.error('Failed to load partners:', err)
        setError('Failed to load partners. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [])

  useEffect(() => {
    let filtered = partners

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.focusAreas?.join(' ').toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    setFilteredPartners(filtered)
  }, [partners, selectedCategory, searchQuery])

  const stats = useMemo(() => ({
    total: partners.length,
    categories: new Set(partners.map((p) => p.category)).size,
  }), [partners])

  return (
    <>
      <section className="bg-gradient-to-br from-navy via-navy to-navy/90 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Our Partners</h1>
            </div>
            <p className="text-lg text-white/80">
              Collaborating with trusted educational, corporate, and community partners to deliver holistic learning experiences across Kenya.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hidden until there is something to count. A row of large zeros
              reads as a broken page rather than as one still being filled;
              the empty state below explains the wait properly. */}
          {partners.length > 0 && (
          <div className="grid gap-4 rounded-2xl border border-line bg-surface-sunk p-4 shadow-sm md:grid-cols-3">
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Partners</p>
              <p className="mt-3 text-3xl font-bold text-ink">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Categories</p>
              <p className="mt-3 text-3xl font-bold text-ink">{stats.categories}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Network</p>
              <p className="mt-3 text-lg font-semibold text-ink">Growing</p>
            </div>
          </div>
          )}
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
                placeholder="Search partners by name, description, or focus area..."
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
                    className={`rounded-full px-4 py-3 text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-line'}`}
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
          ) : filteredPartners.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink-muted">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-ink-muted/30" />
              {partners.length === 0 ? (
                <>
                  <p className="font-semibold text-ink">Our partnerships are being confirmed.</p>
                  <p className="mx-auto mt-2 max-w-md text-sm">
                    We name an organisation here only once they have agreed to it in writing, so this
                    page stays empty until those confirmations are in hand.
                  </p>
                </>
              ) : (
                'No partners match your current filters.'
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredPartners.map((partner, index) => (
                <motion.article
                  key={partner.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center min-h-[180px]">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="h-24 w-auto object-contain" />
                    ) : (
                      <div className="w-20 h-20 bg-navy/10 rounded-lg flex items-center justify-center">
                        <Users className="h-10 w-10 text-ink-muted/30" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink">{partner.category}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-ink">{partner.name}</h3>
                      {partner.description && <p className="mt-2 text-sm leading-relaxed text-ink-muted line-clamp-3">{partner.description}</p>}
                    </div>

                    {partner.focusAreas && partner.focusAreas.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {partner.focusAreas.slice(0, 3).map((area) => (
                          <span key={area} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-muted">{area}</span>
                        ))}
                      </div>
                    )}

                    {(partner.website || partner.email || partner.phone) && (
                      <div className="space-y-2 border-t border-line pt-4">
                        {/* Validated before it becomes an href: this value is
                            typed into the CMS, and a javascript: URL in an href
                            executes when a visitor clicks it. */}
                        {safeExternalUrl(partner.website) && (
                          <a href={safeExternalUrl(partner.website) ?? undefined} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">
                            Visit website →
                          </a>
                        )}
                        {partner.email && <p className="text-xs text-ink-muted">{partner.email}</p>}
                        {partner.phone && <p className="text-xs text-ink-muted">{partner.phone}</p>}
                      </div>
                    )}
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
