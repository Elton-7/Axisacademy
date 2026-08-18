import { motion } from 'framer-motion'
import { Mail, Phone, BookOpen, Languages } from 'lucide-react'
import { Educator } from '../types'

interface EducatorCardProps {
  educator: Educator
  index?: number
}

export default function EducatorCard({ educator, index = 0 }: EducatorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group overflow-hidden rounded-2xl bg-surface shadow-sm hover:shadow-lg transition-shadow duration-300 border border-line"
    >
      {/* Photo */}
      {educator.photo && (
        <div className="h-64 overflow-hidden bg-surface-muted">
          <img
            src={educator.photo}
            alt={educator.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Name and Position */}
        <h3 className="text-lg font-semibold text-ink mb-1">{educator.name}</h3>
        <p className="text-sm text-gold font-medium mb-3">{educator.position}</p>

        {/* Category */}
        <div className="inline-block mb-4">
          <span className="text-xs font-semibold bg-navy/10 text-ink px-3 py-1 rounded-full">
            {educator.category}
          </span>
        </div>

        {/* Qualifications */}
        {educator.qualifications && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-ink-muted/70 mb-1">QUALIFICATIONS</p>
            <p className="text-sm text-ink-muted/60 line-clamp-2">{educator.qualifications}</p>
          </div>
        )}

        {/* Expertise */}
        {educator.expertise && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-ink-muted/70 mb-1">EXPERTISE</p>
            <p className="text-sm text-ink-muted/60 line-clamp-2">{educator.expertise}</p>
          </div>
        )}

        {/* Subjects */}
        {educator.subjects && educator.subjects.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-ink-muted/70">SUBJECTS</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {educator.subjects.slice(0, 3).map((subject) => (
                <span key={subject} className="text-xs bg-tint-emerald text-positive px-2 py-1 rounded">
                  {subject}
                </span>
              ))}
              {educator.subjects.length > 3 && (
                <span className="text-xs text-ink-muted/60 px-2 py-1">+{educator.subjects.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {educator.languages && educator.languages.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-ink-muted/70">LANGUAGES</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {educator.languages.slice(0, 3).map((lang) => (
                <span key={lang} className="text-xs bg-tint-purple text-purple-700 px-2 py-1 rounded">
                  {lang}
                </span>
              ))}
              {educator.languages.length > 3 && (
                <span className="text-xs text-ink-muted/60 px-2 py-1">+{educator.languages.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="pt-4 border-t border-line space-y-2">
          {educator.email && (
            <a
              href={`mailto:${educator.email}`}
              className="flex items-center gap-2 text-sm text-ink-muted/70 hover:text-gold transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="truncate">{educator.email}</span>
            </a>
          )}
          {educator.phone && (
            <a
              href={`tel:${educator.phone}`}
              className="flex items-center gap-2 text-sm text-ink-muted/70 hover:text-gold transition-colors"
            >
              <Phone className="h-4 w-4" />
              {educator.phone}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
