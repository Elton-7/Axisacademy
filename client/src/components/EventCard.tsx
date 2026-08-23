import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Tag, ExternalLink } from 'lucide-react'
import { Event, EventStatus } from '../types'

interface EventCardProps {
  event: Event
  index?: number
}

/**
 * The badge shares the panel tint rather than using a fixed -100 shade, which
 * stayed near-white in dark mode and read as a bright chip on a dark card.
 */
const statusColors: Record<EventStatus, { bg: string; text: string; badge: string }> = {
  Upcoming: { bg: 'bg-tint-blue', text: 'text-info', badge: 'bg-tint-blue' },
  Ongoing: { bg: 'bg-tint-positive', text: 'text-positive', badge: 'bg-tint-positive' },
  Completed: { bg: 'bg-surface-sunk', text: 'text-ink-muted', badge: 'bg-surface-muted' },
  Cancelled: { bg: 'bg-tint-critical', text: 'text-critical', badge: 'bg-tint-critical' },
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const colors = statusColors[event.status]
  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`overflow-hidden rounded-2xl border border-line shadow-sm hover:shadow-lg transition-all duration-300 ${colors.bg}`}
    >
      {/* Poster Image */}
      {event.poster && (
        <div className="h-48 overflow-hidden bg-surface-muted">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${colors.badge} ${colors.text}`}>
            {event.status}
          </span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-navy text-white`}>
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-ink mb-2">{event.title}</h3>

        {/* Description */}
        <p className="text-sm text-ink-muted line-clamp-2 mb-4">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2 mb-4 pb-4 border-b border-line-strong/50">
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Calendar className="h-4 w-4 text-gold flex-shrink-0" />
            <span className="font-medium">
              {formatDate(startDate)}
              {endDate && formatDate(startDate) !== formatDate(endDate) && ` - ${formatDate(endDate)}`}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <MapPin className="h-4 w-4 text-gold flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Capacity */}
          {event.capacity && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Users className="h-4 w-4 text-gold flex-shrink-0" />
              <span>Capacity: {event.capacity} participants</span>
            </div>
          )}

          {/* Programme */}
          {event.programme && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Tag className="h-4 w-4 text-gold flex-shrink-0" />
              <span>{event.programme}</span>
            </div>
          )}

          {/* Price */}
          {event.priceKES && (
            <div className="text-sm font-semibold text-gold-700">
              KES {event.priceKES.toLocaleString()}
            </div>
          )}

          {/* Age Group */}
          {event.ageGroup && (
            <div className="text-xs bg-surface/60 text-ink-muted px-2 py-1 rounded inline-block">
              Age: {event.ageGroup}
            </div>
          )}
        </div>

        {/* Registration Deadline */}
        {event.registrationDeadline && new Date(event.registrationDeadline) > new Date() && (
          <div className="text-xs text-ink-muted mb-4">
            Registration closes: {formatDate(new Date(event.registrationDeadline))}
          </div>
        )}

        {/* CTA Button */}
        {event.registrationLink && event.status !== 'Cancelled' && (
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gold text-navy-surface font-semibold rounded-lg hover:bg-gold/90 transition-colors"
          >
            Register Now
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {/* Results/Recap */}
        {event.status === 'Completed' && event.recap && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium text-ink hover:text-gold">View Event Recap</summary>
            <p className="mt-2 text-ink-muted whitespace-pre-wrap">{event.recap}</p>
          </details>
        )}
      </div>
    </motion.div>
  )
}
