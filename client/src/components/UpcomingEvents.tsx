import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, MapPin, Ticket, Users } from 'lucide-react'
import { eventsApi } from '../services/apiClient'
import { usePrefersReducedMotion } from '../motion'
import type { Event } from '../types'

/**
 * What is coming up, immediately below the hero.
 *
 * The first version of this was a row of text: a date, a title, a venue. It was
 * accurate and nobody would have looked at it. Axis had already paid a designer
 * for a poster for every event — bright, with the price and the dates on the
 * artwork — and the site was showing none of them. So the poster is now the
 * card, and the text supports it rather than replacing it.
 *
 * Three things make it work rather than merely look busy:
 *
 *   A live countdown. "In 12 days" does what a date cannot: it says the thing
 *   is close. It recomputes on a timer, so the section is never stale, and it
 *   switches to hours on the last day, when hours are what matter.
 *
 *   The price, up front. The posters say 2,500 KES; a parent deciding whether
 *   to read on wants that before they click, not after.
 *
 *   A real destination. Every card ends in "Book a place", pointing at the
 *   event's own registration link.
 *
 * On a phone it is a swipeable track with the next poster peeking in at the
 * edge, which is what tells a thumb there is more. It advances on its own every
 * seven seconds, and stops the moment anyone touches, hovers or tabs into it —
 * an auto-advancing carousel that fights the reader is worse than a static one.
 * Under prefers-reduced-motion it never moves by itself at all.
 *
 * The section still removes itself entirely once nothing is upcoming, and still
 * filters on the date rather than the stored status field, because every event
 * stays marked "Upcoming" until a person edits it.
 */

const MAX_SHOWN = 3
const ADVANCE_MS = 7000

function isStillUpcoming(event: Event, now: number): boolean {
  const finish = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
  if (Number.isNaN(finish.getTime())) return false
  return finish.getTime() >= now
}

/** "In 12 days", "Tomorrow", "Today", "In 3 hours" — never a bare date. */
function countdown(startDate: string, now: number): string {
  const start = new Date(startDate).getTime()
  const ms = start - now
  if (ms <= 0) return 'Happening now'

  const hours = ms / 3600000
  if (hours < 1) return `In ${Math.max(1, Math.round(ms / 60000))} minutes`
  if (hours < 24) return `In ${Math.round(hours)} hour${Math.round(hours) === 1 ? '' : 's'}`

  const days = Math.round(hours / 24)
  if (days === 1) return 'Tomorrow'
  if (days < 14) return `In ${days} days`
  if (days < 60) return `In ${Math.round(days / 7)} weeks`
  return `In ${Math.round(days / 30)} months`
}

function formatDate(value: string, end?: string | null) {
  const start = new Date(value)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const from = start.toLocaleDateString('en-KE', opts)
  if (!end) return from
  const to = new Date(end)
  if (to.toDateString() === start.toDateString()) return from
  return `${start.toLocaleDateString('en-KE', { day: 'numeric' })}–${to.toLocaleDateString('en-KE', opts)}`
}

function price(event: Event): string | null {
  const value = Number(event.priceKES)
  if (!event.priceKES || Number.isNaN(value) || value <= 0) return null
  return `KSh ${value.toLocaleString('en-KE')}`
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    eventsApi
      .getAll({ status: 'Upcoming', limit: 20 })
      .then((list) => {
        if (cancelled) return
        const at = Date.now()
        setEvents(
          (list ?? [])
            .filter((event) => isStillUpcoming(event, at))
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, MAX_SHOWN)
        )
      })
      .catch(() => {
        // Silent: this is an addition to the homepage, not the homepage.
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Keeps the countdown honest without re-rendering constantly.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const goTo = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[index] as HTMLElement | undefined
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }, [])

  // Advances only where the track actually scrolls, which is the narrow
  // viewports; on a wide one all three are already visible and moving them
  // would be motion for its own sake.
  useEffect(() => {
    if (reduceMotion || events.length < 2) return
    const timer = window.setInterval(() => {
      const track = trackRef.current
      if (!track || pausedRef.current) return
      if (track.scrollWidth <= track.clientWidth + 8) return
      setActive((current) => {
        const next = (current + 1) % events.length
        const card = track.children[next] as HTMLElement | undefined
        if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
        return next
      })
    }, ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [events.length, reduceMotion])

  const pause = () => {
    pausedRef.current = true
  }
  const resume = () => {
    pausedRef.current = false
  }

  if (events.length === 0) return null

  return (
    <section className="relative overflow-hidden border-b border-line bg-surface-sunk py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-gold-700">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">What&rsquo;s on</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">Upcoming at Axis</h2>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 underline-offset-4 hover:underline"
          >
            All events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/*
        * Full-bleed on a phone so a poster can run to the edge and the next one
        * can peek in — a card that stops short of the edge reads as the end of
        * the list. Padded back to the container on wider screens.
        */}
      <div
        ref={trackRef}
        onPointerEnter={pause}
        onPointerLeave={resume}
        onPointerDown={pause}
        onFocusCapture={pause}
        onBlurCapture={resume}
        onScroll={() => {
          const track = trackRef.current
          if (!track) return
          const cards = Array.from(track.children) as HTMLElement[]
          const nearest = cards.reduce(
            (best, card, index) =>
              Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft) < best.distance
                ? { index, distance: Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft) }
                : best,
            { index: 0, distance: Infinity }
          )
          setActive(nearest.index)
        }}
        className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:mx-auto lg:max-w-7xl lg:grid lg:snap-none lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event, index) => {
          const cost = price(event)

          return (
            <motion.article
              key={event.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: Math.min(index, 3) * 0.08 }}
              className="group relative flex w-[80vw] max-w-[20rem] flex-shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-xl sm:w-[22rem] lg:h-full lg:w-auto lg:max-w-none"
            >
              <Link to="/events" className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
                  {event.poster ? (
                    <img
                      src={event.poster}
                      alt={`${event.title} poster`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-gold-500/40" />
                    </div>
                  )}

                  {/* The countdown is the point of the whole section: it turns a
                      date into "soon". */}
                  <span className="absolute left-3 top-3 rounded-full bg-navy-900/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-gold-500 backdrop-blur">
                    {countdown(event.startDate, now)}
                  </span>

                  {/* Keeps the title legible over artwork of any brightness. */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/95 via-navy-900/60 to-transparent p-4 pt-10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-500">
                      {formatDate(event.startDate, event.endDate)}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold leading-snug text-white">{event.title}</h3>
                  </div>
                </div>
              </Link>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-1 text-xs text-ink-muted">
                  {event.venue && (
                    <p className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold-700" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </p>
                  )}
                  {event.ageGroup && (
                    <p className="flex items-start gap-1.5">
                      <Users className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold-700" />
                      <span>{event.ageGroup}</span>
                    </p>
                  )}
                  {cost && (
                    <p className="flex items-start gap-1.5 font-semibold text-ink">
                      <Ticket className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold-700" />
                      <span>{cost}</span>
                    </p>
                  )}
                </div>

                <Link
                  to={event.registrationLink && event.registrationLink.startsWith('/') ? event.registrationLink : '/events'}
                  className="btn-primary mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs"
                >
                  <Ticket className="h-4 w-4" />
                  Book a place
                </Link>
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* Position within the track. Hidden where every card is already on
          screen, and usable as controls rather than decoration. */}
      {events.length > 1 && (
        <div className="mt-4 flex justify-center gap-2 lg:hidden">
          {events.map((event, index) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                pause()
                setActive(index)
                goTo(index)
              }}
              aria-label={`Show ${event.title}`}
              aria-current={index === active}
              className={`h-2 rounded-full transition-all ${
                index === active ? 'w-6 bg-gold-500' : 'w-2 bg-line-strong'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
