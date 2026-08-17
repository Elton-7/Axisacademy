import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Loader, HelpCircle } from 'lucide-react'
import { FAQ, FAQCategory } from '../types'
import { faqsApi } from '../services/apiClient'

const CATEGORIES: FAQCategory[] = [
  'General',
  'Programmes & Curricula',
  'Enrollment',
  'Special Needs',
  'Languages',
  'Locations',
  'Fees & Payments',
  'Educators',
  'Portals & Learning',
  'Technical',
]

interface AccordionItemProps {
  faq: FAQ
  isOpen: boolean
  onToggle: () => void
  index: number
}

function AccordionItem({ faq, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border border-slate-200 rounded-lg overflow-hidden hover:border-gold/50 transition-colors"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
      >
        <span className="font-semibold text-navy flex-1">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-gold" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 text-navy/70 leading-relaxed whitespace-pre-wrap border-t border-slate-200">
          {faq.answer}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('General')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndexes, setOpenIndexes] = useState<number[]>([])

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const response = await faqsApi.getAll({ limit: 200 })
        const faqsList = Array.isArray(response) ? response : response.data || []
        setFaqs(faqsList)
        setFilteredFaqs(faqsList.filter((f: FAQ) => f.category === 'General'))
        setOpenIndexes([0]) // Open first FAQ by default
      } catch (err) {
        console.error('Failed to load FAQs:', err)
        setError('Failed to load FAQs. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  // Filter FAQs
  useEffect(() => {
    let filtered = faqs

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((f) => f.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (f) =>
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query)
      )
    }

    setFilteredFaqs(filtered)
    setOpenIndexes(filtered.length > 0 ? [0] : [])
  }, [selectedCategory, searchQuery, faqs])

  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <>
      {/* FAQPage markup — these questions are exactly the ones parents search for,
          so they are worth exposing as rich results. */}
      {faqs.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            })}
          </script>
        </Helmet>
      )}

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
              <HelpCircle className="h-8 w-8 text-gold" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-lg text-white/80">
              Find answers to common questions about Axis Learning programmes, services, enrollment, and more. Can't find what you're looking for? Contact us directly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white border-b border-slate-200 py-8 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-navy/70 mb-2 block">CATEGORY</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-navy text-white'
                      : 'bg-slate-100 text-navy hover:bg-slate-200'
                  }`}
                >
                  All
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
              Showing {filteredFaqs.length} of {faqs.length} questions
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-slate-50 min-h-[60vh]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-8 w-8 text-gold animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-navy/30 mx-auto mb-4" />
              <p className="text-lg text-navy/60 mb-6">
                {searchQuery ? 'No FAQs match your search. Try different keywords.' : 'No FAQs found.'}
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 transition-colors"
              >
                Contact Us for Help
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openIndexes.includes(index)}
                  onToggle={() => toggleAccordion(index)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-navy to-navy/90 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-lg text-white/80 mb-8">
            Our education consultants are here to help. Reach out to us and we'll guide you through the best learning pathway for your learner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-3 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="tel:0737003007"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy transition-colors"
            >
              Call Us: 0737 003 007
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
