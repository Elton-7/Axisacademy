import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Loader, Network, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Educator, EducatorCategory } from '../types'
import { educatorsApi } from '../services/apiClient'
import EducatorCard from '../components/EducatorCard'
import { Link } from 'react-router-dom'

const CATEGORIES: EducatorCategory[] = [
  'Leadership',
  'Education Consultant',
  'Teacher',
  'Tutor',
  'Language Educator',
  'Specialist Educator',
  'Coach',
  'Artist',
  'Administrator',
]

export default function Team() {
  const [educators, setEducators] = useState<Educator[]>([])
  const [filteredEducators, setFilteredEducators] = useState<Educator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchEducators = async () => {
      try {
        setLoading(true)
        const educatorsList = await educatorsApi.getAll()
        setEducators(educatorsList)
        setFilteredEducators(educatorsList)
      } catch (err) {
        console.error('Failed to load educators:', err)
        setError('Failed to load educators. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchEducators()
  }, [])

  // Filter educators based on category and search
  useEffect(() => {
    let filtered = educators

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.position.toLowerCase().includes(query) ||
          e.expertise?.toLowerCase().includes(query) ||
          e.qualifications?.toLowerCase().includes(query) ||
          e.subjects?.some((s) => s.toLowerCase().includes(query)) ||
          e.languages?.some((l) => l.toLowerCase().includes(query))
      )
    }

    setFilteredEducators(filtered)
  }, [selectedCategory, searchQuery, educators])

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy/90 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Our Educator Network
            </h1>
            <p className="text-lg text-white/80">
              Meet the passionate professionals dedicated to transforming education. Our network of experienced educators, specialists, and mentors are committed to helping every learner thrive.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="rounded-2xl bg-surface-sunk p-6"><Network className="mb-4 h-6 w-6 text-gold" /><h2 className="font-semibold text-ink">A growing network</h2><p className="mt-2 text-sm leading-relaxed text-ink-muted">Axis brings together teachers, tutors, specialists, coaches, artists, and other learning professionals.</p></div>
          <div className="rounded-2xl bg-surface-sunk p-6"><SlidersHorizontal className="mb-4 h-6 w-6 text-gold" /><h2 className="font-semibold text-ink">Matched to the learner</h2><p className="mt-2 text-sm leading-relaxed text-ink-muted">We begin by understanding the learner, then identify the expertise and support that can help them thrive.</p></div>
          <div className="rounded-2xl bg-surface-sunk p-6"><MapPin className="mb-4 h-6 w-6 text-gold" /><h2 className="font-semibold text-ink">Beyond one location</h2><p className="mt-2 text-sm leading-relaxed text-ink-muted">The network helps Axis support families through online, home-based, centre-based, and blended learning.</p></div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-surface border-b border-line py-8 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-ink-muted" />
              <input
                type="text"
                placeholder="Search by name, expertise, subjects, or languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-line-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-navy text-white'
                    : 'bg-surface-muted text-ink hover:bg-line'
                }`}
              >
                <Filter className="inline-block h-4 w-4 mr-2" />
                All Educators
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-navy text-white'
                      : 'bg-surface-muted text-ink hover:bg-line'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results count */}
            <p className="text-sm text-ink-muted">
              {educators.length > 0
                ? `Showing ${filteredEducators.length} of ${educators.length} educators`
                : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Educators Grid */}
      <section className="py-16 bg-surface-sunk min-h-[60vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-8 w-8 text-gold animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-tint-critical border border-line-critical rounded-lg p-6 text-center">
              <p className="text-critical font-medium">{error}</p>
            </div>
          ) : filteredEducators.length === 0 ? (
            <div className="py-12 text-center">
              {educators.length === 0 ? (
                <>
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-ink-muted/30" />
                  <p className="text-lg font-semibold text-ink">Our educator profiles are being prepared.</p>
                  <p className="mx-auto mt-2 max-w-lg text-ink-muted">
                    Axis works through a growing national network of teachers, tutors, language
                    educators, coaches and specialists. Individual profiles will appear here as each
                    educator's details and photograph are confirmed.
                  </p>
                  <Link to="/educator-network" className="mt-6 inline-block font-semibold text-gold-700 hover:underline">
                    How the educator network works
                  </Link>
                </>
              ) : (
                <p className="text-lg text-ink-muted">
                  {searchQuery ? 'No educators match your search. Try a different query.' : 'No educators in this category.'}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEducators.map((educator, index) => (
                <EducatorCard key={educator.id} educator={educator} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-navy to-navy/90 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Learn?</h2>
          <p className="text-lg text-white/80 mb-8">
            Connect with one of our educators and start your personalized learning journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/enroll?programme=Learner%20Discovery%20%26%20Consultancy"
              className="px-8 py-3 bg-gold text-navy-surface font-semibold rounded-lg hover:bg-gold/90 transition-colors"
            >
              Find the right educator
            </Link>
            <Link
              to="/enroll"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-surface hover:text-ink transition-colors"
            >
              Make an Enquiry
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
