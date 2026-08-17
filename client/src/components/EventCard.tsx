import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Tag, ExternalLink } from 'lucide-react'
import { Event, EventStatus } from '../types'

interface EventCardProps {
  event: Event
  index?: number
}

const statusColors: Record<EventStatus, { bg: string; text: string; badge: string }> = {
  Upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  Ongoing: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  Completed: { bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
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
      className={`overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ${colors.bg}`}
    >
      {/* Poster Image */}
      {event.poster && (
        <div className="h-48 overflow-hidden bg-slate-100">
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
        <h3 className="text-lg font-semibold text-navy mb-2">{event.title}</h3>

        {/* Description */}
        <p className="text-sm text-navy/70 line-clamp-2 mb-4">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2 mb-4 pb-4 border-b border-slate-300/50">
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-navy/60">
            <Calendar className="h-4 w-4 text-gold flex-shrink-0" />
            <span className="font-medium">
              {formatDate(startDate)}
              {endDate && formatDate(startDate) !== formatDate(endDate) && ` - ${formatDate(endDate)}`}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-navy/60">
              <MapPin className="h-4 w-4 text-gold flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Capacity */}
          {event.capacity && (
            <div className="flex items-center gap-2 text-sm text-navy/60">
              <Users className="h-4 w-4 text-gold flex-shrink-0" />
              <span>Capacity: {event.capacity} participants</span>
            </div>
          )}

          {/* Programme */}
          {event.programme && (
            <div className="flex items-center gap-2 text-sm text-navy/60">
              <Tag className="h-4 w-4 text-gold flex-shrink-0" />
              <span>{event.programme}</span>
            </div>
          )}

          {/* Price */}
          {event.priceKES && (
            <div className="text-sm font-semibold text-gold">
              KES {event.priceKES.toLocaleString()}
            </div>
          )}

          {/* Age Group */}
          {event.ageGroup && (
            <div className="text-xs bg-white/60 text-navy/70 px-2 py-1 rounded inline-block">
              Age: {event.ageGroup}
            </div>
          )}
        </div>

        {/* Registration Deadline */}
        {event.registrationDeadline && new Date(event.registrationDeadline) > new Date() && (
          <div className="text-xs text-navy/60 mb-4">
            Registration closes: {formatDate(new Date(event.registrationDeadline))}
          </div>
        )}

        {/* CTA Button */}
        {event.registrationLink && event.status !== 'Cancelled' && (
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 transition-colors"
          >
            Register Now
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {/* Results/Recap */}
        {event.status === 'Completed' && event.recap && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium text-navy hover:text-gold">View Event Recap</summary>
            <p className="mt-2 text-navy/70 whitespace-pre-wrap">{event.recap}</p>
          </details>
        )}
      </div>
    </motion.div>
  )
}
