import { motion, useReducedMotion } from 'framer-motion'
import {
  Accessibility, Award, BookOpen, Blocks, Cpu, Drama, Globe, HeartHandshake,
  Languages, Mail, Megaphone, Palette, Phone, Trophy,
} from 'lucide-react'
import { Educator } from '../types'

interface EducatorCardProps {
  educator: Educator
  index?: number
}

/**
 * An icon for the area of work, chosen from the coordinator's own job title.
 *
 * The title is the only reliable signal — category is broad (nine of these
 * people are simply "Teacher") and would give most of the team the same mark.
 * Matching on the title separates the Montessori stages from the CBC stages
 * from the Cambridge stages, which is the distinction a parent is scanning for.
 */
const iconFor = (educator: Educator) => {
  const title = educator.position?.toLowerCase() ?? ''
  if (title.includes('foreign language')) return Languages
  if (title.includes('sport')) return Trophy
  if (title.includes('performing')) return Drama
  if (title.includes('creative')) return Palette
  if (title.includes('communication')) return Megaphone
  if (title.includes('technology')) return Cpu
  if (title.includes('inclusive')) return Accessibility
  if (title.includes('integrated')) return HeartHandshake
  if (title.includes('montessori')) return Blocks
  if (title.includes('cbc')) return BookOpen
  if (title.includes('cambridge')) return Globe
  return Award
}

/** Initials, for a record whose photograph has not been supplied yet. */
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

export default function EducatorCard({ educator, index = 0 }: EducatorCardProps) {
  const Icon = iconFor(educator)
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      // Staggering twenty-one cards at a tenth of a second each would take two
      // seconds to finish. The delay is capped so the last row does not keep a
      // reader waiting.
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.06 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl"
    >
      <div className="relative aspect-[380/256] overflow-hidden bg-surface-muted">
        {educator.photo ? (
          <img
            src={educator.photo}
            alt={`${educator.name}, ${educator.position}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy-900">
            <span className="text-3xl font-semibold tracking-wide text-gold-500">
              {initials(educator.name)}
            </span>
          </div>
        )}
        {/* A soft wash at the foot of the photograph so the badge below never
            sits against a bright, busy part of the image. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="relative flex flex-1 flex-col p-6 pt-8">
        <span
          className="absolute -top-7 left-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface shadow-md transition-colors duration-500 group-hover:border-gold/50 group-hover:bg-tint-amber"
          aria-hidden="true"
        >
          <Icon className="h-6 w-6 text-gold-700" />
        </span>

        <h3 className="text-lg font-semibold leading-tight text-ink">{educator.name}</h3>
        <p className="mt-1.5 text-sm font-medium leading-snug text-gold-700">{educator.position}</p>

        {educator.biography && (
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{educator.biography}</p>
        )}

        {/* Everything below is written by Axis in the CMS and is empty for now,
            so each block stands or falls on its own rather than leaving a
            labelled heading above nothing. */}
        {educator.expertise && (
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{educator.expertise}</p>
        )}

        {/* Compared against zero rather than left as a bare length: `subjects`
            is an empty array on every record today, so `0 || 0` reached React
            as the number 0 and printed a stray "0" on all twenty-one cards. */}
        {((educator.subjects?.length ?? 0) > 0 || (educator.languages?.length ?? 0) > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {educator.subjects?.slice(0, 3).map((subject) => (
              <span key={subject} className="rounded-full bg-surface-sunk px-2.5 py-1 text-xs text-ink-muted">
                {subject}
              </span>
            ))}
            {educator.languages?.slice(0, 2).map((language) => (
              <span key={language} className="rounded-full bg-surface-sunk px-2.5 py-1 text-xs text-ink-muted">
                {language}
              </span>
            ))}
          </div>
        )}

        {/* mt-auto keeps this on the bottom edge, so the footers line up across
            a row whatever length the descriptions are. */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
          {/* ink-muted, not ink-faint: at this size the faint token measures
              4.07:1 against the card, below the 4.5 AA needs for small text. */}
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {educator.category}
          </span>
          <div className="ml-auto flex items-center gap-3">
            {educator.email && (
              <a
                href={`mailto:${educator.email}`}
                className="text-ink-muted transition-colors hover:text-gold-700"
                aria-label={`Email ${educator.name}`}
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {educator.phone && (
              <a
                href={`tel:${educator.phone}`}
                className="text-ink-muted transition-colors hover:text-gold-700"
                aria-label={`Call ${educator.name}`}
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
