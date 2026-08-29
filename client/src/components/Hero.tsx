import { motion, useReducedMotion } from 'framer-motion'
import { Phone, GraduationCap, MessageCircle, Sparkles, ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '../hooks'
import { contact, telHref } from '../content/contact'
import { Link } from 'react-router-dom'

/**
 * People first, operations second.
 *
 * These were three boxes led by "Nine services, kept clearly separate" — an
 * operational fact about how the site is organised, of no interest to a parent
 * deciding whether to call. Axis asked for the learning community to come
 * first and supplied these figures.
 *
 * The number carries the box, so it is set large with the label small beneath.
 */
const impact = [
  { value: '300+', label: 'Learners & Families Supported' },
  { value: '100+', label: 'Educators & Specialists' },
  { value: '9+', label: 'Learning & Enrichment Services' },
  { value: '47', label: 'Counties Within Reach' },
]

/**
 * The collage this space was always waiting for.
 *
 * It held a "What we do" panel listing four services in text — repeating in
 * words what the headline beside it had already said. It is now photographs of
 * Axis learners: choosing books, painting, following a story online, and
 * writing on the board. Shown rather than told, which the brief asks for twice,
 * and real learning environments rather than stock imagery.
 *
 * The gallery's own thumbnails are reused rather than new files — already sized
 * for a tile, and already on the page's cache path.
 */
const collage = [
  { src: '/gallery/books-smiles-and-good-vibes-thumb.jpg', alt: 'Learners choosing books in the reading corner', height: 'h-40 sm:h-48 lg:h-56' },
  { src: '/gallery/art-from-our-hearts-thumb.jpg', alt: 'A learner painting from observation', height: 'h-28 sm:h-36 lg:h-40' },
  { src: '/gallery/her-dream-thumb.jpg', alt: 'A learner following a story online', height: 'h-28 sm:h-36 lg:h-40' },
  { src: '/gallery/incoming-teacher-thumb.jpg', alt: 'A learner writing sight words on the board', height: 'h-40 sm:h-48 lg:h-56' },
]

export default function Hero() {
  const { ref, isVisible } = useScrollAnimation()
  const reduceMotion = useReducedMotion()

  return (
    <section ref={ref} className="relative flex min-h-[760px] items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_32%),linear-gradient(135deg,_#06101f_0%,_#13223f_100%)] pt-24">
      {/*
        * pointer-events-none, or this swallows every click in the hero.
        *
        * Two decorative rings inside a div stretched across the whole section.
        * It is invisible at 10% opacity and paints above the content, so it was
        * intercepting taps on the buttons beneath it — "Make an Enquiry",
        * "Book a Consultation" and the phone number all did nothing, on every
        * screen size. The primary route into an enquiry was dead, and nothing
        * about the page looked wrong.
        */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/*
          * Two pools of gold light, drifting against each other.
          *
          * Built from radial gradients rather than a blur filter: the gradient
          * already fades to nothing at its edge, so it looks the same and costs
          * a fraction as much to animate. A large blurred surface moving behind
          * the headline is the kind of thing that turns a mid-range Android
          * phone's fan on, and most of this site's visitors are on one.
          *
          * motion-safe, so a visitor who has asked their device for less
          * movement simply gets the gradient the section already had.
          */}
        <div className="absolute -left-32 -top-24 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.18),_transparent_65%)] motion-safe:animate-drift" />
        <div className="absolute -bottom-40 -right-28 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.13),_transparent_68%)] motion-safe:animate-drift-alt" />

        {/* The rings that were already here, now breathing rather than fixed. */}
        <div className="absolute inset-0 opacity-10 motion-safe:animate-breathe">
          <div className="absolute left-10 top-20 h-96 w-96 rounded-full border border-gold-500" />
          <div className="absolute bottom-18 right-20 h-64 w-64 rounded-full border border-gold-500" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface/10 px-4 py-2 text-sm text-gold-light backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Learn · Think · Create · Explore · Thrive
            </div>

            <h1 className="mb-6 text-5xl font-light leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Education<br />
              Tailored To<br />
              <span className="font-serif text-gold-500 italic">The Learner.</span>
            </h1>
            {/* Prominent, but lighter than the headline above it: a visitor
                should learn in the first few seconds that Axis is not only a
                homeschooling company, and each strand gets equal billing. */}
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              Kenya’s home of personalized homeschooling, academic support, Special Needs
              Education, modern foreign languages, sports and enrichment — built around every
              learner’s strength, interests, goals and aspirations.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              {/*
                The form starts an enquiry, not an enrolment — enrolment happens
                after a consultation. "Enroll Now" promised something the site
                does not do.
              */}
              <Link to="/enroll" className="btn-primary">
                <MessageCircle className="h-4 w-4" />
                Make an Enquiry
              </Link>
              <Link to="/consultation" className="btn-secondary">
                <GraduationCap className="h-4 w-4" />
                Book a Consultation
              </Link>
              <a href={telHref} className="btn-navy bg-surface/10 border border-white/20 hover:bg-surface/20">
                <Phone className="h-4 w-4" />
                {`Call ${contact.phoneDisplay}`}
              </a>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            /*
             * Visible on every screen.
             *
             * This carried `hidden lg:block` from the text panel it replaced —
             * reasonable then, because that panel repeated in words what the
             * headline beside it already said, so losing it on a phone lost
             * nothing. A collage of photographs is not redundant text. Hiding
             * it removed the whole visual from the device most parents will
             * actually open the site on, which is the opposite of what the
             * homepage review asked for.
             */
            className="relative lg:mt-0"
          >
            {/*
              Brief §19: "I do not want a website that only contains stock
              photographs." This was a collage of four Unsplash images — a
              toddler covered in paint, laboratory glassware, an anonymous hand
              — none of them Axis, none of them Kenyan, and one of them
              returning 404.

              Rather than substitute better stock, the space is given to what
              Axis actually offers, which is true and needs no permission. When
              real photography arrives it belongs here, and the grid below is
              sized to take it.
            */}
            <div className="relative mx-auto max-w-xl">
              {/* Outside the container on purpose, so it is clipped rather
                  than allowed to widen the page on a narrow screen. */}
              <div className="pointer-events-none absolute -left-8 -top-8 hidden h-48 w-48 rounded-full border-2 border-gold-500/30 lg:block" />

              {/* Staggered columns rather than a flat grid: the offset is what
                  stops four photographs reading as a contact sheet. */}
              {/*
                * The photographs arrive one after another and then drift.
                *
                * Four stills sitting perfectly still read as a placeholder
                * graphic. Each tile now fades up in turn, then breathes on a
                * long, slow loop — six to nine seconds, a few pixels, and every
                * tile on its own phase so they never move together and never
                * pulse. It should read as depth rather than as animation; a
                * visitor who looks straight at it should struggle to say what
                * is moving.
                *
                * Silent for anyone who has asked their system for less motion:
                * the entrance is skipped and the drift never starts.
                */}
              <div className="relative grid grid-cols-2 gap-3">
                {[collage.slice(0, 2), collage.slice(2)].map((column, columnIndex) => (
                  <div key={columnIndex} className={columnIndex === 1 ? 'space-y-3 pt-10' : 'space-y-3'}>
                    {column.map((shot, rowIndex) => {
                      const order = columnIndex * 2 + rowIndex
                      return (
                        <motion.img
                          key={shot.src}
                          src={shot.src}
                          alt={shot.alt}
                          loading="eager"
                          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
                          animate={
                            isVisible
                              ? reduceMotion
                                ? { opacity: 1 }
                                : { opacity: 1, y: [0, -7, 0], scale: 1 }
                              : {}
                          }
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : {
                                  opacity: { duration: 0.6, delay: 0.3 + order * 0.12 },
                                  scale: { duration: 0.6, delay: 0.3 + order * 0.12 },
                                  y: {
                                    duration: 6.5 + order * 0.8,
                                    delay: 0.3 + order * 0.12,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  },
                                }
                          }
                          whileHover={reduceMotion ? {} : { scale: 1.04, transition: { duration: 0.35 } }}
                          className={`w-full ${shot.height} cursor-default rounded-2xl border border-white/10 object-cover shadow-2xl`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

              <Link
                to="/gallery"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-500 transition-colors hover:text-gold-400"
              >
                See more of what Axis does
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/*
            * Its own row, spanning both columns.
            *
            * These sat under the buttons inside the left column, which on a
            * phone pushed the photographs about two screens down — past the
            * headline, the paragraph, three buttons, four figures and the
            * format band. The review asks a visitor to understand Axis "within
            * the first few seconds", and a visual nobody scrolls to does not
            * do that. Moved below the collage, the numbers also get the full
            * width, which suits figures meant to be visually dominant.
            */}
          <div className="lg:col-span-2">
            <div className="mb-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
              {impact.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-surface/10 p-4 backdrop-blur-sm">
                  <p className="text-3xl font-semibold leading-none text-gold-500">{item.value}</p>
                  <p className="mt-2 text-xs leading-snug text-white/70">{item.label}</p>
                </div>
              ))}
            </div>

            {/* "1:1 or small group" understated what Axis can arrange. The
                arrows read as a range rather than a pair of options. */}
            <div className="mb-8 rounded-2xl border border-gold/25 bg-gold/[0.07] p-4 backdrop-blur-sm">
              <p className="text-lg font-semibold text-gold-500">
                1:1 <span className="text-white/40">→</span> Small <span className="text-white/40">→</span> Group
              </p>
              <p className="mt-1 text-sm text-white/70">Flexible learning formats that fit the learner</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}