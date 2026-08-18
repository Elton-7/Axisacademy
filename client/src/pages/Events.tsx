import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Loader, Calendar } from 'lucide-react'
import { Event, EventCategory, EventStatus } from '../types'
import { eventsApi } from '../services/apiClient'
import EventCard from '../components/EventCard'

const CATEGORIES: EventCategory[] = [
  'Holiday Tuition',
  'Exam Preparation',
  'Competition',
  'Workshop',
  'Cultural Event',
  'Sports Event',
  'Enrichment',
  'Other',
]

const STATUSES: EventStatus[] = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await eventsApi.getAll({ limit: 100 })
        const eventsList = Array.isArray(response) ? response : response.data || []
        setEvents(eventsList)
        setFilteredEvents(eventsList)
      } catch (err) {
        console.error('Failed to load events:', err)
        setError('Failed to load events. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Filter events based on category, status, and search
  useEffect(() => {
    let filtered = events

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory)
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((e) => e.status === selectedStatus)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.programme?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query)
      )
    }

    // Sort by start date
    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    setFilteredEvents(filtered)
  }, [selectedCategory, selectedStatus, searchQuery, events])

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
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-8 w-8 text-gold" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Axis Learning Events
              </h1>
            </div>
            <p className="text-lg text-white/80">
              Join our exciting events and programmes. From holiday tuition to competitions, workshops, and enrichment activities — there's something for every learner.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-slate-200 py-8 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events by title, description, programme, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            {/* Status and Category Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-navy/70 mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                      selectedStatus === 'all'
                        ? 'bg-navy text-white'
                        : 'bg-slate-100 text-navy hover:bg-slate-200'
                    }`}
                  >
                    All Events
                  </button>
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                        selectedStatus === status
                          ? 'bg-navy text-white'
                          : 'bg-slate-100 text-navy hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <label className="text-xs font-semibold text-navy/70 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gold text-navy'
                      : 'bg-slate-100 text-navy hover:bg-slate-200'
                  }`}
                >
                  <Filter className="inline-block h-4 w-4 mr-2" />
                  All Categories
                </button>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-gold text-navy'
                        : 'bg-slate-100 text-navy hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-navy/60">
              Showing {filteredEvents.length} of {events.length} events
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-slate-50 min-h-[60vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-8 w-8 text-gold animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-navy/30 mx-auto mb-4" />
              <p className="text-lg text-navy/60">
                {searchQuery ? 'No events match your search. Try a different query.' : 'No events found.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-navy to-navy/90 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Don't Miss Out</h2>
          <p className="text-lg text-white/80 mb-8">
            Looking for a specific programme or have questions about our events? Get in touch with us today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-3 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/enroll"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy transition-colors"
            >
              Make an Enquiry
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
