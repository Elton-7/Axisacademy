import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Search, Loader, Building2, Globe2, GraduationCap, Info, ArrowRight } from 'lucide-react'
import { Location, LocationType } from '../types'
import { locationsApi } from '../services/apiClient'

const LOCATION_TYPES: Array<'all' | LocationType> = [
  'all',
  'Head Office',
  'Learning Centre',
  'Partner Facility',
  'Educator Hub',
  'Home-Based Service',
]

/** All 47 counties (brief §16 — Axis is presented as a national network, not Nairobi-only). */
const counties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo',
  'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
  'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya',
  'Taita Taveta', 'Tana River', 'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga',
  'Wajir', 'West Pokot',
]

/** Brief §15 — the five distinctions Axis must not blur. */
const facilityTypes = [
  { type: 'Head Office', desc: 'Axis offices, supporting consultation, coordination and learner discovery.' },
  { type: 'Learning Centre', desc: 'Axis learning centres hosting Axis programmes directly.' },
  { type: 'Partner Facility', desc: 'Approved venues operated by partners, not owned by Axis.' },
  { type: 'Educator Hub', desc: 'Areas where network educators are based and available to travel.' },
  { type: 'Home-Based Service', desc: 'An Axis educator travels to the learner’s own home.' },
]

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'all' | LocationType>('all')
  const [selectedCounty, setSelectedCounty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const items = await locationsApi.getAll({ limit: 200 })
        setLocations(items)
      } catch (err) {
        console.error('Failed to load locations:', err)
        setError('Failed to load locations. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  useEffect(() => {
    let filtered = locations

    if (selectedType !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedType)
    }

    if (selectedCounty !== 'all') {
      filtered = filtered.filter((item) => item.county === selectedCounty)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.city?.toLowerCase().includes(query) ||
          item.county?.toLowerCase().includes(query) ||
          item.address?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    setFilteredLocations(filtered)
  }, [locations, selectedType, selectedCounty, searchQuery])

  const stats = useMemo(() => ({
    total: locations.length,
    centres: locations.filter((l) => l.type === 'Learning Centre').length,
    partner: locations.filter((l) => l.type === 'Partner Facility').length,
    headOffice: locations.filter((l) => l.type === 'Head Office').length,
  }), [locations])

  return (
    <>
      <section className="bg-gradient-to-br from-navy via-navy to-navy/90 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Our Locations</h1>
            </div>
            <p className="text-lg text-white/80">
              Axis Learning has a growing national network of learning centres, partner facilities, and educator hubs across Kenya — helping families access quality education wherever they are.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm leading-relaxed text-ink-muted">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
            <p><strong className="text-ink">A clear guide to our locations:</strong> Axis offices support consultation and coordination; learning centres host Axis programmes; partner facilities are approved venues; and educator hubs help us connect families with suitable educators. A listing does not necessarily mean Axis owns the facility.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {facilityTypes.map((facility) => (
              <div key={facility.type} className="rounded-xl border border-line p-5">
                <h2 className="font-semibold text-ink">{facility.type}</h2>
                <p className="mt-2 text-sm text-ink-muted">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-sunk py-10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Total locations</p>
            <p className="mt-3 text-3xl font-bold text-ink">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Learning centres</p>
            <p className="mt-3 text-3xl font-bold text-ink">{stats.centres}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Partner facilities</p>
            <p className="mt-3 text-3xl font-bold text-ink">{stats.partner}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Head office</p>
            <p className="mt-3 text-3xl font-bold text-ink">{stats.headOffice}</p>
          </div>
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
                placeholder="Search by city, county, or location name..."
                className="w-full rounded-lg border border-line-strong bg-surface pl-12 pr-4 py-2.5 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Location type</label>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                        selectedType === type ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-line'
                      }`}
                    >
                      {type === 'all' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">County</label>
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                >
                  <option value="all">All counties</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
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
          ) : filteredLocations.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink-muted">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-ink-muted/30" />
              No locations match your current filter.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredLocations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
                >
                  <div className="bg-gradient-to-br from-navy to-navy/80 p-5 text-white">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                        {location.type}
                      </span>
                      {location.type === 'Head Office' ? <Building2 className="h-5 w-5 text-gold" /> : location.type === 'Learning Centre' ? <GraduationCap className="h-5 w-5 text-gold" /> : <Globe2 className="h-5 w-5 text-gold" />}
                    </div>
                    <h3 className="text-2xl font-semibold">{location.name}</h3>
                  </div>

                  <div className="space-y-4 p-5 text-sm text-ink-muted">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <div>
                        <p>{location.address || 'Address available on request'}</p>
                        <p>{location.city || 'City'}, {location.county || 'County'}</p>
                      </div>
                    </div>

                    {location.description && <p className="leading-relaxed">{location.description}</p>}

                    {location.programmes && location.programmes.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Programmes</p>
                        <div className="flex flex-wrap gap-2">
                          {location.programmes.slice(0, 4).map((programme) => (
                            <span key={programme} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink">{programme}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-line pt-4 text-xs uppercase tracking-[0.15em] text-ink-muted">
                      {location.phone && <p className="mt-2">Phone: {location.phone}</p>}
                      {location.email && <p className="mt-2">Email: {location.email}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brief §16 — Axis presented as a national network, not a Nairobi-only organisation */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="section-label !text-left mb-3">Axis Across Kenya</div>
            <h2 className="text-3xl font-semibold text-ink">A national education network</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Axis Learning is not a Nairobi-only organisation. Through physical learning centres,
              partner facilities, home-based educators, online educators and our wider educator
              network, we are able to serve families in virtually every county.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              'Physical learning centres',
              'Partner facilities',
              'Home-based educators',
              'Online educators',
              'Our educator network',
            ].map((channel) => (
              <div key={channel} className="rounded-xl border border-line bg-surface-sunk p-5 text-sm font-medium text-ink">
                {channel}
              </div>
            ))}
          </div>

          {/*
            * Brief 16 names this exact reassurance as a major selling point,
            * and it answers the thing a parent actually does with a list of
            * places: scan for their own, fail to find it, and assume Axis
            * cannot reach them. It sits above the county list rather than
            * below it, so it is read before that conclusion is drawn.
            */}
          <div className="mt-10 rounded-2xl border border-gold/30 bg-tint-amber p-6 sm:p-8">
            <p className="text-lg font-semibold text-ink">Don&rsquo;t see your location listed?</p>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
              Don&rsquo;t worry. Axis connects families with educators through our growing national
              educator network, so where you live is rarely the obstacle it appears to be. Tell us
              where you are and we will tell you what is possible there.
            </p>
            <Link to="/enroll" className="btn-primary mt-5 inline-flex items-center gap-2">
              Tell us where you are
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              All 47 counties
            </p>
            <div className="flex flex-wrap gap-2">
              {counties.map((county) => (
                <button
                  key={county}
                  onClick={() => {
                    setSelectedCounty(county)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    selectedCounty === county
                      ? 'border-gold bg-gold text-navy-surface'
                      : 'border-line bg-surface text-ink-muted hover:border-gold hover:text-navy-surface'
                  }`}
                >
                  {county}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Don’t see your location? Don’t worry.</h2>
            <p className="mt-2 max-w-2xl text-white/75">
              Axis connects families with educators through our growing national educator network —
              online, home-based, centre-based or through an approved partner facility.
            </p>
          </div>
          <Link
            to="/enroll"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-navy-surface transition-colors hover:bg-gold-light"
          >
            Talk to an education consultant <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
